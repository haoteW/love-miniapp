const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const code = String(event.code || '').trim();

  if (!code) {
    return { ok: false, message: '缺少绑定码' };
  }

  const codeResult = await db.collection('bind_codes')
    .where({
      code,
      status: 'unused',
      expiredAt: _.gt(new Date())
    })
    .limit(1)
    .get();

  if (!codeResult.data.length) {
    return { ok: false, message: '绑定码无效或已过期' };
  }

  const bindCode = codeResult.data[0];
  if (bindCode.creatorOpenid === OPENID) {
    return { ok: false, message: '不能绑定自己' };
  }

  const coupleResult = await db.collection('couples').add({
    data: {
      userAOpenid: bindCode.creatorOpenid,
      userBOpenid: OPENID,
      loveStartDate: '',
      bindStatus: 'active',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });

  const coupleId = coupleResult._id;
  await db.collection('users').where({
    openid: _.in([bindCode.creatorOpenid, OPENID])
  }).update({
    data: {
      coupleId,
      updatedAt: db.serverDate()
    }
  });

  await db.collection('bind_codes').doc(bindCode._id).update({
    data: {
      status: 'used',
      usedAt: db.serverDate()
    }
  });

  return {
    ok: true,
    coupleId
  };
};
