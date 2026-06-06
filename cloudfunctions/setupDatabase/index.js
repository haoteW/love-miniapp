const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const COLLECTIONS = [
  'users',
  'couples',
  'bind_codes',
  'anniversaries',
  'diaries',
  'checkins',
  'wishes',
  'reminders'
];

async function createCollection(name) {
  try {
    await db.createCollection(name);
    return { name, created: true };
  } catch (error) {
    const message = error.message || '';
    const isExisting = message.includes('already exist') || message.includes('collection exists') || error.errCode === -501001;
    if (isExisting) {
      return { name, created: false, existed: true };
    }
    return { name, created: false, error: message || String(error) };
  }
}

exports.main = async () => {
  const results = await Promise.all(COLLECTIONS.map(createCollection));
  return {
    ok: results.every((item) => !item.error),
    results
  };
};
