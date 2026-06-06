const { formatDate } = require('../../utils/date');
const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { addCollectionItem } = require('../../utils/data');
const { uploadImages } = require('../../utils/upload');

Page({
  data: {
    title: '',
    date: formatDate(new Date()),
    locationName: '',
    note: '',
    images: []
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onDateChange(event) {
    this.setData({ date: event.detail.value });
  },

  onLocationInput(event) {
    this.setData({ locationName: event.detail.value });
  },

  onNoteInput(event) {
    this.setData({ note: event.detail.value });
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
      wx.showToast({ title: '请填写约会标题', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    const images = await uploadImages(this.data.images, 'checkins');

    await addCollectionItem(COLLECTIONS.CHECKINS, STORAGE_KEYS.CHECKINS, {
      title: this.data.title,
      locationName: this.data.locationName || '未填写地点',
      note: this.data.note,
      images,
      date: this.data.date
    });

    wx.hideLoading();
    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 600);
  }
});
