const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const now = db.serverDate();
  const users = db.collection('users');
  const current = await users.where({ openid: OPENID }).limit(1).get();

  if (current.data.length) {
    return {
      user: current.data[0],
      isNew: false
    };
  }

  const user = {
    openid: OPENID,
    nickName: event.nickName || '',
    avatarUrl: event.avatarUrl || '',
    coupleId: '',
    loveStartDate: '',
    createdAt: now,
    updatedAt: now
  };

  const result = await users.add({ data: user });

  return {
    user: {
      _id: result._id,
      ...user
    },
    isNew: true
  };
};
