const { formatDate } = require('../../utils/date');
const { STORAGE_KEYS } = require('../../utils/constants');
const { getValue, setValue } = require('../../utils/storage');

Page({
  data: {
    loveStartDate: formatDate(new Date())
  },

  onLoad() {
    this.setData({
      loveStartDate: getValue(STORAGE_KEYS.LOVE_START_DATE, formatDate(new Date()))
    });
  },

  onDateChange(event) {
    this.setData({
      loveStartDate: event.detail.value
    });
  },

  save() {
    setValue(STORAGE_KEYS.LOVE_START_DATE, this.data.loveStartDate);
    wx.showToast({
      title: '已保存',
      icon: 'success'
    });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
