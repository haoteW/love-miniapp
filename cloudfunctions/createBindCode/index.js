const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const now = Date.now();
  const expiredAt = new Date(now + 30 * 60 * 1000);
  const code = createCode();

  await db.collection('bind_codes').add({
    data: {
      code,
      creatorOpenid: OPENID,
      status: 'unused',
      expiredAt,
      createdAt: db.serverDate(),
      usedAt: null
    }
  });

  return {
    code,
    expiredAt
  };
};
