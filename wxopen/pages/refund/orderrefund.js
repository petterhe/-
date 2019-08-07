// pages/refund/orderrefund.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var app = getApp()

var that 
var soSysNo
var reporFlag

var fromApp = 0
var appUserSysNo = 0 //App来源用户

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderAppealInfo:null,

    CanAppeal: appenum.OrderAppealStatus.CanAppeal.Value,
    InAppeal: appenum.OrderAppealStatus.InAppeal.Value,
    CanNotAppeal: appenum.OrderAppealStatus.CanNotAppeal.Value,

    windowHeight: 0,
    windowWidth: 0,

    canLaunchApp: util.canLaunchApp(),
    fromApp: fromApp,

    isIPhone: util.isIPhone(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
    that = this

    reporFlag = false
    fromApp = 0

    if (options.soSysNo == undefined) {
      soSysNo = 0;
    }
    else {
      soSysNo = options.soSysNo
    }

    if (!(options.FromApp == undefined)) {
      fromApp = options.FromApp
    }

    /*
    if (!(options.appUserSysNo == undefined)) {
      appUserSysNo = options.appUserSysNo
    }

    if (fromApp == 1 && appUserSysNo <= 0)
    {
      showToastView('打开小程序用户异常')
      wx.navigateBack(-1)
    }
    */

    var windowHeight = app.globalData.systemInfo.windowHeight
    var windowWidth = app.globalData.systemInfo.windowWidth
    
    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      fromApp: fromApp,
    })

    refreshPageData()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    //APP打开时 拒绝绑定用户，直接退出 返回APP
    if (app.globalData.notBindUserToApp)
    {
      app.globalData.notBindUserToApp = false
      wx.navigateBack()
    }

    if (app.globalData.loginphonesuccess) {
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }

    if (reporFlag)
    {
      reporFlag = false
      getOrderAppeal()
    }
  },
  bindKeyInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  search: function (e) {

    if (that.data.searchValue == null || that.data.searchValue.length <= 0) {
      return
    }

    soSysNo = getSoSysNo(that.data.searchValue)

    getOrderAppeal()
  },
  clear: function (e) {
    this.setData({
      searchValue: null
    })
  },
  reportAppela: function (e) {
    var index = e.currentTarget.dataset.index
    reportAppela(index)
  },
  showAppeal: function (e) {
    var index = e.currentTarget.dataset.index
    showAppeal(index)
  },
  toHome: function () {
    //wx.showShareMenu()
    util.toHome()
  },
  launchAppError: function (e) {
    /*
    wx.showModal({
      title: '11',
      content: e.detail.errMsg,
    })*/
    console.log(e)
  }
})

function refreshPageData() {
  //等待授权
  if (app.globalData.userloginflag == 0) {
    setTimeout(refreshPageData, 2 * 1000)
    return
  }

  if (util.isTempCustomer()) {
    //未授权，去登录
    util.confirmToLoginPhone()
    return
  }
  
  if (soSysNo > 0) {

    that.setData({
      searchValue: soSysNo,
    })

    getOrderAppeal()
  }
}

function getSoSysNo(value) {
  if (value.length == 10 && value.substring(0, 1) == '1') {
    value = value.substring(1, 10)
  }

  return value.replace(/\b(0+)/gi, "")
}

function getOrderAppeal()
{
  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.SOSysNo = soSysNo

  // data.CustomerSysNo = 1682608
  // data.SOSysNo = 42305941

  data.ShowType = 1 //仅显示可退款订单

  util.requestGet('GetToSOAppealService', data, getOrderAppealSuccess, getOrderAppealFail, null)
}

function getOrderAppealSuccess(res) {
  if (res.data != null && res.data.Entity != null)     {
    var orderAppealInfo = res.data.Entity

    that.setData({
      orderAppealInfo: orderAppealInfo
    })

    return
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function getOrderAppealFail() {

}

function reportAppela(index)
{

  var orderAppealInfo = that.data.orderAppealInfo
  if (orderAppealInfo.Products != null && orderAppealInfo.Products.length > index) {
    var itemInfo = orderAppealInfo.Products[index]
  
    reporFlag = true

    app.globalData.ReportAppealItem = itemInfo

    wx.navigateTo({
      url: '../refund/reportrefund?soSysNo=' + soSysNo 
    })
  }
  
}

function showAppeal(index)
{
  var orderAppealInfo = that.data.orderAppealInfo
  if (orderAppealInfo.Products != null && orderAppealInfo.Products.length > index)
  {
    var appealSysNo = orderAppealInfo.Products[index].AppealSysNo

    wx.navigateTo({
      url: '../refund/refunddetail?appealSysNo=' + appealSysNo
    })
  } 
}

//*************** 显示Toast ************//
function showToastView(toastMessage, showType = 1) {
  that.setData({
    isShowToast: true,
    toastMessage: toastMessage,

  })

  setTimeout(hideToastView, 2000);
}

function hideToastView() {
  that.setData({
    isShowToast: false,
    toastMessage: '',
  })
}
//*************** 显示Toast ************//
