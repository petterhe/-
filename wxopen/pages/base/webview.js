// pages/about/webview.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

//var title

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    //title = '妙生活';
    var url 

    if (!(options.Url == undefined)) {
      url = options.Url;
    }
    
    // if (!(options.Title == undefined)) {
    //   title = options.Title;
    // }
    //    if (title == null || title.length == 0) {
    //   title = '妙生活';
    // }

    if (url == null || url.length == 0)
    {
      wx.navigateBack(-1);
      return;
    }

    //设置分享
    util.showShareMenu()

    //获取地址并清空
    url = util.UrlDecode(url).toLowerCase()
    url = util.UrlFromApp(url)

    that = this

    that.setData({
      url: url,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    /*
    wx.setNavigationBarTitle({
      title: title,
      success: function (res) {
        // success
      }
    })
    */
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
    if (that.data.url == null || that.data.url.length == 0) {
      return;
    }
    
    var path = 'pages/base/webview?Url=' + util.UrlEncode(that.data.url)

    path = util.getSharePath(path)

    return {
      path: path,
      success: function (res) {
        if (res.shareTickets != null && res.shareTickets.length > 0) {
          //获取分享信息及上报解密
          util.getShareInfo(res.shareTickets[0], path, appenum.WXOpenShareLogType.Share.Value)
        }
        else{
          util.saveNoTicketShareInfo(path, appenum.WXOpenShareLogType.Share.Value)
        }
      },
      fail: function (res) {
      }
    }
  }
})

