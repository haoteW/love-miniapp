const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

function normalizeList(list, mapper) {
  return Array.isArray(list) ? list.slice(0, 5).map(mapper).filter(Boolean) : [];
}

function buildMockLetter(event) {
  const style = event.style || '温柔治愈';
  const inputs = event.inputs || {};
  const context = event.context || {};
  const diaries = normalizeList(context.diaries, (item) => item.title || item.content);
  const anniversaries = normalizeList(context.anniversaries, (item) => item.title);
  const wishes = normalizeList(context.completedWishes, (item) => item.title);
  const loveDays = context.loveDays || 1;
  const albumCount = context.albumCount || 0;

  const styleOpenings = {
    温柔治愈: '亲爱的，想把今天的温柔都悄悄放进这封信里。',
    甜蜜撒娇: '亲爱的，今天也想黏着你，把心里的甜都说给你听。',
    深情告白: '亲爱的，有些喜欢越过了时间，最后都变成了想和你一直走下去的确定。',
    道歉和好: '亲爱的，我认真想了想，还是想先把对不起和我爱你都好好说给你听。',
    纪念日专属: '亲爱的，属于我们的日子又多了一层柔软的光。',
    异地恋安慰: '亲爱的，距离把我们分开一点点，却也把想念拉得更长。'
  };

  const parts = [
    styleOpenings[style] || styleOpenings.温柔治愈,
    `我们已经一起走过了 ${loveDays} 天，这个数字不只是时间，也是一次次认真靠近。`
  ];

  if (inputs.words) {
    parts.push(`我最想对你说的是：${inputs.words}`);
  }

  if (inputs.smallThings) {
    parts.push(`最近这件小事我一直记得：${inputs.smallThings}。它让我觉得，我们的生活虽然普通，却很值得珍惜。`);
  }

  if (inputs.emotion) {
    parts.push(`我希望你能感受到：${inputs.emotion}。`);
  }

  if (diaries.length) {
    parts.push(`翻到最近的日记，我想起了「${diaries.join('」、「')}」，那些片段像小小的星星，一颗一颗照亮我们。`);
  }

  if (anniversaries.length) {
    parts.push(`还有那些重要的日子：${anniversaries.join('、')}，每一个都在提醒我，你一直是我想认真对待的人。`);
  }

  if (wishes.length) {
    parts.push(`我们已经完成过 ${wishes.length} 个心愿，比如 ${wishes.join('、')}。以后还想和你一起把更多愿望慢慢实现。`);
  }

  if (albumCount) {
    parts.push(`相册里已经有 ${albumCount} 张关于我们的照片，每一张都像在替我说：和你在一起，真好。`);
  }

  parts.push('谢谢你来到我的生活里。接下来的日子，也请继续牵着我的手，我们慢慢爱，慢慢记录，慢慢把平凡过成只属于我们的浪漫。');

  return parts.join('\n\n');
}

exports.main = async (event) => {
  // TODO: Replace this mock generator with a real AI API call.
  // Suggested payload: { style, inputs, context, userOpenid }.
  const { OPENID } = cloud.getWXContext();

  return {
    ok: true,
    userOpenid: OPENID,
    content: buildMockLetter(event)
  };
};
