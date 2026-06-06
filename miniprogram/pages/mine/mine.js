const { STORAGE_KEYS } = require('../../utils/constants');
const { getUserProfile } = require('../../utils/data');

Page({
  data: {
    profile: {}
  },

  async onShow() {
    const profile = await getUserProfile(STORAGE_KEYS.PROFILE);
    this.setData({ profile });
  },

  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  },

  goBind() {
    wx.navigateTo({ url: '/pages/bind/bind' });
  },

  goSetup() {
    wx.navigateTo({ url: '/pages/setup-love/setup-love' });
  },

  async setupDatabase() {
    wx.showLoading({ title: '初始化中' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'setupDatabase'
      });
      const ok = res.result && res.result.ok;
      wx.hideLoading();
      wx.showToast({
        title: ok ? '初始化完成' : '请看控制台',
        icon: ok ? 'success' : 'none'
      });
      console.log('setupDatabase result', res.result);
    } catch (error) {
      console.error('setupDatabase failed', error);
      wx.hideLoading();
      wx.showToast({ title: '请先部署云函数', icon: 'none' });
    }
  }
});
