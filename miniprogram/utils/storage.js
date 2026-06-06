function getValue(key, fallback = null) {
  const value = wx.getStorageSync(key);
  return value || fallback;
}

function setValue(key, value) {
  wx.setStorageSync(key, value);
}

function getList(key, fallback = []) {
  const value = wx.getStorageSync(key);
  return Array.isArray(value) ? value : fallback;
}

function addItem(key, item) {
  const list = getList(key);
  const nextItem = {
    id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: new Date().toISOString(),
    ...item
  };
  wx.setStorageSync(key, [nextItem, ...list]);
  return nextItem;
}

module.exports = {
  addItem,
  getList,
  getValue,
  setValue
};
