const { STORAGE_KEYS } = require('../../utils/constants');
const { getList } = require('../../utils/storage');

const typeConfig = {
  anniversary: {
    title: '纪念日',
    storageKey: STORAGE_KEYS.ANNIVERSARIES
  },
  diary: {
    title: '恋爱日记',
    storageKey: STORAGE_KEYS.DIARIES
  },
  checkin: {
    title: '约会打卡',
    storageKey: STORAGE_KEYS.CHECKINS
  },
  wish: {
    title: '心愿',
    storageKey: STORAGE_KEYS.WISHES
  }
};

function findRecord(type, id) {
  const config = typeConfig[type];
  if (!config) return null;
  return getList(config.storageKey).find((item) => String(item._id || item.id) === String(id));
}

Page({
  data: {
    typeTitle: '',
    record: null,
    fields: [],
    images: []
  },

  onLoad(options) {
    const { type, id } = options;
    const config = typeConfig[type];
    const record = findRecord(type, id);

    if (!config || !record) {
      wx.showToast({ title: '记录不存在', icon: 'none' });
      return;
    }

    wx.setNavigationBarTitle({ title: config.title });
    this.setData({
      typeTitle: config.title,
      record,
      fields: this.buildFields(type, record),
      images: record.images || []
    });
  },

  buildFields(type, record) {
    const fields = [
      { label: '日期', value: record.date || record.createdAt || '' }
    ];

    if (type === 'anniversary') {
      fields.push({ label: '备注', value: record.note || record.daysText || '' });
    }

    if (type === 'diary') {
      fields.push({ label: '内容', value: record.content || '' });
    }

    if (type === 'checkin') {
      fields.push({ label: '地点', value: record.locationName || '' });
      fields.push({ label: '地址', value: record.address || '' });
      fields.push({ label: '备注', value: record.note || '' });
    }

    if (type === 'wish') {
      fields.push({ label: '分类', value: record.category || '' });
      fields.push({ label: '状态', value: record.statusText || '' });
      fields.push({ label: '描述', value: record.description || '' });
    }

    return fields.filter((item) => item.value);
  },

  previewImage(event) {
    wx.previewImage({
      current: event.currentTarget.dataset.current,
      urls: this.data.images
    });
  }
});
