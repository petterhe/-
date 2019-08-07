// pages/refund/myrefund.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

const pageSize = 5

var app = getApp()

var that
var bmore = true

var currentPage = 0
var bmore = true
var bmoretoast = true

var appealSysNo

var fromApp = 0
var appUserSysNo = 0 //App来源用户

Page({

  /**
   * 页面的初始数据
   */
  data: {
    appeallist: null,

    CanAppeal: appenum.OrderAppealStatus.CanAppeal.Value,
    InAppeal: appenum.OrderAppealStatus.InAppeal.Value,

    windowHeight: 0,
    windowWidth: 0,

    isShowToast: false,
    toastMessage: '',

    canLaunchApp: util.canLaunchApp(),
    fromApp: fromApp,

    isIPhone: util.isIPhone(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this
    
    currentPage = 1
    bmore = true
    bmoretoast = true

    if (options.appealSysNo == undefined) {
      appealSysNo = 0;
    }
    else {
      appealSysNo = options.appealSysNo
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

    //test()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    //APP打开时 拒绝绑定用户，直接退出 返回APP
    if (app.globalData.notBindUserToApp) {
      app.globalData.notBindUserToApp = false
      wx.navigateBack()
    }

    if (app.globalData.loginphonesuccess) {
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!bmore) {
      if (bmoretoast) {
        //util.showToast('已经是最后一页',-1);
        showToastView('已经是最后一页', -1);
        bmoretoast = false
      }
      return
    }
    loadmore()
  },
  appdealDetail: function (e) {
    var index = e.currentTarget.dataset.index
    showAppeal(index)
  },
  toHome: function () {
    //wx.showShareMenu()
    util.toHome()
  },
  launchAppError: function (e) {
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

  currentPage = 1
  bmore = true
  bmoretoast = true

  getAppealList()
}

function loadmore() {
  currentPage++
  getAppealList()
}

function getAppealList() {
  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  
  if (appealSysNo != null && appealSysNo > 0) {
    data.AppealSysNo = appealSysNo
  }

  data.PageSize = pageSize
  data.CurrentPage = currentPage

  util.requestGet('GetSOAppealListService', data, getAppealListSuccess, getAppealListFail, null)
}

function getAppealListSuccess(res) {

  if (res.data != null && res.data.Entity != null) {

    if (res.data.Entity.length > 0) {
      showAppealList(res.data.Entity)
      return
    }
  }
  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function showAppealList(list) {

  var appeallist = that.data.appeallist

  if (appeallist == null || currentPage == 1) {
    appeallist = new Array()
  }

  for (var i = 0; i < list.length; i++) 　{
    // list[i].strRowCreateDate = util.convertTime(list[i].rowCreateDate)

    appeallist.push(list[i])
  }

  if (list.length < pageSize) {
    bmore = false;
  }

  that.setData({
    appeallist: appeallist
  })
}

function getAppealListFail() {

}


function showAppeal(index) {
  var appeallist = that.data.appeallist
  if (appeallist && appeallist.length > index) {
    var appealSysNo = appeallist[index].SysNo
    app.globalData.AppealDetailInfo = appeallist[index]

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