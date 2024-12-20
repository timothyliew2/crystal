Page({
  data: {
    mbtiOptions: ['INTJ', 'INFP', 'ENTP', 'ESFJ'], // 添加更多选项
    fiveElementsOptions: ['金', '木', '水', '火', '土'],
    selectedMBTI: '请选择',
    selectedFiveElement: '请选择'
  },

  onMBTIChange: function(e) {
    this.setData({
      selectedMBTI: this.data.mbtiOptions[e.detail.value]
    });
  },

  onFiveElementChange: function(e) {
    this.setData({
      selectedFiveElement: this.data.fiveElementsOptions[e.detail.value]
    });
  },

  submitSelection: function() {
    // 处理选择逻辑
    wx.showToast({
      title: `选择的MBTI: ${this.data.selectedMBTI}, 五行: ${this.data.selectedFiveElement}`
    });
  }
});
