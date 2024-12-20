// 初始化数据库
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 初始化分类数据
exports.initCategories = async () => {
  try {
    await db.collection('categories').add({
      data: {
        _id: 'main',
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
        updateTime: new Date()
      }
    })
    console.log('Categories initialized successfully')
  } catch (error) {
    console.error('Error initializing categories:', error)
  }
}

// 初始化图片集合结构
exports.initCrystalImage = async () => {
  try {
    // 创建一个示例图片记录结构
    await db.collection('crystalimage').add({
      data: {
        fileID: '', // 云存储文件ID
        path: '', // 云存储路径
        uploadTime: new Date(),
        category: {
          level1: '主页',
          level2: '材质',
          level3: '分类一'
        },
        description: '示例图片'
      }
    })
    console.log('Crystal image collection initialized successfully')
  } catch (error) {
    console.error('Error initializing crystal image collection:', error)
  }
}
