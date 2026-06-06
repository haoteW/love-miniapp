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
    calendarDays: [],
    selectedDate: '',
    selectedDateRecords: [],
    calendarRecordMap: {}
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
    const recordMap = this.getCalendarRecordMap(records);
    const selectedDate = this.data.selectedDate || formatDate(today);
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
        isSelected: date === selectedDate,
        records: recordMap[date] || [],
        dots: this.getDots(recordMap[date] || [])
      });
    }

    return {
      calendarTitle: `${year}年${month + 1}月`,
      calendarDays,
      calendarRecordMap: recordMap,
      selectedDate,
      selectedDateRecords: recordMap[selectedDate] || []
    };
  },

  getCalendarRecordMap({ anniversaries, diaries, checkins, wishes }) {
    const map = {};
    anniversaries.forEach((item) => this.pushCalendarRecord(map, item, 'anniversary', '纪念日', item.date, item.note || item.daysText));
    diaries.forEach((item) => this.pushCalendarRecord(map, item, 'diary', '日记', item.date || item.createdAt, item.content));
    checkins.forEach((item) => this.pushCalendarRecord(map, item, 'checkin', '打卡', item.date || item.createdAt, item.locationName || item.note));
    wishes.forEach((item) => this.pushCalendarRecord(map, item, 'wish', '心愿', item.date || item.createdAt, item.category || item.statusText));
    return map;
  },

  getDateKey(value) {
    if (!value) return;
    const rawDate = value && typeof value.toDate === 'function' ? value.toDate() : value;
    const date = rawDate instanceof Date ? rawDate : new Date(String(rawDate).replace(/-/g, '/'));
    if (Number.isNaN(date.getTime())) return;
    return formatDate(date);
  },

  pushCalendarRecord(map, item, type, typeText, value, summary) {
    const key = this.getDateKey(value);
    if (!key) return;
    const records = map[key] || [];
    const id = item._id || item.id || `${type}-${records.length}`;
    records.push({
      id,
      uid: `${type}-${id}`,
      type,
      typeText,
      title: item.title || typeText,
      summary: summary || '',
      date: key,
      gender: Number(item.creatorGender) === 1 ? 'male' : 'female'
    });
    map[key] = records;
  },

  getDots(records) {
    const dots = [];
    records.forEach((record) => {
      const dotType = record.gender;
      if (!dots.includes(dotType)) {
        dots.push(dotType);
      }
    });
    return dots;
  },

  selectCalendarDay(event) {
    const date = event.currentTarget.dataset.date;
    if (!date) return;
    const selectedDateRecords = this.data.calendarRecordMap[date] || [];
    if (!selectedDateRecords.length) return;
    const calendarDays = this.data.calendarDays.map((item) => ({
      ...item,
      isSelected: item.date === date
    }));

    this.setData({
      selectedDate: date,
      selectedDateRecords,
      calendarDays
    });
  },

  goRecordDetail(event) {
    const { type, id } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-detail/record-detail?type=${type}&id=${encodeURIComponent(id)}`
    });
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
