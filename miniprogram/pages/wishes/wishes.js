const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { getCollectionList, updateCollectionDoc } = require('../../utils/data');

Page({
  data: {
    items: []
  },

  async onShow() {
    const items = await getCollectionList(COLLECTIONS.WISHES, STORAGE_KEYS.WISHES, [
      {
        id: 'demo-1',
        title: '一起去海边看日出',
        category: '旅行',
        status: 'todo',
        statusText: '未完成'
      }
    ]);
    this.setData({ items });
  },

  add() {
    wx.navigateTo({ url: '/pages/wish-edit/wish-edit' });
  },

  async toggleDone(event) {
    const id = event.currentTarget.dataset.id;
    const item = this.data.items.find((current) => (current._id || current.id) === id);
    if (!item || !item._id) return;

    const isDone = item.status === 'done';
    await updateCollectionDoc(COLLECTIONS.WISHES, item._id, {
      status: isDone ? 'todo' : 'done',
      statusText: isDone ? '未完成' : '已完成',
      completedAt: isDone ? null : new Date()
    });
    this.onShow();
  },

  previewImage(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.current,
      urls: event.currentTarget.dataset.images
    });
  }
});
