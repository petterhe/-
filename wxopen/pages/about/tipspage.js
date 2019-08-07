// pages/about/tipspage.js

var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    tipsInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    that = this

    var tipsInfo = app.globalData.tipsInfo
    app.globalData.tipsInfo = null

    if (tipsInfo == null || !tipsInfo.TipsItemList)
    {
      wx.navigateBack(-1)
    }

    that.setData({
      tipsInfo: tipsInfo,
    })
  },
  onShow: function () {
    // 页面显示
    if (that.data.tipsInfo) //编辑
    {
      wx.setNavigationBarTitle({
        title: that.data.tipsInfo.MainTitle,
        success: function (res) {

        }
      })
      return
    }
  },
})