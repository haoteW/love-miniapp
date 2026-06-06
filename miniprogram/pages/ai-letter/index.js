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

  buildLocalMock(payload) {
    const { style, inputs, context } = payload;
    const diaryText = context.diaries.map((item) => item.title || item.content).filter(Boolean).slice(0, 3).join('、');
    const wishText = context.completedWishes.map((item) => item.title).filter(Boolean).slice(0, 3).join('、');
    const lines = [
      `亲爱的，这是一封${style}风格的情书。`,
      `我们已经一起走过 ${context.loveDays} 天，每一天都在悄悄把喜欢变得更具体。`
    ];

    if (inputs.words) lines.push(`我想对你说：${inputs.words}`);
    if (inputs.smallThings) lines.push(`最近让我记住的小事是：${inputs.smallThings}。`);
    if (inputs.emotion) lines.push(`我想把「${inputs.emotion}」认真传达给你。`);
    if (diaryText) lines.push(`最近的日记里有 ${diaryText}，这些都是我们的小小宇宙。`);
    if (wishText) lines.push(`我们完成过的心愿，比如 ${wishText}，都让我更期待以后。`);
    if (context.albumCount) lines.push(`相册里的 ${context.albumCount} 张照片，也在替我记住你。`);
    lines.push('未来还有很多天，我都想和你一起慢慢写下去。');

    return lines.join('\n\n');
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
      const content = res.result && res.result.content;
      if (!content) {
        throw new Error('Empty love letter content');
      }
      this.setData({
        generatedContent: content,
        isGenerating: false
      });
    } catch (error) {
      console.warn('生成情书失败，使用本地 mock 文案', error);
      this.setData({
        generatedContent: this.buildLocalMock(payload),
        isGenerating: false
      });
      wx.showToast({ title: '已使用本地生成', icon: 'none' });
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
