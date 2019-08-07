// pages/refund/orderrefund.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var scrollPaddingTopValue = appconst.scrollPaddingTopValue

var app = getApp()
var dataType

var that

const timetotal = 60
var regType = 6
var countDownTimer
var timecount

var isSubimting

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
    selecttype:0,

    showReloadView: false,
    customerOrderType:0,
    phoneOrderType: 1,

    listCustomerOrder:null,
    listPhoneOrder:null,

    Phone: null,
    VerificationCode: null,
    ThridOrderID: null,
    PhoneFocus: false,
    VerificationCodeFocus: false,
    ThridOrderIDFocus:false,
    HideVerButton: false,
    showButtomName: '获取验证码',
    hideButtomName: '重新获取',

    soRefundMemo:null,
    scrollPaddingTop:0,
    isDoSearch:false,
    showTOIDMemoView:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this

    isSubimting = false

    var windowHeight = app.globalData.systemInfo.windowHeight
    var windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,

      selecttype:0,
    })

    refreshPageData()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.loginphonesuccess) {
      //hideReloadView()
      app.globalData.loginphonesuccess = false
      refreshPageData()
      return
    }
  },
  appdealList: function (e) {
    toMyRefund()
  },
  selectMytype: function (e) {
    var index = e.currentTarget.dataset.index
   

    that.setData({
      selecttype: index,
      PhoneFocus:index == that.data.phoneOrderType,
    })
  },
  bindPhoneInput: function (e) {
    that.setData({
      Phone: e.detail.value
    })
  },
  bindPwdInput: function (e) {
    that.setData({
      Pwd: e.detail.value
    })
  },
  bindVerificationCodeInput: function (e) {
    that.setData({
      VerificationCode: e.detail.value
    })
  },
  getVerificationCode: function (e) {
    getVerificationCode()
  },
  bindThridOrderIDInput: function (e) {
    that.setData({
      ThridOrderID: e.detail.value
    })
  },
  showTOIDMemo: function (e) {
    that.setData({
      showTOIDMemoView:true,
    })
  },
  hideTOIDMemo: function (e) {
    that.setData({
      showTOIDMemoView: false,
    })
  },
  search: function (e) {

    if (isSubimting) {
      return
    }

    if (checkPhone() == false) {
      return
    }

    if (checkInput() == false) {
      return
    }

    if (util.isTempCustomer()) {
      util.confirmToLoginPhone()
      return
    }

    getCanAppealSo(that.data.phoneOrderType)
  },
  selectItem: function (e) {
    var soSysNo = e.currentTarget.dataset.sosysno
    toOrderRefund(soSysNo)
  },//下拉刷新
  onPullDownRefresh: function () {

    clearData()
    //等待授权
    refreshPageData()
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

  // that.setData({
  //   wxopenid:app.globalData.userInfo.openId,
  // })

  getaPageData()
}

function getaPageData() {

  getCanAppealSo(that.data.customerOrderType)
  getLastAppeal()
  //显示退款说明
  setTimeout(setRefundMemo,600)
}

//获取最后一条记录
function getLastAppeal()
{
  if (app.globalData.customerInfo == null) {
    return
  }
  
  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  data.PageSize = 1
  data.CurrentPage = 1

  util.requestGet('GetSOAppealListService', data, getAppealListSuccess, getAppealListFail, null)
}

function getAppealListSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    if (res.data.Entity.length > 0) {
      showAppealList(res.data.Entity)
      return
    }
  }

  //util.showToast(res.data.ResponseStatus.Message, -1);
}

function showAppealList(list) {

  that.setData({
    appeallist: list
  })
}

function getAppealListFail() {

}

function setRefundMemo()
{
  var soRefundMemo = util.getSysDataConfigValue('SoRefundMemo')
  var scrollPaddingTop = 0
  if (soRefundMemo != null && soRefundMemo.length > 0) {
    scrollPaddingTop = scrollPaddingTopValue
  }

  that.setData({
    soRefundMemo: soRefundMemo,
    scrollPaddingTop: scrollPaddingTop,
  })
}


//获取可申请订单
function getCanAppealSo(orderType) {

  if (app.globalData.customerInfo == null)
  {
    return
  }

  var data = {};

  data.Type = orderType

  dataType = data.Type

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  if (data.Type == that.data.phoneOrderType)
  {
    data.Phone = that.data.Phone
    data.VerificationCode = that.data.VerificationCode
    if (that.data.ThridOrderID != null && that.data.ThridOrderID.length > 0)
    {
      data.ThridOrderID = that.data.ThridOrderID
    }
  }

  isSubimting = true

  util.requestGet('GetCanAppealSOService', data, getCanAppealSoSuccess, getCanAppealSoFail, null)
}

