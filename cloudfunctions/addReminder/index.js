const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event) => {
  const result = await db.collection('reminders').add({
    data: {
      coupleId: event.coupleId,
      targetType: event.targetType,
      targetId: event.targetId,
      title: event.title,
      remindAt: new Date(event.remindAt),
      receiverOpenids: event.receiverOpenids || [],
      status: 'pending',
      createdAt: db.serverDate(),
      sentAt: null
    }
  });

  return {
    ok: true,
    id: result._id
  };
};
