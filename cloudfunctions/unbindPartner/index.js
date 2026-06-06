const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const userResult = await db.collection('users').where({ openid: OPENID }).limit(1).get();

  if (!userResult.data.length || !userResult.data[0].coupleId) {
    return { ok: false, message: '当前没有绑定关系' };
  }

  const coupleId = userResult.data[0].coupleId;

  await db.collection('couples').doc(coupleId).update({
    data: {
      bindStatus: 'inactive',
      updatedAt: db.serverDate()
    }
  });

  await db.collection('users').where({ coupleId }).update({
    data: {
      coupleId: '',
      updatedAt: db.serverDate()
    }
  });

  return { ok: true };
};
