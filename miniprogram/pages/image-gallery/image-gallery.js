Page({
  data: {
    currentMainCategory: 'purpose',
    currentCategory: null,
    categories: {
      purpose: [
        { id: 'love', name: '爱情婚姻' },
        { id: 'wealth', name: '财运' },
        { id: 'career', name: '学业事业' },
        { id: 'health', name: '健康' },
        { id: 'healing', name: '心理疗愈' }
      ],
      mbti: [
        { id: 'INTJ', name: 'INTJ' },
        { id: 'INTP', name: 'INTP' },
        { id: 'ENTJ', name: 'ENTJ' },
        { id: 'ENTP', name: 'ENTP' },
        { id: 'INFJ', name: 'INFJ' },
        { id: 'INFP', name: 'INFP' },
        { id: 'ENFJ', name: 'ENFJ' },
        { id: 'ENFP', name: 'ENFP' },
        { id: 'ISTJ', name: 'ISTJ' },
        { id: 'ISFJ', name: 'ISFJ' },
        { id: 'ESTJ', name: 'ESTJ' },
        { id: 'ESFJ', name: 'ESFJ' },
        { id: 'ISTP', name: 'ISTP' },
        { id: 'ISFP', name: 'ISFP' },
        { id: 'ESTP', name: 'ESTP' },
        { id: 'ESFP', name: 'ESFP' }
      ],
      elements: [
        { id: 'metal', name: '金' },
        { id: 'wood', name: '木' },
        { id: 'water', name: '水' },
        { id: 'fire', name: '火' },
        { id: 'earth', name: '土' }
      ]
    },
    images: []
  },

  onLoad() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    wx.cloud.init({
      env: 'crystal-6gf3mhhcffa592f5',
      traceUser: true,
    });

    // 设置初始分类
    this.setData({
      currentMainCategory: 'purpose',
      currentCategory: this.data.categories.purpose[0].id
    });

    // 加载初始图片
    this.loadImages();
  },

  // 切换主分类
  switchMainCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentMainCategory: category,
      currentCategory: this.data.categories[category][0].id
    });
    this.loadImages();
  },

  // 切换子分类
  switchCategory(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      currentCategory: id
    });
    this.loadImages();
  },

  // 加载图片
  async loadImages() {
    wx.showLoading({
      title: '加载中...',
    });

    try {
      const db = wx.cloud.database();
      console.log('查询条件：', {
        type: this.data.currentMainCategory,
        category: this.data.currentCategory
      });
      
      const result = await db.collection('crystal_images')
        .where({
          type: this.data.currentMainCategory,
          category: this.data.currentCategory
        })
        .get();
      
      this.setData({
        images: result.data
      });
      
      if (result.data.length === 0) {
        wx.showToast({
          title: '暂无相关图片',
          icon: 'none'
        });
      }
    } catch (err) {
      console.error('加载图片失败：', err);
      wx.showToast({
        title: '加载失败，请检查网络',
        icon: 'none'
      });
      this.setData({
        images: []
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.images.map(item => item.url)
    });
  },

  // 处理图片加载错误
  handleImageError(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images;
    images[index].url = '/images/error.png'; // 替换为默认错误图片
    this.setData({ images });
  },

  // 跳转到详情页
  navigateToDetail(e) {
    const crystalId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/crystal-detail/crystal-detail?id=${crystalId}`
    });
  }
});