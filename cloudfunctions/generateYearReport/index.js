const https = require('https');
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const DEFAULT_API_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-v4-flash';

function parseDate(value) {
  if (!value) return null;
  const raw = value && typeof value.toDate === 'function' ? value.toDate() : value;
  const date = raw instanceof Date ? raw : new Date(String(raw).replace(/-/g, '/'));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isInYear(item, year) {
  const date = parseDate(item.date || item.createdAt);
  return date ? date.getFullYear() === year : false;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function countImages(items) {
  return items.reduce((total, item) => total + ((item.images || []).length), 0);
}

function getMonthName(monthIndex) {
  return `${monthIndex + 1}月`;
}

function getTopMonth(items) {
  const counts = Array(12).fill(0);
  items.forEach((item) => {
    const date = parseDate(item.date || item.createdAt);
    if (date) counts[date.getMonth()] += 1;
  });
  const max = Math.max(...counts);
  if (!max) return '暂无记录';
  return getMonthName(counts.indexOf(max));
}

function pickHighlights(diaries) {
  return diaries
    .slice()
    .sort((a, b) => {
      const aScore = (a.images || []).length * 20 + String(a.content || '').length;
      const bScore = (b.images || []).length * 20 + String(b.content || '').length;
      return bScore - aScore;
    })
    .slice(0, 5)
    .map((item) => ({
      title: item.title || '一篇日记',
      date: formatDate(item.date || item.createdAt),
      summary: String(item.content || '').slice(0, 80)
    }));
}

async function getCurrentUser(openid) {
  const userRes = await db.collection('users').where({ openid }).limit(1).get();
  return userRes.data[0] || { openid, coupleId: '' };
}

async function getCoupleOpenids(user) {
  if (!user.coupleId) return [user.openid];
  const coupleRes = await db.collection('couples').doc(user.coupleId).get().catch(() => null);
  const couple = coupleRes && coupleRes.data ? coupleRes.data : {};
  return [couple.userAOpenid, couple.userBOpenid, user.openid].filter(Boolean);
}

function buildScopeQuery(user, openids) {
  const clauses = [{ _openid: _.in(openids) }];
  if (user.coupleId) {
    clauses.push({ coupleId: user.coupleId });
  }
  return clauses.length > 1 ? _.or(clauses) : clauses[0];
}

async function getScopedCollection(name, user, openids) {
  const res = await db.collection(name)
    .where(buildScopeQuery(user, openids))
    .orderBy('createdAt', 'desc')
    .limit(1000)
    .get();
  return res.data || [];
}

async function ensureCollection(name) {
  try {
    await db.createCollection(name);
  } catch (error) {
    const message = error.message || '';
    const isExisting = message.includes('already exist') || message.includes('collection exists') || error.errCode === -501001;
    if (!isExisting) throw error;
  }
}

function buildStats(year, loveStartDate, diaries, wishes, anniversaries, checkins) {
  const yearEnd = new Date(year, 11, 31);
  const loveStart = parseDate(loveStartDate);
  const loveDays = loveStart ? Math.max(1, Math.floor((yearEnd - loveStart) / 86400000) + 1) : 1;
  const completedWishes = wishes.filter((item) => item.status === 'done');
  const allRecords = diaries.concat(wishes, anniversaries, checkins);

  return {
    loveDays,
    diaryCount: diaries.length,
    checkinCount: checkins.length,
    photoCount: countImages(diaries) + countImages(wishes) + countImages(checkins),
    completedWishCount: completedWishes.length,
    anniversaryCount: anniversaries.length,
    topMonth: getTopMonth(allRecords)
  };
}

function buildPrompt(report) {
  return [
    '请为情侣小程序生成一份中文年度恋爱报告。',
    '风格要求：温柔、真实、不油腻、有仪式感，像年度回忆册。',
    '输出 800 字以内，结构清晰，适合直接展示在小程序卡片里。',
    '请返回 JSON，字段为 content、closingLine、keywords。',
    'content 是年度总结正文，closingLine 是给彼此的一句话，keywords 是 3 到 6 个中文关键词数组。',
    '',
    JSON.stringify(report)
  ].join('\n');
}

function requestJson(url, apiKey, payload) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const body = JSON.stringify(payload);
    const req = https.request({
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || 443,
      path: `${target.pathname}${target.search}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: 25000
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8');
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (error) {
          reject(new Error(`AI API 返回内容不是 JSON：${text.slice(0, 200)}`));
          return;
        }
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const message = data.error && data.error.message ? data.error.message : text;
          reject(new Error(`AI API 调用失败（${res.statusCode}）：${message}`));
          return;
        }
        resolve(data);
      });
    });

    req.on('timeout', () => req.destroy(new Error('AI API 调用超时，请稍后重试。')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractText(data) {
  if (data.output_text) return data.output_text;
  if (Array.isArray(data.choices) && data.choices[0]) {
    const choice = data.choices[0];
    if (choice.message && choice.message.content) return choice.message.content;
    if (choice.text) return choice.text;
  }
  return '';
}

function parseAiReport(text, fallback) {
  const raw = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  try {
    const data = JSON.parse(raw);
    return {
      content: data.content || fallback.content,
      closingLine: data.closingLine || fallback.closingLine,
      keywords: Array.isArray(data.keywords) && data.keywords.length ? data.keywords.slice(0, 6) : fallback.keywords
    };
  } catch (error) {
    return {
      ...fallback,
      content: raw || fallback.content
    };
  }
}

function buildMockReport(year, stats, highlights) {
  const firstHighlight = highlights[0] ? `，比如「${highlights[0].title}」` : '';
  return {
    content: `${year} 年，你们把日子过成了一本慢慢翻开的回忆册。一起走过的 ${stats.loveDays} 天里，有 ${stats.diaryCount} 篇日记、${stats.photoCount} 张照片、${stats.completedWishCount} 个完成的心愿，也有 ${stats.anniversaryCount} 个值得认真记住的纪念日${firstHighlight}。最常被记录的是 ${stats.topMonth}，那些普通的瞬间，因为被你们写下来，就有了很柔软的重量。愿下一年依然有很多小事值得期待，也有很多句“我在”被好好兑现。`,
    closingLine: '愿我们继续把平凡的日子，过成只属于彼此的浪漫。',
    keywords: ['陪伴', '记录', '心愿', '纪念', '温柔']
  };
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const year = Number(event.year) || new Date().getFullYear();
  const user = await getCurrentUser(OPENID);
  const openids = await getCoupleOpenids(user);
  const [diaryItems, wishItems, anniversaryItems, checkinItems] = await Promise.all([
    getScopedCollection('diaries', user, openids),
    getScopedCollection('wishes', user, openids),
    getScopedCollection('anniversaries', user, openids),
    getScopedCollection('checkins', user, openids)
  ]);
  const diaries = diaryItems.filter((item) => isInYear(item, year));
  const wishes = wishItems.filter((item) => isInYear(item, year));
  const anniversaries = anniversaryItems.filter((item) => isInYear(item, year));
  const checkins = checkinItems.filter((item) => isInYear(item, year));
  const completedWishes = wishes.filter((item) => item.status === 'done')
    .map((item) => ({ title: item.title || '一个心愿', date: formatDate(item.date || item.updatedAt) }));
  const anniversaryList = anniversaries
    .map((item) => ({ title: item.title || '纪念日', date: formatDate(item.date || item.createdAt), note: item.note || '' }));
  const highlights = pickHighlights(diaries);
  const stats = buildStats(year, user.loveStartDate, diaries, wishes, anniversaries, checkins);
  const baseReport = {
    year,
    stats,
    highlights,
    completedWishes,
    anniversaries: anniversaryList
  };
  const mock = buildMockReport(year, stats, highlights);
  const apiKey = process.env.DEEPSEEK_API_KEY;
  let aiReport = mock;
  let aiMode = 'mock';

  if (apiKey) {
    try {
      const data = await requestJson(process.env.DEEPSEEK_API_URL || DEFAULT_API_URL, apiKey, {
        model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: '你只输出 JSON，不输出 markdown 或解释。'
          },
          {
            role: 'user',
            content: buildPrompt(baseReport)
          }
        ],
        temperature: 0.78,
        max_tokens: 1100
      });
      aiReport = parseAiReport(extractText(data), mock);
      aiMode = 'deepseek';
    } catch (error) {
      aiReport = {
        ...mock,
        content: `${mock.content}\n\n（AI 生成服务暂时不可用，本次已使用本地年度报告模板。）`
      };
    }
  }

  const report = {
    coupleId: user.coupleId || '',
    userId: OPENID,
    year,
    stats,
    highlights,
    completedWishes,
    anniversaries: anniversaryList,
    content: aiReport.content,
    closingLine: aiReport.closingLine,
    keywords: aiReport.keywords,
    aiMode,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };
  await ensureCollection('year_reports');
  const saveRes = await db.collection('year_reports').add({ data: report });

  return {
    ok: true,
    reportId: saveRes._id,
    report: {
      _id: saveRes._id,
      ...report,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };
};
