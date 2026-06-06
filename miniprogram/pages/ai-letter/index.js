const { diffDays } = require('../../utils/date');
const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { getValue } = require('../../utils/storage');
const { addCollectionItem, getCollectionList, getOpenid } = require('../../utils/data');

const styleOptions = [
  '温柔治愈',
  '甜蜜撒娇',
  '深情告白',
  '道歉和好',
  '纪念日专属',
  '异地恋安慰'
];

Page({
  data: {
    styleOptions,
    activeStyleIndex: 0,
    words: '',
    smallThings: '',
    emotion: '',
    loveDays: 1,
    recentDiaries: [],
    recentAnniversaries: [],
    completedWishes: [],
    albumCount: 0,
    generatedContent: '',
    isGenerating: false,
    isSaved: false
  },

  onLoad() {
    this.loadContext();
  },

  onShow() {
    this.loadContext();
  },

  async loadContext() {
    const loveStartDate = getValue(STORAGE_KEYS.LOVE_START_DATE, '2024-02-14');
    const [diaries, anniversaries, wishes, checkins] = await Promise.all([
      getCollectionList(COLLECTIONS.DIARIES, STORAGE_KEYS.DIARIES, []),
      getCollectionList(COLLECTIONS.ANNIVERSARIES, STORAGE_KEYS.ANNIVERSARIES, []),
      getCollectionList(COLLECTIONS.WISHES, STORAGE_KEYS.WISHES, []),
      getCollectionList(COLLECTIONS.CHECKINS, STORAGE_KEYS.CHECKINS, [])
    ]);
    const completedWishes = wishes.filter((item) => item.status === 'done');
    const albumCount = this.countImages(diaries) + this.countImages(checkins) + this.countImages(wishes);

    this.setData({
      loveDays: diffDays(loveStartDate),
      recentDiaries: diaries.slice(0, 5),
      recentAnniversaries: anniversaries.slice(0, 3),
      completedWishes,
      albumCount
    });
  },

  countImages(items) {
    return items.reduce((total, item) => total + ((item.images || []).length), 0);
  },

  selectStyle(event) {
    this.setData({
      activeStyleIndex: Number(event.currentTarget.dataset.index),
      isSaved: false
    });
  },

  onWordsInput(event) {
    this.setData({ words: event.detail.value, isSaved: false });
  },

  onSmallThingsInput(event) {
    this.setData({ smallThings: event.detail.value, isSaved: false });
  },

  onEmotionInput(event) {
    this.setData({ emotion: event.detail.value, isSaved: false });
  },

  getPayload() {
    return {
      style: this.data.styleOptions[this.data.activeStyleIndex],
      inputs: {
        words: this.data.words,
        smallThings: this.data.smallThings,
        emotion: this.data.emotion
      },
      context: {
        loveDays: this.data.loveDays,
        diaries: this.data.recentDiaries,
        anniversaries: this.data.recentAnniversaries,
        completedWishes: this.data.completedWishes,
        albumCount: this.data.albumCount
      }
    };
  },

  async generateLetter() {
    const payload = this.getPayload();
    this.setData({ isGenerating: true, isSaved: false });
    wx.showLoading({ title: '生成中' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'generateLoveLetter',
        data: payload
      });
      const result = res.result || {};
      if (result.ok === false) {
        throw new Error(result.message || '生成失败，请稍后重试');
      }
      const content = result.content;
      if (!content) {
        throw new Error('Empty love letter content');
      }
      this.setData({
        generatedContent: content,
        isGenerating: false
      });
    } catch (error) {
      console.warn('生成情书失败', error);
      this.setData({
        isGenerating: false
      });
      wx.showModal({
        title: '生成失败',
        content: error.message || 'AI API 调用失败，请稍后重试。',
        showCancel: false
      });
      return;
    } finally {
      wx.hideLoading();
    }
  },

  copyLetter() {
    if (!this.data.generatedContent) return;
    wx.setClipboardData({
      data: this.data.generatedContent
    });
  },

  async saveLetter() {
    if (!this.data.generatedContent) {
      wx.showToast({ title: '请先生成情书', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    const userId = await getOpenid();
    const payload = this.getPayload();
    await addCollectionItem(COLLECTIONS.LOVE_LETTERS, STORAGE_KEYS.LOVE_LETTERS, {
      coupleId: '',
      userId,
      style: payload.style,
      inputText: [
        payload.inputs.words,
        payload.inputs.smallThings,
        payload.inputs.emotion
      ].filter(Boolean).join('\n'),
      content: this.data.generatedContent
    });
    wx.hideLoading();
    this.setData({ isSaved: true });
    wx.showToast({ title: '已保存', icon: 'success' });
  }
});
