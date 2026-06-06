const { formatDate } = require('../../utils/date');
const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { addCollectionItem } = require('../../utils/data');
const { uploadImages } = require('../../utils/upload');

Page({
  data: {
    title: '',
    date: formatDate(new Date()),
    category: '',
    description: '',
    images: []
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onDateChange(event) {
    this.setData({ date: event.detail.value });
  },

  onCategoryInput(event) {
    this.setData({ category: event.detail.value });
  },

  onDescriptionInput(event) {
    this.setData({ description: event.detail.value });
  },

  chooseImages() {
    wx.chooseMedia({
      count: 9 - this.data.images.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: this.data.images.concat(res.tempFiles.map((file) => file.tempFilePath))
        });
      }
    });
  },

  previewImage(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.current,
      urls: this.data.images
    });
  },

  async save() {
    if (!this.data.title) {
      wx.showToast({ title: '请填写心愿标题', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    const images = await uploadImages(this.data.images, 'wishes');

    await addCollectionItem(COLLECTIONS.WISHES, STORAGE_KEYS.WISHES, {
      title: this.data.title,
      category: this.data.category || '其他',
      description: this.data.description,
      images,
      date: this.data.date,
      status: 'todo',
      statusText: '未完成'
    });

    wx.hideLoading();
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
