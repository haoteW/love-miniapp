const { formatDate } = require('../../utils/date');
const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { addCollectionItem } = require('../../utils/data');
const { uploadImages } = require('../../utils/upload');

Page({
  data: {
    title: '',
    content: '',
    date: formatDate(new Date()),
    images: []
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onContentInput(event) {
    this.setData({ content: event.detail.value });
  },

  onDateChange(event) {
    this.setData({ date: event.detail.value });
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
    if (!this.data.title || !this.data.content) {
      wx.showToast({ title: '请填写标题和内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    const images = await uploadImages(this.data.images, 'diaries');

    await addCollectionItem(COLLECTIONS.DIARIES, STORAGE_KEYS.DIARIES, {
      title: this.data.title,
      content: this.data.content,
      images,
      date: this.data.date
    });

    wx.hideLoading();
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
