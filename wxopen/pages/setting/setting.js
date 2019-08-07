// pages/setting/setting.js

const util = require('../../utils/util.js')
const applogin = require('../../utils/applogin.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var app = getApp()
var that;

var scopeuserInfo
var setuser
var message
var isClicked
var logincode
var userinfo

Page({

  /**
   * 页面的初始数据
   */
  data: {
    setuser:0,
    message:""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this

    isClicked = false
    scopeuserInfo = false
    userinfo = null

    applogin.setIsSettingOpen(true)

    if (options.setuser == undefined) {
      setuser = 0;
    }
    else {
      setuser = options.setuser
    }

    if (options.logincode == undefined) {
      logincode = '';
    }
    else {
      logincode = options.logincode
    }

    if (options.message == undefined) {
      message = '';
    }
    else {
      message = options.message
    }

    if (message == null || message.length <= 0)
    {
      message = '您好，部分功能必须授权才能使用，请先允许您的授权'
    }

    var windowHeight = app.globalData.systemInfo.screenHeight//app.globalData.systemInfo.windowHeight
    var windowWidth = app.globalData.systemInfo.windowWidth

    //顶部高度
    var top_height = 64
    if(app.globalData.isIpx)
    {
      top_height = 88
    }

    that.setData({
      setuser: setuser,
      message: message,
      windowHeight: windowHeight - top_height,
      windowWidth: windowWidth,
    })
  },
  onUnload: function () {
    //如果用户未授权 拦截 做法比较流氓
    if (setuser == 1 && !scopeuserInfo) {
      //util.openUserSetting()
      setTimeout(util.openUserSetting,50)
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  onGotUserInfo: function (e) {
    isClicked = true
    if (e.detail != null)
    {
      if (e.detail.errMsg != null && e.detail.errMsg.indexOf("fail auth deny") >= 0) {

        showMessage()
        isClicked = false
        return
      }

      app.globalData.refreshuserInfo = true
      app.globalData.scopeuserInfo = true
      scopeuserInfo = true

      //设置用户
      applogin.setUserInfo(e.detail)

      //解析分享信息
      applogin.getShareInfo()
      
      //获取用户
      applogin.getUserOpenInfo()
      
      return
    }
  },
  openSetting: function (e) {

    /*
    if (e.detail != null && e.detail.authSetting['scope.userLocation'])
    {
      app.globalData.scopeuserLocation = true
    }

    if (e.detail != null && e.detail.authSetting['scope.invoiceTitle']) {
      app.globalData.scopeinvoiceTitle = true
    }*/

    if (e.detail != null)
    {
      var str = JSON.stringify(e.detail)
      if (str.indexOf('scope.userLocation') >= 0)
      {
        app.globalData.refreshuserLocation = true
        app.globalData.scopeuserLocation = e.detail.authSetting['scope.userLocation']
      }
      
      if (str.indexOf('scope.invoiceTitle') >= 0) {
        app.globalData.refresinvoiceTitle = true
        app.globalData.scopeinvoiceTitle = e.detail.authSetting['scope.invoiceTitle']
      }
    }

    wx.navigateBack()
  },
  closeSetting: function (e) {
    if (setuser == 1 && !scopeuserInfo)
    {
      showMessage()
    }
    else
    {
      wx.navigateBack()
    }
  },
})

function showMessage()
{
  wx.showModal({
    title: '提示',
    content: '必须先登录才能使用哦~',
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
      }
    }
  })
}