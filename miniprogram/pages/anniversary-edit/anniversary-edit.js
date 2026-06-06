const { formatDate } = require('../../utils/date');
const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { addCollectionItem } = require('../../utils/data');

Page({
  data: {
    title: '',
    date: formatDate(new Date()),
    note: ''
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onDateChange(event) {
    this.setData({ date: event.detail.value });
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value });
  },

  async save() {
    if (!this.data.title || !this.data.date) {
      wx.showToast({ title: '请填写名称和日期', icon: 'none' });
      return;
    }

    await addCollectionItem(COLLECTIONS.ANNIVERSARIES, STORAGE_KEYS.ANNIVERSARIES, {
      title: this.data.title,
      date: this.data.date,
      note: this.data.note,
      daysText: '每年提醒'
    });

    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
