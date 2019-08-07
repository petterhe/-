// pages/people/couponreceive.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var shareMessage
var fromApp = 0

Page({

  //页面的初始数据
  data: {
    ActiveSysNo:null,
    BatchNo:null,
    SOSysNo:null,
    isshare:0,
    CustomerID:'',

    windowHeight: 0,
    windowWidth: 0,
    imageA1Height:0,
    imageA2Height:0,

    ShowSection:false,
    showUse:false,
    Fail:false,
    Message:'',

    canShare: false,

    ReceiveListItem:null,
    ReceiveActiveInfo:null,
    ListCoupon:null,
    ReceiveMsg:null,

    AfterShareReceive:1,

    imageHost: appconst.ImageHost,
    bgColor: '#002114',

    showMemo:false,
    
    canLaunchApp: util.canLaunchApp(),
    fromApp: fromApp,
  },

  //生命周期函数--监听页面加载
  onLoad: function (options) {

    //设置分享
    util.showShareMenu()

    shareMessage = ''

    var ActiveSysNo = null
    var BatchNo = null
    var SOSysNo = null
    var isshare = 0
    fromApp = 0

    if (!(options.ActiveSysNo == undefined)) {
      ActiveSysNo = options.ActiveSysNo
    }

    if (!(options.activesysno == undefined)) {
      ActiveSysNo = options.activesysno
    }

    if (!(options.BatchNo == undefined)) {
      BatchNo = options.BatchNo
    }

    if (!(options.batchno == undefined)) {
      BatchNo = options.batchno
    }

    if (!(options.SOSysNo == undefined)) {
      SOSysNo = options.SOSysNo
    }

    if (!(options.sosysno == undefined)) {
      SOSysNo = options.sosysno
    }

    if (!(options.FromApp == undefined)) {
      fromApp = options.FromApp
    }

    if (!(options.fromApp == undefined)) {
      fromApp = options.fromApp
    }

    if (!(options.fromapp == undefined)) {
      fromApp = options.fromapp
    }

    if (ActiveSysNo == null || ActiveSysNo.length == 0)
    {
      util.showModel('提示','很抱歉，活动异常')
      wx.navigateBack()
      return;
    }

    that = this

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth


    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,

      imageA1Height: 770,//windowWidth*734/750,
      sectionTop:0,
      receivelistTop:400,
      imageA2Height: windowWidth * 280 / 750 + 10,

      ActiveSysNo: ActiveSysNo,
      BatchNo: BatchNo,
      SOSysNo: SOSysNo,
      
      ShowSection:true,
      canShare: util.canShare(),
      fromApp: fromApp,

      showMemo: false,
    })

    getReceiveActiveInfo()
    refreshPageData()
    
    // if (app.globalData.customerInfo == null) {
    //   //延迟3秒刷新数据
    //   setTimeout(refreshPageData, 3 * 1000)
    //   return
    // }

    // if (util.isTempCustomer()) {
    //   util.confirmToLoginPhone()
    //   return
    // }

    // initData()
    
  },
  onShow: function () {

    if (app.globalData.loginphonesuccess) {
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }
  },
  //分享
  onShareAppMessage: function () {

    if (util.isTempCustomer()) {
      util.confirmToLoginPhone()
      return
    }

    var path = that.route

    path = path + "?ActiveSysNo=" + that.data.ActiveSysNo

    if (that.data.BatchNo != null && that.data.BatchNo.length > 0) 
    {
      path = path + "&BatchNo=" + that.data.BatchNo
    }

    if (that.data.SOSysNo != null && that.data.SOSysNo.length > 0) {
      path = path + "&SOSysNo=" + that.data.SOSysNo
    }

    if (that.data.ReceiveActiveInfo != null)
    {
      shareMessage = that.data.ReceiveActiveInfo.ShareTitle
    }

    if (shareMessage == null || shareMessage.length == 0)
    {
      shareMessage ="送你个很赞的红包，最近都在这买上瘾了！水果蔬菜1小时到家~"
    }

    path = util.getSharePath(path)

    return {
      title: shareMessage,
      path: path,
      success: function (res) {
        if (that.data.ReceiveActiveInfo != null && that.data.ReceiveActiveInfo.ShareType == that.data.AfterShareReceive)
        {
          //领红包
          receiveCouponProcess()
        }

        if (res.shareTickets != null && res.shareTickets.length > 0) {
          //获取分享信息及上报解密
          util.getShareInfo(res.shareTickets[0], path, appenum.WXOpenShareLogType.Share.Value)
        }
        else {
          util.saveNoTicketShareInfo(path, appenum.WXOpenShareLogType.Share.Value)
        }
      },
      fail: function (res) {
      }
    }
  },
  toHome: function () 
  {
    util.toHome()
  },
  receiveCoupon:function() {
    receiveCouponProcess()
  },
  toCouponList:function()
  {
    toCouponList()
  }
})

function refreshPageData()
{
  

  if (app.globalData.userloginflag == 0) {
    setTimeout(refreshPageData, 2 * 1000)
    return
  }

  if (util.isTempCustomer()) {
    util.confirmToLoginPhone()
    return
  }

  wx.showLoading()
  initData()
}

function initData()
{
  if (app.globalData.customerInfo == null)
  {
    return
  }

  that.setData({
    CustomerID: app.globalData.customerInfo.CustomerID,
  })

  //活动校验
  checkCoupon()
  
}

