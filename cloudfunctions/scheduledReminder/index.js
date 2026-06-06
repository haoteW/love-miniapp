const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async () => {
  const result = await db.collection('reminders')
    .where({
      status: 'pending',
      remindAt: _.lte(new Date())
    })
    .limit(50)
    .get();

  // TODO: Send WeChat subscription reminders here after the message template is configured.
  // 中文：配置微信订阅消息模板后，在这里发送提醒。
  await Promise.all(result.data.map((item) => db.collection('reminders').doc(item._id).update({
    data: {
      status: 'sent',
      sentAt: db.serverDate()
    }
  })));

  return {
    ok: true,
    count: result.data.length
  };
};
