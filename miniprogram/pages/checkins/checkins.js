const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { getCollectionList } = require('../../utils/data');

Page({
  data: {
    items: []
  },

  async onShow() {
    const items = await getCollectionList(COLLECTIONS.CHECKINS, STORAGE_KEYS.CHECKINS, [
      {
        id: 'demo-1',
        title: '周末电影',
        date: '2026-06-06',
        locationName: '电影院'
      }
    ]);
    this.setData({ items });
  },

  add() {
    wx.navigateTo({ url: '/pages/checkin-edit/checkin-edit' });
  },

  previewImage(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.current,
      urls: event.currentTarget.dataset.images
    });
  }
});