function getCanAppealSoSuccess(res) {

  if (res.data != null && res.data.Entity != null) {

    if (res.data.Entity.length > 0) {

      if (dataType == that.data.customerOrderType)
      {
        that.setData({
          listCustomerOrder: res.data.Entity
        })
      }


      if (dataType == that.data.phoneOrderType) {
        that.setData({
          listPhoneOrder: res.data.Entity
        })
      }
      //isSubimting = false
      //return
    }
  }
  else
  {


    if (res.data != null && res.data.ResponseStatus != null)
    {
      if(res.data.ResponseStatus.ErrorCode == 309013) {
        var message = res.data.ResponseStatus.Message
        if (message == null || message.length == 0) {
          message = "未找到可申诉订单，如果您开启了手机号码保护，请输入外卖平台订单号"
        }

        wx.showModal({
          title: '提示',
          content: message,
          showCancel: false,
          success: function (res) {
            if (res.confirm) {

            }
          }
        })
      }
      else
      {
        util.showToast(res.data.ResponseStatus.Message, -1);
      }
    }
  }
  
  isSubimting = false
  if (dataType == that.data.phoneOrderType) {
    that.setData({
      isDoSearch: true
    })
  }
 
}

function getCanAppealSoFail() {
  isSubimting = false
}


function getVerificationCode() {
  
  if (checkPhone() == false) {
    return
  }

  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.Phone = that.data.Phone
  data.SMSType = regType

  util.requestPost('GetSMSVCodeService', data, getVerificationCodeSuccess, getVerificationCodeFail, null)
}

function getVerificationCodeSuccess(res) {
  if (res.data != null && res.data.Entity != null && res.data.Entity.result) {

  
    util.showToast('验证码已发送，请注意查收短信', -1);

    timecount = timetotal
    var hideButtomName = '已发送(' + timecount + ')'
    that.setData({
      HideVerButton: true,
      showButtomName: '重新获取',
      hideButtomName: hideButtomName
    })

    countDownTimer = setInterval(countDown, 1000)

    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function countDown() {
  timecount--;
  var hideButtomName = '重新获取(' + timecount + ')'
  that.setData({
    hideButtomName: hideButtomName
  })

  if (timecount <= 0) {
    clearTimer()

    that.setData({
      HideVerButton: false
    })
  }
}

//清空定时刷新
function clearTimer() {
  if (countDownTimer != null) {
    clearInterval(countDownTimer)
  }
}


function getVerificationCodeFail() {

}

function checkPhone() {
  if (that.data.Phone == null ||
    that.data.Phone == "") {
    util.showModel("提示", "请输入您的收货手机号")
    // that.setData({
    //   PhoneFocus: true,
    // })
    return false
  }

  if (that.data.Phone.substring(0, 1) == "1" && !util.checkPhone(that.data.Phone)) {
    util.showModel("提示", "您的收货手机号填写错误，请正确填写")
    // that.setData({
    //   PhoneFocus: true,
    // })
    return false
  }

  // if (that.data.Phone.substring(0, 1) == "1" && that.data.Phone.length != 11) {
  //   util.showModel("提示", "您的手机号填写错误，请正确填写")
  //   return false
  // }
}

function checkInput() {

  if (that.data.VerificationCode == null ||
    that.data.VerificationCode == "") {
    util.showModel("提示", "请输入验证码")
    // that.setData({
    //   VerificationCodeFocus: true,
    // })
    return false
  }
}

function toMyRefund() {
  wx.navigateTo({
    url: '../refund/myrefund'
  })
}

function toOrderRefund(soSysNo) {
  wx.navigateTo({
    url: '../refund/orderrefund?soSysNo=' + soSysNo
  })
}

function clearData()
{
  if (timecount <= 0) {
    clearTimer()
  }

  that.setData({
    appeallist: null,
    selecttype:0,
    customerOrderType:0,
    phoneOrderType: 1,

    listCustomerOrder:null,
    listPhoneOrder:null,

    Phone: null,
    VerificationCode: null,
    PhoneFocus: false,
    VerificationCodeFocus: false,
    HideVerButton: false,

    showButtomName: '获取验证码',
    hideButtomName: '重新获取',

    soRefundMemo:null,
    scrollPaddingTop:0,
    isDoSearch:false,
  })
}

function showReloadView() {
  that.setData({
    showReloadView: true
  })
}

function hideReloadView() {
  that.setData({
    showReloadView: false
  })
}

//*************** 显示Toast ************//
/*
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
*/
//*************** 显示Toast ************//