App({
  globalData: {
    user: null,
    couple: null
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    const cloudEnv = 'prod-d3gtmcrcg1cc5f9d6';
    if (cloudEnv === 'your-cloud-env-id') {
      console.warn('尚未配置云开发环境，当前仅使用本地演示数据');
      return;
    }

    wx.cloud.init({
      env: cloudEnv,
      traceUser: true
    });
  }
});
