function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value.replace(/-/g, '/'));
}

function formatDate(date) {
  const target = toDate(date);
  if (!target) return '';
  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, '0');
  const day = String(target.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function diffDays(start, end = new Date()) {
  const startDate = toDate(start);
  const endDate = toDate(end);
  if (!startDate || !endDate) return 0;
  const startTime = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
  const endTime = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
  return Math.floor((endTime - startTime) / 86400000) + 1;
}

function daysUntil(date) {
  const target = toDate(date);
  if (!target) return 0;
  const today = new Date();
  const currentYearTarget = new Date(today.getFullYear(), target.getMonth(), target.getDate());
  if (currentYearTarget < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
    currentYearTarget.setFullYear(today.getFullYear() + 1);
  }
  return diffDays(today, currentYearTarget) - 1;
}

module.exports = {
  diffDays,
  daysUntil,
  formatDate
};
