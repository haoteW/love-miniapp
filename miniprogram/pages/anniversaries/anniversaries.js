const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { getCollectionList } = require('../../utils/data');

Page({
  data: {
    items: []
  },

  async onShow() {
    const items = await getCollectionList(COLLECTIONS.ANNIVERSARIES, STORAGE_KEYS.ANNIVERSARIES, [
      {
        id: 'demo-1',
        title: '第一次见面',
        date: '2024-02-14',
        daysText: '每年提醒'
      }
    ]);
    this.setData({ items });
  },

  add() {
    wx.navigateTo({ url: '/pages/anniversary-edit/anniversary-edit' });
  }
});
