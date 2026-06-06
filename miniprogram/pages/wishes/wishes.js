const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { getCollectionList, updateCollectionDoc } = require('../../utils/data');
const { setValue } = require('../../utils/storage');

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
    const item = this.data.items.find((current) => String(current._id || current.id) === String(id));
    if (!item) return;

    const isDone = item.status === 'done';
    const nextStatus = {
      status: isDone ? 'todo' : 'done',
      statusText: isDone ? '未完成' : '已完成',
      completedAt: isDone ? null : new Date()
    };
    const items = this.data.items.map((current) => (
      String(current._id || current.id) === String(id)
        ? { ...current, ...nextStatus }
        : current
    ));

    this.setData({ items });
    setValue(STORAGE_KEYS.WISHES, items);

    if (item._id) {
      await updateCollectionDoc(COLLECTIONS.WISHES, item._id, nextStatus);
    }
  },

  previewImage(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.current,
      urls: event.currentTarget.dataset.images
    });
  }
});
