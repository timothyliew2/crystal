Page({
  data: {
    crystal: null
  },

  onLoad: function(options) {
    // 从云数据库获取水晶详情
    if (options.id) {
      this.loadCrystalDetail(options.id);
    }
  },

  // 加载水晶详情
  loadCrystalDetail: function(crystalId) {
    const db = wx.cloud.database();
    db.collection('crystal_images').doc(crystalId).get({
      success: res => {
        this.setData({
          crystal: res.data
        });
      },
      fail: err => {
        console.error('获取水晶详情失败：', err);
        wx.showToast({
          title: '获取详情失败',
          icon: 'none'
        });
      }
    });
  },

  // 预览图片
  previewImage: function(e) {
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current: current,
      urls: this.data.crystal.images
    });
  }
});
