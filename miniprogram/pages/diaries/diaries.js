const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { getCollectionList } = require('../../utils/data');

Page({
  data: {
    items: []
  },

  async onShow() {
    const items = await getCollectionList(COLLECTIONS.DIARIES, STORAGE_KEYS.DIARIES, [
      {
        id: 'demo-1',
        title: '今天一起散步',
        date: '2026-06-06',
        content: '风很舒服，路灯也很好看。'
      }
    ]);
    this.setData({ items });
  },

  add() {
    wx.navigateTo({ url: '/pages/diary-edit/diary-edit' });
  },

  previewImage(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.current,
      urls: event.currentTarget.dataset.images
    });
  }
});
