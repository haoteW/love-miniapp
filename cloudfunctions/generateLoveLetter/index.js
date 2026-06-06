const https = require('https');
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const DEFAULT_API_URL = 'https://api.deepseek.com/chat/completions';
const DEFAULT_MODEL = 'deepseek-v4-flash';

function normalizeList(list, mapper, limit) {
  return Array.isArray(list) ? list.slice(0, limit).map(mapper).filter(Boolean) : [];
}

function buildPrompt(event) {
  const style = event.style || '温柔治愈';
  const inputs = event.inputs || {};
  const context = event.context || {};
  const diaries = normalizeList(context.diaries, (item) => ({
    title: item.title || '',
    content: item.content || '',
    date: item.date || item.createdAt || ''
  }), 5);
  const anniversaries = normalizeList(context.anniversaries, (item) => ({
    title: item.title || '',
    date: item.date || '',
    note: item.note || ''
  }), 3);
  const completedWishes = normalizeList(context.completedWishes, (item) => ({
    title: item.title || '',
    category: item.category || ''
  }), 20);

  return [
    '你是一个温柔、真诚、会写中文情书的助手。',
    '请根据情侣小程序中的记录，写一封适合直接发给伴侣的中文情书。',
    '要求：',
    '- 不要编造不存在的具体事件。',
    '- 不要提到你是 AI。',
    '- 语气自然、亲密、克制，不要油腻。',
    '- 分 4 到 7 个自然段，适合手机阅读。',
    '- 如果用户提供补充信息，要优先融入。',
    '',
    `情书风格：${style}`,
    `恋爱天数：${context.loveDays || 1}`,
    `相册照片数量：${context.albumCount || 0}`,
    `想对 TA 说的话：${inputs.words || '未填写'}`,
    `最近发生的小事：${inputs.smallThings || '未填写'}`,
    `希望表达的情绪：${inputs.emotion || '未填写'}`,
    `最近日记：${JSON.stringify(diaries)}`,
    `最近纪念日：${JSON.stringify(anniversaries)}`,
    `已完成心愿：${JSON.stringify(completedWishes)}`
  ].join('\n');
}

function getApiConfig() {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  const apiUrl = process.env.AI_API_URL || process.env.AI_API_BASE_URL || DEFAULT_API_URL;
  const model = process.env.AI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return {
      error: '缺少云函数环境变量 AI_API_KEY，请在云开发控制台配置后重新部署。'
    };
  }

  return {
    apiKey,
    apiUrl,
    model
  };
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

    req.on('timeout', () => {
      req.destroy(new Error('AI API 调用超时，请稍后重试。'));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function extractContent(data) {
  if (data.output_text) return data.output_text;
  if (Array.isArray(data.choices) && data.choices[0]) {
    const choice = data.choices[0];
    if (choice.message && choice.message.content) return choice.message.content;
    if (choice.text) return choice.text;
  }
  return '';
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const config = getApiConfig();

  if (config.error) {
    return {
      ok: false,
      message: config.error
    };
  }

  const prompt = buildPrompt(event);

  try {
    const data = await requestJson(config.apiUrl, config.apiKey, {
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你只输出情书正文，不输出标题、解释或列表。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.85,
      max_tokens: 900
    });
    const content = extractContent(data).trim();

    if (!content) {
      return {
        ok: false,
        message: 'AI API 未返回情书内容，请检查模型配置。'
      };
    }

    return {
      ok: true,
      userOpenid: OPENID,
      content
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || 'AI API 调用失败，请稍后重试。'
    };
  }
};
