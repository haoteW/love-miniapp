const POSTER_WIDTH = 375;
const POSTER_HEIGHT = 667;

Page({
  data: {
    report: null,
    posterPath: '',
    isDrawing: false
  },

  onLoad(options) {
    this.loadReport(options || {});
  },

  async loadReport(options) {
    const cachedReport = wx.getStorageSync('currentYearReportPoster');
    if (cachedReport && (!options.reportId || cachedReport._id === decodeURIComponent(options.reportId))) {
      this.setData({ report: cachedReport });
      setTimeout(() => this.generatePoster(), 120);
      return;
    }

    if (!options.reportId) {
      this.setData({ report: null });
      return;
    }

    wx.showLoading({ title: '加载中' });
    try {
      const res = await wx.cloud.database()
        .collection('year_reports')
        .doc(decodeURIComponent(options.reportId))
        .get();
      this.setData({ report: res.data || null });
      setTimeout(() => this.generatePoster(), 120);
    } catch (error) {
      console.warn('加载年度报告失败', error);
      this.setData({ report: null });
      wx.showToast({ title: '报告数据不存在', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  generatePoster(afterGenerate) {
    if (!this.data.report) {
      wx.showToast({ title: '暂无报告数据', icon: 'none' });
      return;
    }

    this.setData({ isDrawing: true });
    const query = this.createSelectorQuery();
    query.select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res && res[0] && res[0].node;
        if (!canvas) {
          this.setData({ isDrawing: false });
          wx.showToast({ title: '海报生成失败', icon: 'none' });
          return;
        }

        try {
          const dpr = wx.getSystemInfoSync().pixelRatio || 1;
          canvas.width = POSTER_WIDTH * dpr;
          canvas.height = POSTER_HEIGHT * dpr;
          const ctx = canvas.getContext('2d');
          ctx.scale(dpr, dpr);
          this.drawPoster(ctx, POSTER_WIDTH, POSTER_HEIGHT, canvas);
          wx.canvasToTempFilePath({
            canvas,
            width: POSTER_WIDTH,
            height: POSTER_HEIGHT,
            destWidth: POSTER_WIDTH * dpr,
            destHeight: POSTER_HEIGHT * dpr,
            success: (fileRes) => {
              this.setData({
                posterPath: fileRes.tempFilePath,
                isDrawing: false
              });
              wx.showToast({ title: '海报已生成', icon: 'success' });
              if (afterGenerate === 'preview') this.previewPoster();
              if (afterGenerate === 'save') this.savePoster();
            },
            fail: (error) => {
              console.warn('导出海报失败', error);
              this.setData({ isDrawing: false });
              wx.showToast({ title: '海报生成失败', icon: 'none' });
            }
          });
        } catch (error) {
          console.warn('绘制海报失败', error);
          this.setData({ isDrawing: false });
          wx.showToast({ title: '海报生成失败', icon: 'none' });
        }
      });
  },

  drawPoster(ctx, width, height) {
    const report = this.data.report || {};
    const stats = report.stats || {};
    const year = report.year || new Date().getFullYear();
    const content = report.content || '这一年，很多温柔的小事都被认真记录了下来。';
    const keywords = report.keywords || [];

    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#fff8f2');
    bg.addColorStop(0.45, '#fff0f5');
    bg.addColorStop(1, '#ffe1ea');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(244, 124, 157, 0.16)';
    ctx.beginPath();
    ctx.arc(310, 74, 74, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 194, 209, 0.32)';
    ctx.beginPath();
    ctx.arc(70, 610, 92, 0, Math.PI * 2);
    ctx.fill();

    this.roundRect(ctx, 24, 28, 327, 611, 24);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.fill();

    ctx.fillStyle = '#f47c9d';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('我们的年度恋爱报告', width / 2, 76);

    ctx.fillStyle = '#9b7b84';
    ctx.font = '13px sans-serif';
    ctx.fillText('Love Annual Report', width / 2, 99);

    ctx.fillStyle = '#513943';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`${year} 年`, width / 2, 132);

    this.drawCard(ctx, 42, 154, 135, 78, '恋爱天数', `${stats.loveDays || 0} 天`);
    this.drawCard(ctx, 198, 154, 135, 78, '日记数量', `${stats.diaryCount || 0} 篇`);
    this.drawCard(ctx, 42, 248, 135, 78, '约会数量', `${stats.checkinCount || 0} 次`);
    this.drawCard(ctx, 198, 248, 135, 78, '纪念日', `${stats.anniversaryCount || 0} 个`);
    this.drawCard(ctx, 42, 342, 135, 78, '心愿数量', `${stats.completedWishCount || 0} 个`);
    this.drawCard(ctx, 198, 342, 135, 78, '照片数量', `${stats.photoCount || 0} 张`);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#513943';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('AI 年度总结', 42, 460);

    ctx.fillStyle = '#6f5660';
    ctx.font = '13px sans-serif';
    this.drawWrappedText(ctx, content, 42, 486, 291, 20, 6);

    if (keywords.length) {
      ctx.fillStyle = '#513943';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('年度关键词', 42, 606);
      let x = 124;
      keywords.slice(0, 3).forEach((keyword) => {
        const text = `#${keyword}`;
        const tagWidth = Math.min(82, ctx.measureText(text).width + 18);
        this.roundRect(ctx, x, 588, tagWidth, 28, 14);
        ctx.fillStyle = '#fff0f4';
        ctx.fill();
        ctx.fillStyle = '#f47c9d';
        ctx.font = '12px sans-serif';
        ctx.fillText(text, x + 9, 607);
        x += tagWidth + 8;
      });
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#b08d98';
    ctx.font = '11px sans-serif';
    ctx.fillText('Generated by Love MiniApp', width / 2, 630);
  },

  drawCard(ctx, x, y, w, h, title, value) {
    this.roundRect(ctx, x, y, w, h, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ffe1ea';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#8a6f78';
    ctx.font = '12px sans-serif';
    ctx.fillText(title, x + w / 2, y + 25);
    ctx.fillStyle = '#f47c9d';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(value, x + w / 2, y + 57);
  },

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = String(text || '').replace(/\s+/g, ' ').split('');
    const lines = [];
    let current = '';

    chars.forEach((char) => {
      const next = current + char;
      if (ctx.measureText(next).width > maxWidth && current) {
        lines.push(current);
        current = char;
      } else {
        current = next;
      }
    });
    if (current) lines.push(current);

    const visibleLines = lines.slice(0, maxLines);
    if (lines.length > maxLines && visibleLines.length) {
      let lastLine = visibleLines[visibleLines.length - 1];
      while (ctx.measureText(`${lastLine}...`).width > maxWidth && lastLine.length) {
        lastLine = lastLine.slice(0, -1);
      }
      visibleLines[visibleLines.length - 1] = `${lastLine}...`;
    }

    visibleLines.forEach((line, index) => {
      ctx.fillText(line, x, y + index * lineHeight);
    });
    return visibleLines.length;
  },

  roundRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  },

  previewPoster() {
    if (!this.data.posterPath) {
      this.generatePoster('preview');
      return;
    }
    wx.previewImage({
      current: this.data.posterPath,
      urls: [this.data.posterPath]
    });
  },

  savePoster() {
    if (!this.data.posterPath) {
      this.generatePoster('save');
      return;
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterPath,
      success: () => {
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: (error) => {
        const message = error.errMsg || '';
        if (/auth|authorize|permission|denied/i.test(message)) {
          wx.showModal({
            title: '需要相册权限',
            content: '请在设置中开启保存到相册权限后重试。',
            confirmText: '去设置',
            success: (res) => {
              if (res.confirm) wx.openSetting();
            }
          });
          return;
        }
        console.warn('保存海报失败', error);
        wx.showToast({ title: '保存失败，请稍后重试', icon: 'none' });
      }
    });
  }
});
