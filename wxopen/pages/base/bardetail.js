// pages/about/webview.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

//var title
var sysNo
var fromApp = 0
var activeSysNo

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url: null,

    isIpx: app.globalData.isIpx ? true : false,
    canLaunchApp: util.canLaunchApp(),
    fromApp: fromApp,

    activeInfo: null,
    shareDialogTitle: '分享微信群得红包',
    shareDialogContent: '',
    shareDialogbuttonText: '立即分享',
    shareDialogisShowShare:true,

    Complete: appenum.ActStatus.Complete.Value,
    Received: appenum.ActStatus.Received.Value,
    NoComplete: appenum.ActStatus.NoComplete.Value,

    shareDialogShow:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //title = '妙生活';

    sysNo = 0

    if (!(options.SysNo == undefined)) {
      sysNo = options.SysNo;
    }

    if (sysNo == 0) {
      wx.navigateBack(-1);
      return;
    }

    fromApp = 0

    if (!(options.FromApp == undefined)) {
      fromApp = options.FromApp
    }

    if (!(options.fromApp == undefined)) {
      fromApp = options.fromApp
    }
    
    /*
    if (!(options.ActiveSysNo == undefined)) {
      activeSysNo = options.ActiveSysNo
    }*/

    //设置分享
    util.showShareMenu()

    //获取地址并清空
    var url = util.getWebUrl("FruitBar?SysNo=" + sysNo + "&fromapp=1")

    that = this

    that.setData({
      url: url,
    })

    //获取页面数据
    //refreshPageData()
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

    /*
    if (app.globalData.loginphonesuccess) {
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }*/
  },
  loadSuccess: function (e) {

  },
  loadFail: function (e) {

  },
  //红包悬浮点击事件
  _folatcoupon_click: function () {
    couponProcess()
  },
  //关闭分享弹框
  _closeShareDialog: function () {
    that.dialog.hideDialog();
    showAcitve(false)
  },
  //按钮事件
  _buttonClick: function () {
    util.toCouponList()

    showAcitve(false)
    that.dialog.hideDialog();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

    if (sysNo == 0) {
      return;
    }

    var path = 'pages/base/bardetail?SysNo=' + sysNo

    path = util.getSharePath(path)

    //没有活动 分享商品
    if (that.data.activeInfo == null) 
    {
      return {
        path: path,
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
    }
    else
    {
      //获取分享术语
      var title = that.data.activeInfo.ShareTitle
      var imageurl = that.data.activeInfo.ShareImgUrl

      return {
        title: title,
        path: path,
        imageUrl: imageurl,
        success: function (res) {
          if (res.shareTickets && res.shareTickets[0]) {
            //获取分享信息及上报解密
            console.log('获取到群签名:' + JSON.stringify(res))
            
            getShareInfo(res.shareTickets[0], path, appenum.WXOpenShareLogType.Share.Value, saveShareInfoSuccess)
          }
          else {
            util.saveNoTicketShareInfo(path, appenum.WXOpenShareLogType.Share.Value)
            if (that.data.activeInfo.ActStatus == that.data.NoComplete)
            {
              //必须分享到群提醒
              wx.showModal({
                title: '红包提醒',
                content: '必须分享到微信群，才能领取红包！',
                showCancel: false,
              })
            }
          }
        },
        fail: function (res) {
        }
      }
    }
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

  /*
  if (activeSysNo) {
    getShareActive()
  }*/
}

//是否展示活动 展示则隐藏web-view
function showAcitve(isShow)
{
  that.setData({
    shareDialogShow: isShow,
  })
}


//***************红包活动****************//
//获取果吧红包
function getShareActive() {
  var data = {};

  data.FromUserNo = app.globalData.customerInfo.CustomerSysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveType = appenum.ActiveType.FruitsBar.Value
  // if (activeSysNo) {
  //   data.ActiveSysNo = activeSysNo
  // }
  data.BusinessNo = sysNo

  util.requestGet('GetTaskProgressService', data, getShareActiveSuccess, getShareActiveFail, null)
}

function getShareActiveSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    that.setData({
      activeInfo: res.data.Entity
    })

    //控件指定
    that.dialog = that.selectComponent("#sharedialog");

    if (that.data.activeInfo.ActStatus != that.data.Received) {
      showShareDialog() 
    }

    return
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
}

function getShareActiveFail() {

}

//保存log
function saveActiveLog(openGId) {

  if (that.data.activeInfo == null) {
    return
  }

  var data = {};
  data.FromUserNo = app.globalData.customerInfo.CustomerSysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveType = appenum.ActiveType.FruitsBar.Value
  data.ActiveSysNo = that.data.activeInfo.ActSysNo
  data.BusinessNo = sysNo
  data.ShareTargetID = openGId

  util.requestPost('SaveActiveLogService', data, saveActiveLogSuccess, saveActiveLogFail, null)
}

function saveActiveLogSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    that.setData({
      activeInfo: res.data.Entity
    })
    
    //隐藏弹框
    that.dialog.hideDialog()

    //继续分享
    couponProcess()

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

function saveActiveLogFail() {

}

//领取红包
function receiveCoupon() {
  if (that.data.activeInfo == null) {
    return
  }

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveSysNo = that.data.activeInfo.ActSysNo

  util.requestPost('ReceiveCouponServiceV4', data, receiveCouponSuccess, receiveCouponFail, null)
}

function receiveCouponSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    that.setData({
      activeInfo: res.data.Entity
    })

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
    })*/

    var message = '恭喜您获得' + res.data.Entity.ActAmt + '元红包！'
    showReceivedDialog(message)

    return
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
}

function receiveCouponFail() {

}

function couponProcess() {
  if (that.data.activeInfo != null) {


    //已经完成
    if (that.data.activeInfo.ActStatus == that.data.Complete) {

      showAcitve(false)

      //领取红包
      receiveCoupon()
    }

    //已经领取
    if (that.data.activeInfo.ActStatus == that.data.Received) {
      // wx.showModal({
      //   title: '13',
      //   content: that.data.activeInfo.ActStatus,
      // })

      showAcitve(false)

      //领取红包
      util.toCouponList()
    }

    //分享
    if (that.data.activeInfo.ActStatus == that.data.NoComplete) {
      // wx.showModal({
      //   title: '14',
      //   content: that.data.activeInfo.ActStatus,
      // })
      //领取红包
      showShareDialog()
    }
  }
}

function showShareDialog() {
  if (that.data.activeInfo != null) {

    var content = "分享到" + that.data.activeInfo.ActNeedTimes + "个群，立得" + that.data.activeInfo.ActAmt + "元红包"
    var buttonText = "立即分享"

    if (that.data.activeInfo.ActJoinTimes > 0) {
      var num = that.data.activeInfo.ActNeedTimes - that.data.activeInfo.ActJoinTimes

      content = "您已成功分享" + that.data.activeInfo.ActJoinTimes + "个群，继续分享" +
        num + "个群，可得"
        + that.data.activeInfo.ActAmt + "元红包"
      buttonText = "继续分享"
    }

    that.setData({
      shareDialogTitle: '分享微信群得红包',
      shareDialogContent: content,
      shareDialogbuttonText: buttonText,
      shareDialogisShowShare: true,
    })

    showAcitve(true)
    that.dialog.showDialog();
  }

}

function showReceivedDialog(message) {
  if (that.data.activeInfo != null) {
    that.setData({
      shareDialogTitle: '红包领取成功',
      shareDialogContent: message,
      shareDialogbuttonText: '立即使用',
      shareDialogisShowShare: false,
    })

    showAcitve(true)
    that.dialog.showDialog();
  }

}

//******************分享处理****************//

function getShareInfo(shareTicket, path, logtype) {

  console.log('开始获取分享群信息')

  wx.getShareInfo({
    shareTicket: shareTicket,
    success: function (res) {

      console.log('获取分享群信息成功:' + JSON.stringify(res))
      //util.showToast('获取分享群信息成功',-1)
      //保存
      saveShareInfo(res, shareTicket, path, logtype)
    },
    fail: function (res) {
      console.log('获取分享群信息失败:' + JSON.stringify(res))
      //util.showToast('获取分享群信息失败', -1)
      util.saveNoTicketShareInfo(path, logtype)
    },
    complete: function (res) {
      //saveNoTicketShareInfo(path, logtype)
    },
  })

}

function saveShareInfo(res, shareTicket, path, logtype) {

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.LogType = logtype

  data.path = path
  data.shareTicket = shareTicket

  data.openid = app.globalData.userInfo.openId
  data.rawData = res.rawData
  data.encryptedData = res.encryptedData
  data.iv = res.iv

  //util.showToast('提交分享群信息日志 群活动', -1)
  console.log('提交分享群信息日志 群活动')

  util.requestPost(appconst.SaveWXOpenShareLogService, data, saveShareInfoSuccess, saveShareInfoFail, null)
}


function saveShareInfoSuccess(res) {
  //util.showToast("分享完成", -1)

  if (res.data != null && res.data.Entity != null) {
    //util.showToast('提交分享群信息日志成功', -1)
    console.log('提交分享群信息日志成功 群活动:' + JSON.stringify(res))
    var openGId = res.data.Entity.openGId
    if (openGId != null && openGId.length > 0) {

      console.log('保存群活动日志')
      //util.showToast('保存群活动日志', -1)
      //保存分享到群记录
      saveActiveLog(openGId)
      return
    }
    else {
      util.showToast("很抱歉，分享异常，请您重试", -1)
    }
  }

  util.showToast("很抱歉，分享异常，请您重试", -1)
}

function saveShareInfoFail() {
  util.showToast("很抱歉，分享异常，请您重试", -1)
}
//******************分享处理****************//

//***************红包活动****************//

