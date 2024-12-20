App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'crystal-6gf3mhhcffa592f5', // 这里需要替换为你的云环境ID
        traceUser: true,
      })
    }
  },
  globalData: {
    // 全局数据
  }
}) 
