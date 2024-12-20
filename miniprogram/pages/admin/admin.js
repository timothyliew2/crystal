Page({
  data: {
    currentSecondLevel: 0,
    currentThirdLevel: 0,
    pages: [
      {
        id: 0,
        name: '主页',
        subPages: [
          {
            id: 0,
            name: '材质',
            categories: ['分类一', '分类二', '分类三', '分类四', '分类五']
          },
          {
            id: 1,
            name: 'MBTI',
            categories: ['分类一', '分类二', '分类三', '分类四', '分类五']
          },
          {
            id: 2,
            name: '五行',
            categories: ['分类一', '分类二', '分类三', '分类四', '分类五']
          }
        ]
      }
    ],
    categories: ['分类一', '分类二', '分类三', '分类四', '分类五'],
    currentImages: []
  },

  onLoad: function() {
    // 从云数据库加载数据
    this.loadDataFromCloud();
  },

  // 从云数据库加载数据
  loadDataFromCloud: async function() {
    try {
      const db = wx.cloud.database();
      // 获取分类数据
      const categoryData = await db.collection('categories').get();
      if (categoryData.data.length > 0) {
        this.setData({
          pages: categoryData.data[0].pages || this.data.pages,
          categories: categoryData.data[0].categories || this.data.categories
        });
      }

      // 获取当前分类的图片
      this.loadImagesForCurrentCategory();
    } catch (error) {
      console.error('加载数据失败：', error);
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    }
  },

  // 加载当前分类的图片
  loadImagesForCurrentCategory: async function() {
    try {
      const db = wx.cloud.database();
      const currentPage = this.data.pages[0];  // 当前固定为"主页"
      const currentSubPage = currentPage.subPages[this.data.currentSecondLevel];
      const currentCategory = currentSubPage.categories[this.data.currentThirdLevel];

      const images = await db.collection('crystalimage')
        .where({
          'category.level1': currentPage.name,
          'category.level2': currentSubPage.name,
          'category.level3': currentCategory
        })
        .get();

      this.setData({
        currentImages: images.data.map(item => item.fileID)
      });
    } catch (error) {
      console.error('加载图片失败：', error);
    }
  },

  // 切换二级目录
  onSecondLevelChange: function(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      currentSecondLevel: index,
      categories: this.data.pages[0].subPages[index].categories,
      currentThirdLevel: 0
    });
    this.loadImagesForCurrentCategory();
  },

  // 切换三级目录
  onThirdLevelChange: function(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      currentThirdLevel: index
    });
    this.loadImagesForCurrentCategory();
  },

  // 选择并上传图片
  chooseImage: async function() {
    try {
      // 选择图片
      const res = await wx.chooseMedia({
        count: 9,
        mediaType: ['image'],
        sourceType: ['album', 'camera']
      });

      wx.showLoading({
        title: '上传中...',
      });

      const currentPage = this.data.pages[0];  // 当前固定为"主页"
      const currentSubPage = currentPage.subPages[this.data.currentSecondLevel];
      const currentCategory = currentSubPage.categories[this.data.currentThirdLevel];

      // 上传到云存储
      const uploadTasks = res.tempFiles.map(file => {
        const ext = file.tempFilePath.split('.').pop();
        const cloudPath = `images/${currentPage.name}/${currentSubPage.name}/${currentCategory}/${Date.now()}-${Math.random().toString(36).substr(2)}.${ext}`;
        return wx.cloud.uploadFile({
          cloudPath,
          filePath: file.tempFilePath
        });
      });

      const uploadRes = await Promise.all(uploadTasks);
      const fileIDs = uploadRes.map(res => res.fileID);

      // 保存图片信息到云数据库
      const db = wx.cloud.database();
      const saveTasks = fileIDs.map(fileID => {
        return db.collection('crystalimage').add({
          data: {
            fileID,
            path: fileID,
            uploadTime: db.serverDate(),
            category: {
              level1: currentPage.name,
              level2: currentSubPage.name,
              level3: currentCategory
            },
            description: ''
          }
        });
      });

      await Promise.all(saveTasks);

      // 更新显示
      await this.loadImagesForCurrentCategory();

      wx.hideLoading();
      wx.showToast({
        title: '上传成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('上传失败：', error);
      wx.hideLoading();
      wx.showToast({
        title: '上传失败',
        icon: 'none'
      });
    }
  },

  // 删除图片
  deleteImage: async function(e) {
    try {
      const index = e.currentTarget.dataset.index;
      const fileID = this.data.currentImages[index];

      // 从云存储删除文件
      await wx.cloud.deleteFile({
        fileList: [fileID]
      });

      // 从云数据库删除记录
      const db = wx.cloud.database();
      await db.collection('crystalimage')
        .where({
          fileID: fileID
        })
        .remove();

      // 更新显示
      const newImages = this.data.currentImages.filter((_, i) => i !== index);
      this.setData({
        currentImages: newImages
      });

      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('删除失败：', error);
      wx.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  },

  // 添加分类
  addCategory: function() {
    const newCategory = '新分类' + (this.data.categories.length + 1);
    this.setData({
      categories: [...this.data.categories, newCategory]
    });
  },

  // 更新分类名称
  updateCategory: function(e) {
    const index = e.currentTarget.dataset.index;
    const newName = e.detail.value;
    const newCategories = [...this.data.categories];
    newCategories[index] = newName;
    this.setData({
      categories: newCategories
    });
  },

  // 删除分类
  deleteCategory: function(e) {
    const index = e.currentTarget.dataset.index;
    const newCategories = this.data.categories.filter((_, i) => i !== index);
    this.setData({
      categories: newCategories
    });
  },

  // 保存所有更改
  saveChanges: async function() {
    try {
      const db = wx.cloud.database();
      
      // 保存分类数据
      await db.collection('categories').where({
        _id: 'main' // 使用固定ID便于更新
      }).update({
        data: {
          pages: this.data.pages,
          categories: this.data.categories,
          updateTime: db.serverDate()
        }
      });

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('保存失败：', error);
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      });
    }
  }
});