function checkCoupon()
{
  var data = {};

  data.ActiveSysNo = that.data.ActiveSysNo
  if (that.data.BatchNo != null && that.data.BatchNo.length >0)
  {
    data.BatchNo = that.data.BatchNo
  }

  if (that.data.SOSysNo != null && that.data.SOSysNo.length > 0) {
    data.SOSysNo = that.data.SOSysNo
  }

  if (app.globalData.customerInfo)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }

  util.requestGet('CheckReceiveCouponService', data, checkCouponSuccess, checkCouponFail, null)
}

function checkCouponSuccess(res) {
  if (res.data != null) {
    
    if (res.data.Entity == null || !res.data.Entity.Result)
    {
      var message = "很抱歉，红包已抢完或已结束"

      if (res.data.ResponseStatus && res.data.ResponseStatus.Message)
      {
        message = res.data.ResponseStatus.Message
      }

      wx.hideLoading()
      that.setData({
        Fail: true,
        showUse:false,
        Message: message,
      })

      //红包领取记录
      getReceiveListItem()
    }
    else
    {
      receiveCouponProcess()
    }

    wx.hideLoading()
  }
}

function checkCouponFail() {
  wx.hideLoading()
}

function receiveCouponProcess()
{
  if (app.globalData.customerInfo == null) {
    wx.showModal({
      title: '提示',
      content: '获取用户信息失败，请稍候重试',
      showCancel: false,
      success: function (res) {
      }
    })

    wx.hideLoading()
    return
  }

  if (util.isTempCustomer()) {
    util.confirmToLoginPhone()
    wx.hideLoading()
    return
  }

  receiveCoupon()
}


function receiveCoupon()
{
  var data = {};

  data.ActiveSysNo = that.data.ActiveSysNo
  data.Phone = app.globalData.customerInfo.CustomerID
  if (that.data.BatchNo != null && that.data.BatchNo.length > 0) {
    data.BatchNo = that.data.BatchNo
  }

  if (that.data.SOSysNo != null && that.data.SOSysNo.length > 0) {
    data.SOSysNo = that.data.SOSysNo
  }

  util.requestGet('ToReceiveCouponService', data, receiveCouponSuccess, receiveCouponFail, null)
}

function receiveCouponSuccess(res) {

  wx.hideLoading()

  //红包领取记录
  getReceiveListItem()

  if (res.data != null && res.data.Entity != null 
    && res.data.Entity.ListCoupon != null
    && res.data.Entity.ListCoupon.length > 0)
    {
      // var message = getCouponAmt(res.data.Entity.ListCoupon)
      //successProcess(message)
      that.setData({
        showUse:true,
        showMemo: true,
        ListCoupon: res.data.Entity.ListCoupon,
        ReceiveMsg: res.data.Entity.ReceiveMsg,
      })
      return
    }

  if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 306103) 
  {
    successProcess(res.data.ResponseStatus.Message)
    return
  }

  that.setData({
    Fail: true,
    showUse:false,
    showMemo:true,
    Message: res.data.ResponseStatus.Message,
  })
}


function receiveCouponFail() {
  wx.hideLoading()

  //红包领取记录
  getReceiveListItem()
}

function successProcess(message)
{
  that.setData({
    Fail: false,
    showUse:true,
    showMemo: true,
    Message: message,
  })
}


function getCouponAmt(listCoupon)
{
  var message = '领取红包成功'

  if (listCoupon.length == 1)
  {
    message = '成功领取1个' + listCoupon[0].CouponAmt + '元红包'
  }
  else
  {
    var amt = 0
    for (var i = 0; i < listCoupon.length ;i++)
    {
      amt = amt + parseFloat(listCoupon[i].CouponAmt)
    }

    message = '成功领取' + listCoupon.length + '个红包共' + amt + '元'
  }

  shareMessage == '我' +  message + ',您也一起来吧'
  return message
}

function toCouponList() {
  wx.navigateTo({
    url: '../people/couponlist'
  })
}

function getReceiveListItem()
{
  var data = {};

  data.ActiveSysNo = that.data.ActiveSysNo
  data.Type = 0
  if (that.data.BatchNo != null && that.data.BatchNo.length > 0) {
    data.BatchNo = that.data.BatchNo
  }

  if (that.data.SOSysNo != null && that.data.SOSysNo.length > 0)  {
    data.SOSysNo = that.data.SOSysNo
  }

  util.requestGet('getreceivecouponservice', data, getReceiveListItemSuccess, getReceiveListItemFail, null)
}

function getReceiveListItemSuccess(res)
{
  if (res.data != null && res.data.Entity != null && res.data.Entity.length > 0) 
  {
    that.setData({
      ReceiveListItem: res.data.Entity,
      showMemo:true,
    })
    return
  }

  that.setData({
    showMemo: true,
  })
 
  util.showToast(res.data.ResponseStatus.Message, -1)
}


function getReceiveListItemFail() {

}

function getReceiveActiveInfo() {
  var data = {};

  data.ActiveSysNo = that.data.ActiveSysNo

  util.requestGet('GetCouponActiveInfoService', data, getReceiveActiveInfoSuccess, getReceiveActiveInfoFail, null)
}

function getReceiveActiveInfoSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    var info = res.data.Entity
    if (info != null && (info.ShareBGImgUrl == null || info.ShareBGImgUrl.length ==0))
    {
      info.ShareBGImgUrl = util.getSysDataConfigValue('CouponReceiveImage')
    }

    if (info != null && (info.ShareBGColor == null || info.ShareBGColor.length == 0)) {
      info.ShareBGColor = util.getSysDataConfigValue('CouponReceiveBgColor')
    }

    that.setData({
      ReceiveActiveInfo: info,
      bgColor: info.ShareBGColor,
    })
    
    return
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
}


function getReceiveActiveInfoFail() {

}