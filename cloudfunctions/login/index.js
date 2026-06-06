const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async () => {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();

  return {
    openid: OPENID,
    appid: APPID,
    unionid: UNIONID
  };
};
