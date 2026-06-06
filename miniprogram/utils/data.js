const { getList, setValue } = require('./storage');

const db = wx.cloud ? wx.cloud.database() : null;

function hasCloud() {
  return Boolean(wx.cloud && db);
}

function withFallback(operation, fallback) {
  if (!hasCloud()) return Promise.resolve(fallback());
  return operation().catch((error) => {
    console.warn('云数据库操作失败，使用本地缓存兜底', error);
    return fallback();
  });
}

function getCollectionList(collectionName, storageKey, fallbackItems = [], orderField = 'createdAt') {
  return withFallback(
    () => db.collection(collectionName)
      .orderBy(orderField, 'desc')
      .get()
      .then((res) => {
        const items = res.data || [];
        setValue(storageKey, items);
        return items.length ? items : fallbackItems;
      }),
    () => getList(storageKey, fallbackItems)
  );
}

function getLocalProfileMeta() {
  const profile = wx.getStorageSync('profile') || {};
  return {
    creatorGender: profile.gender || 0,
    creatorGenderText: profile.genderText || '不展示',
    creatorRole: profile.role || 'hidden',
    creatorRoleText: profile.roleText || '不展示'
  };
}

function addCollectionItem(collectionName, storageKey, item) {
  const nextItem = {
    createdAt: new Date(),
    updatedAt: new Date(),
    ...getLocalProfileMeta(),
    ...item
  };

  return withFallback(
    () => db.collection(collectionName).add({ data: nextItem }).then((res) => ({
      id: res._id,
      _id: res._id,
      ...nextItem
    })),
    () => {
      const list = getList(storageKey);
      const localItem = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        ...nextItem
      };
      setValue(storageKey, [localItem, ...list]);
      return localItem;
    }
  );
}

function updateCollectionDoc(collectionName, id, data) {
  if (!hasCloud()) return Promise.resolve({ ok: false });
  return db.collection(collectionName).doc(id).update({
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
}

function getOpenid() {
  if (!wx.cloud) return Promise.resolve('');
  return wx.cloud.callFunction({ name: 'login' })
    .then((res) => res.result.openid)
    .catch((error) => {
      console.warn('获取 openid 失败', error);
      return '';
    });
}

async function getUserProfile(storageKey) {
  const localProfile = wx.getStorageSync(storageKey) || {};
  if (!hasCloud()) return localProfile;

  return withFallback(
    async () => {
      const openid = await getOpenid();
      if (!openid) return localProfile;
      const res = await db.collection('users').where({ openid }).limit(1).get();
      const profile = res.data[0] || localProfile;
      setValue(storageKey, profile);
      return profile;
    },
    () => localProfile
  );
}

async function saveUserProfile(storageKey, profile) {
  const nextProfile = {
    ...profile,
    updatedAt: new Date()
  };
  setValue(storageKey, nextProfile);

  if (!hasCloud()) return nextProfile;

  return withFallback(
    async () => {
      const openid = await getOpenid();
      if (!openid) return nextProfile;
      const res = await db.collection('users').where({ openid }).limit(1).get();
      if (res.data.length) {
        await db.collection('users').doc(res.data[0]._id).update({
          data: nextProfile
        });
        return {
          ...res.data[0],
          ...nextProfile
        };
      }

      const created = {
        openid,
        createdAt: new Date(),
        ...nextProfile
      };
      const addRes = await db.collection('users').add({ data: created });
      return {
        _id: addRes._id,
        ...created
      };
    },
    () => nextProfile
  );
}

module.exports = {
  addCollectionItem,
  getCollectionList,
  getOpenid,
  getUserProfile,
  saveUserProfile,
  updateCollectionDoc
};
