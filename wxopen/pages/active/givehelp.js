// pages/active/givehelp.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var fromApp = 0
var activeSysNo = 0
var fromUserNo = ''

var limitTimer

var downSecond = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
  
    imageHost: appconst.ImageHost,

    activeInfo:null,

    shareDialogTitle: '分享微信群得红包',
    shareDialogContent: '',
    shareDialogbuttonText: '立即分享',
    shareDialogisShowShare: true,

    sharemodalTitle:'',
    sharemodalContent:'',
    sharemodalconfirmText:'确定',
    sharemodalcancelText:'取消',
    sharemodalisShowShare:true,

    showShareButton:false,
    buttonText:"",
    statusText:"",
    giveMemo:"",

    timeMemo:"",

    Complete: appenum.ActStatus.Complete.Value,
    Received: appenum.ActStatus.Received.Value,
    NoComplete: appenum.ActStatus.NoComplete.Value, 
    Stoped: appenum.ActStatus.Stoped.Value,

    DailyHelpLimitCount:5,

    isShowCouponImage:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this
    //设置分享
    util.showShareMenu()

    fromApp = 0
    activeSysNo = 0
    fromUserNo = ''

    downSecond = 0
    limitTimer = null

    if (!(options.FromApp == undefined)) {
      fromApp = options.FromApp
    }

    if (!(options.fromApp == undefined)) {
      fromApp = options.fromApp
    }

    if (!(options.ActiveSysNo == undefined)) {
      activeSysNo = options.ActiveSysNo
    }
    if (!(options.fromUserSysNo == undefined)) {
      fromUserNo = options.fromUserSysNo
    }
    if (!(options.FromUserSysNo == undefined)) {
      fromUserNo = options.FromUserSysNo
    }

    refreshPageData()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.loginphonesuccess) {
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }
  },
  
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    if (that.sharemodal)
    {
      that.sharemodal.hideModal()
    }

    if (that.dialog) {
      that.dialog.hideDialog()
    }

    var path = ' pages/active/givehelp?ActiveSysNo=' + activeSysNo
    path = util.getSharePath(path)

    //没有活动
    if (that.data.activeInfo == null) {
      return
    }
    
    //获取分享术语
    var title = that.data.activeInfo.ShareTitle

    if (title == null || title.length == 0) {
      title = '快来帮我助力，一起免费领红包'
    }

    var imageurl = that.data.activeInfo.ShareImgUrl
    if (imageurl == null || imageurl.length == 0) {
      //imageurl = that.data.productDetail.PictureUrls[0]
    }

    return {
      title: title,
      path: path,
      imageUrl: imageurl,
      success: function (res) {
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
  buttonClick: function () {
    buttonClickProcess()
  },
  //关闭分享弹框
  _closeShareDialog: function () {
    that.dialog.hideDialog();
  },
  //按钮事件
  _buttonClick: function () {
    util.toCouponList()

    that.dialog.hideDialog();
  },
  closeCouponView() {
    //触发取消回调
    that.setData({
      isShowCouponImage: false,
    })
  },
  //按钮事件
  couponViewClick() {
    util.toCouponList()

    that.setData({
      isShowCouponImage: false,
    })
  },
  onHide: function () {
    // 页面隐藏
    //clearTimer()
  },
  onUnload: function () {
    // 页面关闭
    clearTimer()
  },
  _confirmModal: function () {
    that.sharemodal.showModal();
  },
  _cancelModal: function () {
    that.sharemodal.hideModal();
  },
  toHome: function () {
    //wx.showShareMenu()
    util.toHome()
  },
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

  wx.showLoading()
  getShareActive()
}

//***************红包活动****************//
//获取助力红包
function getShareActive() {

  if (fromUserNo == null || fromUserNo.length == 0) {
    fromUserNo = app.globalData.customerInfo.CustomerSysNo
  }

  if (app.globalData.customerInfo == null)
  {
    return
  }

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveType = appenum.ActiveType.GiveHelp.Value
  data.ActiveSysNo = activeSysNo
  data.FromUserNo = fromUserNo

  util.requestGet('GetTaskProgressService', data, getShareActiveSuccess, getShareActiveFail, null)

  wx.showLoading()
}

function getShareActiveSuccess(res) {

  wx.hideLoading()

  if (res.data != null && res.data.Entity != null) {
    that.setData({
      activeInfo: res.data.Entity,
    })

    showActiveInfo()

    var dailyHelpLimitCount = util.getSysDataConfigValue('DailyHelpLimitCount')
    if (dailyHelpLimitCount) {
      that.setData({
        DailyHelpLimitCount: parseInt(dailyHelpLimitCount),
      })
    }

    return
  }

  if (res.data.ResponseStatus != null && res.data.ResponseStatus.Message != null && res.data.ResponseStatus.Message.length > 0) {
    wx.showModal({
      title: '红包提示',
      content: res.data.ResponseStatus.Message,
      showCancel: false,
    })
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
}

function getShareActiveFail() {
  wx.hideLoading()
}

//保存log
function saveActiveLog() {

  if (that.data.activeInfo == null) {
    return
  }

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveType = appenum.ActiveType.GiveHelp.Value
  data.ActiveSysNo = that.data.activeInfo.ActSysNo
  data.FromUserNo = fromUserNo
  //data.ShareTargetID = openGId

  wx.showLoading()
  util.requestPost('SaveActiveLogService', data, saveActiveLogSuccess, saveActiveLogFail, null)
}

function saveActiveLogSuccess(res) {

  wx.hideLoading()

  if (res.data != null && res.data.Entity != null) {

    that.setData({
      activeInfo: res.data.Entity,
    })

    showActiveInfo()
    return
  }

  /*
  if (res.data.ResponseStatus != null && res.data.ResponseStatus.Message != null && res.data.ResponseStatus.Message.length > 0) {
    wx.showModal({
      title: '红包提示',
      content: res.data.ResponseStatus.Message,
      showCancel: false,
    })
  }*/

  if (res.data != null && res.data.ResponseStatus != null) {
    if (res.data.ResponseStatus.ErrorCode == 306128) {
      var message = res.data.ResponseStatus.Message

      if (!message) {
        message = "很抱歉，必须新注册用户才可帮助好友助力哦！您可以邀请好友为您助力"
      }

      //分享 
      showShareModal(message)

      that.setData({
        showShareButton: true,
        buttonText: '我也要免费领取',
        statusText: '未助力',
        giveMemo: '您也可以试试分享好友助力领红包',
      })
    }
    else {
      if (res.data.ResponseStatus.Message) {
        wx.showModal({
          title: '助力提示',
          content: res.data.ResponseStatus.Message,
          showCancel: false,
        })
      }
    }
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
}

function showShareModal(message) {
  that.setData({
    sharemodalTitle: '助力提示',
    sharemodalContent: message,
    sharemodalconfirmText: '邀请好友',
    sharemodalcancelText: '取消',
    sharemodalisShowShare: true,
  })

  //控件指定
  that.sharemodal = that.selectComponent("#sharemodal");

  that.sharemodal.showModal();
}

function saveActiveLogFail() {
  wx.hideLoading()
}

//领取红包
function receiveCoupon() {
  if (that.data.activeInfo == null) {
    return
  }

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveSysNo = that.data.activeInfo.ActSysNo

  wx.showLoading()

  util.requestPost('ReceiveCouponServiceV4', data, receiveCouponSuccess, receiveCouponFail, null)
}

function receiveCouponSuccess(res) {

  wx.hideLoading()

  if (res.data != null && res.data.Entity != null) {

    that.setData({
      activeInfo: res.data.Entity
    })

    showActiveInfo()

    /*
    var message = '恭喜您获得' + res.data.Entity.ActAmt + '元红包！'

    wx.showModal({
      title: '领取红包成功',
      content: message,
      showCancel: true,
      confirmText: '立即使用',
      success: function (res) {
        if (res.confirm) {
          util.toCouponList()
        }
      }
    })
    */

    var message = '恭喜您获得' + res.data.Entity.ActAmt + '元红包！'
    showReceivedDialog(message)

    return
  }

  if (res.data.ResponseStatus != null && res.data.ResponseStatus.Message != null && res.data.ResponseStatus.Message.length > 0) {
    wx.showModal({
      title: '红包提示',
      content: res.data.ResponseStatus.Message,
      showCancel: false,
    })
  }

  wx.hideLoading()
  //util.showToast(res.data.ResponseStatus.Message, -1)
}

function showReceivedDialog(message) {
  if (that.data.activeInfo != null) {
    that.setData({
      shareDialogTitle: '红包领取成功',
      shareDialogContent: message,
      shareDialogbuttonText: '立即使用',
      shareDialogisShowShare: false,
    })

    //控件指定
    that.dialog = that.selectComponent("#sharedialog");

    that.dialog.showDialog();
  }

}

function receiveCouponFail() {
  wx.hideLoading()
}


function showActiveInfo() {

  if(that.data.activeInfo == null)
  {
    return
  }

  var showShareButton = false
  var buttonText = ""
  var statusText = ""
  var giveMemo = ""
  

  //非自己打开
  if (app.globalData.customerInfo.CustomerSysNo != fromUserNo) {

    //其他人已打开
    //已经完成
    if (that.data.activeInfo.ActStatus == that.data.Complete) {

      showShareButton = true
      buttonText = "我也要免费领取"
      statusText = "助力成功"
      giveMemo = "您也可以试试免费领取助力红包"
      //显示用户红包
      showRegCoupon()
    }

    //已经领取
    if (that.data.activeInfo.ActStatus == that.data.Received) {

      showShareButton = true
      buttonText = "我也要免费领取"
      statusText = "助力成功"
      giveMemo = "您也可以试试分享好友助力领红包"

      //显示用户红包
      showRegCoupon()
    }

    //分享
    if (that.data.activeInfo.ActStatus == that.data.NoComplete) {

      if (that.data.activeInfo.HelpStatus == appenum.HelpStatus.Helped.Value) 
      {
        //已助力
        showShareButton = true
        buttonText = "我也要免费领取"
        statusText = "已助力"
        giveMemo = "您也可以试试分享好友助力领红包"

        //显示用户红包
        showRegCoupon()
      }
      else
      {
        //未助力
        showShareButton = false
        buttonText = "助他免费领取红包"
        statusText = "未助力"
        giveMemo = "帮好友助力，获得分享好友助力领红包资格"
        
        if (that.data.activeInfo.HelpStatus != undefined) {
          //自动助力
          saveActiveLog()

          //显示用户红包
          showRegCoupon()
        }
      }
    }

    if (that.data.activeInfo.ActStatus == that.data.Stoped) {
      //活动结束
      showShareButton = false
      buttonText = "去逛逛"
      statusText = "活动已结束"
      giveMemo = "很抱歉，您来晚了，活动已经结束"

      //显示用户红包
      showRegCoupon()
    }
  }
  else
  {
    //自己打开
    //已经完成
    if (that.data.activeInfo.ActStatus == that.data.Complete) {
      //领取红包
      receiveCoupon()

      showShareButton = false
      buttonText = "领取红包"
      statusText = "助力成功"
      giveMemo = "恭喜您，已助力成功，赶快去领红包吧"
    }

    //已经领取
    if (that.data.activeInfo.ActStatus == that.data.Received) {
      
      // //已经领取
      // util.toCouponList()

      showShareButton = false
      buttonText = "立即使用"
      statusText = "红包已领取"
      giveMemo = "红包已发放，赶紧去使用吧"
    }

    //分享
    if (that.data.activeInfo.ActStatus == that.data.NoComplete) {

      //分享好友助力
      showShareButton = true
      buttonText = "分享好友助力"
      statusText = "好友助力中"

      if (that.data.activeInfo.ActJoinTimes > 0)
      {
        var num = that.data.activeInfo.ActNeedTimes - that.data.activeInfo.ActJoinTimes

        giveMemo = "已有" + that.data.activeInfo.ActJoinTimes + "位好友助力，还差" + num + "位助力成功"

      }
      else
      {
        giveMemo = "分享" + that.data.activeInfo.ActNeedTimes + "位好友助力，即可免费获得红包"
      }
    }

    if (that.data.activeInfo.ActStatus == that.data.Stoped) {
      //活动结束
      showShareButton = false
      buttonText = "去逛逛"
      statusText = "活动已结束"
      giveMemo = "很抱歉，您来晚了，活动已经结束"
    }
  }

  that.setData({
    showShareButton:showShareButton,
    buttonText: buttonText,
    statusText: statusText,
    giveMemo: giveMemo,
    //timeMemo: timeMemo,
  })

  var timeMemo = ""
  if (that.data.activeInfo.EndMSeconds >= 1 && that.data.activeInfo.ActStatus != that.data.Stoped) {
    
    //倒计时
    downSecond = parseInt(that.data.activeInfo.EndMSeconds/1000)
    clearTimer()
    limitTimer = setInterval(showLimitTime, 1000)
  }
  else {
    timeMemo = "已结束"
    that.setData({
      timeMemo: timeMemo,
    })
  }
}

function showLimitTime()
{
  var timeMemo = ""
  downSecond = downSecond - 1 

  if (downSecond <= 1)
  {
    timeMemo = "已结束"
    clearTimer()
  }
  else{
    timeMemo = util.dateformat(downSecond)
  }
  
  that.setData({
    timeMemo: timeMemo,
  })
}

function clearTimer()
{
  if (limitTimer != null) {
    clearInterval(limitTimer)
  }
}

function buttonClickProcess()
{
  //非自己打开
  if (app.globalData.customerInfo.CustomerSysNo != fromUserNo) {

    //其他人已打开
    //已经完成
    if (that.data.activeInfo.ActStatus == that.data.Complete) {

    }

    //已经领取
    if (that.data.activeInfo.ActStatus == that.data.Received) {

    }

    //分享
    if (that.data.activeInfo.ActStatus == that.data.NoComplete) {

      //助力
      saveActiveLog()
    }

    if (that.data.activeInfo.ActStatus == that.data.Stoped) {

      //去首页
      util.toHome()
    }
  }
  else {
    //自己打开
    //已经完成
    if (that.data.activeInfo.ActStatus == that.data.Complete) {
      //领取红包
      receiveCoupon()
    }

    //已经领取
    if (that.data.activeInfo.ActStatus == that.data.Received) {

      //红包列表
      util.toCouponList()
    }

    //分享
    if (that.data.activeInfo.ActStatus == that.data.NoComplete) {

    }

    if (that.data.activeInfo.ActStatus == that.data.Stoped) {
      //去首页
      util.toHome()
    }
  }
}

//***************红包活动****************//

function showRegCoupon()
{
  if (app.globalData.showRegCouponView)
  {
    app.globalData.showRegCouponView = false

    that.setData({
      isShowCouponImage: true,
    })
  }
}