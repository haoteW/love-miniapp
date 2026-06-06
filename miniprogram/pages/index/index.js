const { diffDays, formatDate } = require('../../utils/date');
const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { getValue } = require('../../utils/storage');
const { getCollectionList } = require('../../utils/data');

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

Page({
  data: {
    loveStartDate: '',
    loveDays: 1,
    nextAnniversaryText: '还没有纪念日，去添加一个吧',
    latestCheckinText: '还没有打卡记录，去记录一次约会吧',
    calendarTitle: '',
    weekdays: WEEKDAYS,
    calendarDays: []
  },

  onLoad() {
    this.refreshLoveDays();
  },

  onShow() {
    this.refreshLoveDays();
  },

  async refreshLoveDays() {
    const loveStartDate = getValue(STORAGE_KEYS.LOVE_START_DATE, '2024-02-14');
    const [anniversaries, diaries, checkins, wishes] = await Promise.all([
      getCollectionList(COLLECTIONS.ANNIVERSARIES, STORAGE_KEYS.ANNIVERSARIES, []),
      getCollectionList(COLLECTIONS.DIARIES, STORAGE_KEYS.DIARIES, []),
      getCollectionList(COLLECTIONS.CHECKINS, STORAGE_KEYS.CHECKINS, []),
      getCollectionList(COLLECTIONS.WISHES, STORAGE_KEYS.WISHES, [])
    ]);
    const nextAnniversary = anniversaries[0];
    const latestCheckin = checkins[0];

    this.setData({
      loveStartDate,
      loveDays: diffDays(loveStartDate),
      nextAnniversaryText: nextAnniversary
        ? `${nextAnniversary.title} · ${nextAnniversary.date}`
        : '还没有纪念日，去添加一个吧',
      latestCheckinText: latestCheckin
        ? `${latestCheckin.title} · ${latestCheckin.date || '刚刚'}`
        : '还没有打卡记录，去记录一次约会吧',
      ...this.buildCalendar({
        anniversaries,
        diaries,
        checkins,
        wishes
      })
    });
  },

  buildCalendar(records) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const markedMap = this.getMarkedDateMap(records);
    const calendarDays = [];

    for (let index = 0; index < firstDay.getDay(); index += 1) {
      calendarDays.push({
        key: `empty-${index}`,
        empty: true
      });
    }

    for (let day = 1; day <= totalDays; day += 1) {
      const date = formatDate(new Date(year, month, day));
      calendarDays.push({
        key: date,
        day,
        date,
        isToday: day === today.getDate(),
        dots: markedMap[date] || []
      });
    }

    return {
      calendarTitle: `${year}年${month + 1}月`,
      calendarDays
    };
  },

  getMarkedDateMap({ anniversaries, diaries, checkins, wishes }) {
    const map = {};
    anniversaries.forEach((item) => this.pushDateDot(map, item.date, item.creatorGender));
    diaries.forEach((item) => this.pushDateDot(map, item.date || item.createdAt, item.creatorGender));
    checkins.forEach((item) => this.pushDateDot(map, item.date || item.createdAt, item.creatorGender));
    wishes.forEach((item) => this.pushDateDot(map, item.date || item.createdAt, item.creatorGender));
    return map;
  },

  pushDateDot(map, value, gender) {
    if (!value) return;
    const date = value instanceof Date ? value : new Date(String(value).replace(/-/g, '/'));
    if (Number.isNaN(date.getTime())) return;
    const key = formatDate(date);
    const dotType = Number(gender) === 1 ? 'male' : 'female';
    const dots = map[key] || [];
    if (!dots.includes(dotType)) {
      dots.push(dotType);
    }
    map[key] = dots;
  },

  goSetup() {
    wx.navigateTo({ url: '/pages/setup-love/setup-love' });
  },

  goAnniversaries() {
    wx.navigateTo({ url: '/pages/anniversaries/anniversaries' });
  },

  goDiaryEdit() {
    wx.navigateTo({ url: '/pages/diary-edit/diary-edit' });
  },

  goCheckinEdit() {
    wx.navigateTo({ url: '/pages/checkin-edit/checkin-edit' });
  },

  goCheckins() {
    wx.navigateTo({ url: '/pages/checkins/checkins' });
  },

  goWishEdit() {
    wx.navigateTo({ url: '/pages/wish-edit/wish-edit' });
  }
});
