Page({
  data: {
    bindCode: '',
    inputCode: '',
    expiredAt: ''
  },

  async createCode() {
    wx.showLoading({ title: '生成中' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'createBindCode'
      });
      this.setData({
        bindCode: res.result.code,
        expiredAt: res.result.expiredAt
      });
    } catch (error) {
      console.warn('生成绑定码失败，使用本地演示码', error);
      const code = String(Math.floor(100000 + Math.random() * 900000));
      this.setData({ bindCode: code, expiredAt: '' });
    } finally {
      wx.hideLoading();
    }
  },

  onCodeInput(event) {
    this.setData({ inputCode: event.detail.value });
  },

  async bindPartner() {
    if (!this.data.inputCode) {
      wx.showToast({ title: '请输入绑定码', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '绑定中' });
    try {
      const res = await wx.cloud.callFunction({
        name: 'bindPartner',
        data: {
          code: this.data.inputCode
        }
      });

      if (!res.result.ok) {
        wx.showToast({ title: res.result.message || '绑定失败', icon: 'none' });
        return;
      }

      wx.showToast({ title: '绑定成功', icon: 'success' });
    } catch (error) {
      console.warn('绑定失败', error);
      wx.showToast({ title: '请先部署云函数', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
