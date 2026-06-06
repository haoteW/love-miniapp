const { COLLECTIONS, STORAGE_KEYS } = require('../../utils/constants');
const { addCollectionItem, getOpenid } = require('../../utils/data');

function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => String(currentYear - index));
}

function buildReportText(report) {
  if (!report) return '';
  const stats = report.stats || {};
  const keywords = report.keywords || [];
  return [
    `${report.year} 年度恋爱报告`,
    `恋爱总天数：${stats.loveDays || 0} 天`,
    `日记：${stats.diaryCount || 0} 篇｜照片：${stats.photoCount || 0} 张｜完成心愿：${stats.completedWishCount || 0} 个`,
    `最常记录的月份：${stats.topMonth || '暂无记录'}`,
    '',
    report.content || '',
    '',
    report.closingLine || '',
    keywords.length ? `年度关键词：${keywords.join('、')}` : ''
  ].filter((item) => item !== '').join('\n');
}

Page({
  data: {
    yearOptions: getYearOptions(),
    yearIndex: 0,
    selectedYear: String(new Date().getFullYear()),
    isGenerating: false,
    isSaved: false,
    report: null,
    statCards: []
  },

  onYearChange(event) {
    const yearIndex = Number(event.detail.value);
    this.setData({
      yearIndex,
      selectedYear: this.data.yearOptions[yearIndex],
      isSaved: false
    });
  },

  async generateReport() {
    this.setData({ isGenerating: true, isSaved: false });
    wx.showLoading({ title: '生成中' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'generateYearReport',
        data: {
          year: Number(this.data.selectedYear)
        }
      });
      const result = res.result || {};
      if (result.ok === false) {
        throw new Error(result.message || '生成失败，请稍后重试');
      }
      const report = result.report;
      if (!report) {
        throw new Error('Empty year report');
      }
      this.setData({
        report,
        statCards: this.getStatCards(report.stats || {}),
        isSaved: Boolean(report._id || result.reportId),
        isGenerating: false
      });
    } catch (error) {
      console.warn('生成年度报告失败', error);
      this.setData({ isGenerating: false });
      wx.showModal({
        title: '生成失败',
        content: this.getGenerateErrorMessage(error),
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  getGenerateErrorMessage(error) {
    const message = error && error.message ? error.message : '';
    if (/TIME_LIMIT_EXCEEDED|timed out|timeout|超时/i.test(message)) {
      return '生成时间有点久，请稍后再试。若持续出现，请重新部署 generateYearReport 云函数并确认超时时间为 30 秒。';
    }
    return message || '年度报告生成失败，请稍后重试。';
  },

  getStatCards(stats) {
    return [
      { label: '恋爱天数', value: stats.loveDays || 0, unit: '天' },
      { label: '新增日记', value: stats.diaryCount || 0, unit: '篇' },
      { label: '上传照片', value: stats.photoCount || 0, unit: '张' },
      { label: '完成心愿', value: stats.completedWishCount || 0, unit: '个' },
      { label: '新增纪念日', value: stats.anniversaryCount || 0, unit: '个' },
      { label: '常记录月份', value: stats.topMonth || '暂无', unit: '' }
    ];
  },

  copyReport() {
    const text = buildReportText(this.data.report);
    if (!text) return;
    wx.setClipboardData({ data: text });
  },

  async saveReport() {
    if (!this.data.report) {
      wx.showToast({ title: '请先生成报告', icon: 'none' });
      return;
    }
    if (this.data.report._id) {
      this.setData({ isSaved: true });
      wx.showToast({ title: '已保存', icon: 'success' });
      return;
    }

    wx.showLoading({ title: '保存中' });
    const userId = await getOpenid();
    const report = this.data.report;
    const saved = await addCollectionItem(COLLECTIONS.YEAR_REPORTS, STORAGE_KEYS.YEAR_REPORTS, {
      coupleId: report.coupleId || '',
      userId,
      year: report.year,
      stats: report.stats,
      highlights: report.highlights,
      content: report.content,
      keywords: report.keywords
    });
    wx.hideLoading();
    this.setData({
      report: {
        ...report,
        _id: saved._id || saved.id
      },
      isSaved: true
    });
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  createShareImage() {
    wx.showToast({ title: '分享图功能开发中', icon: 'none' });
  }
});
