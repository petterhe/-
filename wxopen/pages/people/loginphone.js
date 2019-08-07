// pages/people/loginphone.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')
const applogin = require('../../utils/applogin.js')

var userInfo_key = appconst.userInfo_key

const timetotal = 60
var regType = 0
var countDownTimer
var timecount

// //提交时间对象
// var submitTimeObject
var isSubimting

var fromPage = 0

var fastType ////极速绑定 0 否 1 是
var encryptedData
var iv
var afterShowRegCoupon

var fromShouYin
var pNo

var formId

Page({

  /**
   * 页面的初始数据
   */
  data: {
    Phone: null,
    Pwd: null,
    VerificationCode: null,
    InvitationCode: null,
    PhoneFocus: false,
    PwdFocus: false,
    VerificationCodeFocus: false,
    windowHeight: 0,
    windowWidth: 0,
    HideVerButton:false,
    showButtomName:'获取验证码',
    hideButtomName:'重新获取',

    FastBindImgUrl: null,
    // FastBindBtnUrl: appconst.FastBindBtnUrl,
    isShowfast: wx.canIUse('button.open-type.getPhoneNumber'),
    isShowCouponImage: false,

    isNotAuth: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this

    //注册类型 绑定
    regType = appenum.RegType.Bind.Value
    countDownTimer = null
    timecount = 0
    fromPage = 0

    fastType = 0 
    encryptedData = null
    iv = null
    afterShowRegCoupon = 0

    //收银使用
    fromShouYin = 0
    pNo = 0

    //获取参数
    if (!(options.FromPage == undefined)) {
      fromPage = 1
    }

    if (!(options.FromShouYin == undefined)) {
      fromShouYin = 1
    }

    if (!(options.PNo == undefined)) {
      pNo = options.PNo
    }

    if (!(options.afterShowRegCoupon == undefined)) {
      afterShowRegCoupon = options.afterShowRegCoupon
    }

    
    // //初始化提交时间
    // submitTimeObject = new Object()
    // submitTimeObject.lastSubmitTime = null
    isSubimting = false

    var fastBindImgUrl = util.getSysDataConfigValue('WXOpenFastBindImg')

    if (fastBindImgUrl == null || fastBindImgUrl.length == 0)
    {
      fastBindImgUrl = appconst.FastBindImgUrl
    }


    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      FastBindImgUrl: fastBindImgUrl,
      PhoneFocus: false,
      VerificationCodeFocus: false,
      isNotAuth:app.globalData.customerInfo == null
    })

    checkCustomerType()
  },
  bindPhoneInput:function(e)
  {
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
  bindInvitationCodeInput: function (e) {
    that.setData({
      InvitationCode: e.detail.value
    })
  },
  getVerificationCode: function (e) {
    getVerificationCode()
  },
  submit:function (e) {
    formId = e.detail.formId
  },
  save: function (e) {
    save()
  },
  closefast: function (e) {
    that.setData({
      isShowfast:false,
      PhoneFocus:true,
    })
  },
  closeCouponView() {
    //触发取消回调
    that.setData({
      isShowCouponImage: false,
    })
    //返回
    wx.navigateBack()
  },
  //按钮事件
  couponViewClick() {
    toCouponlist()

    that.setData({
      isShowCouponImage: false,
    })
  },
  getPhoneNumber: function (e) {

    // wx.showModal({
    //   title: '11',
    //   content: formId,
    // })
    // return
    if (e.detail != null) {
      //获取
      if (e.detail.encryptedData
        && e.detail.iv) {
        if (isSubimting) {
          return
        }

        fastType = 1
        encryptedData = e.detail.encryptedData
        iv = e.detail.iv

        getPhoneNumber()
      }
    }
    
  },
  onGotUserInfo: function (e) {
    //isClicked = true
    if (e.detail != null) {
      if (e.detail.errMsg != null && e.detail.errMsg.indexOf("fail auth deny") >= 0) {

        showAuthMessage()
        //isClicked = false
        return
      }

      app.globalData.refreshuserInfo = true
      app.globalData.scopeuserInfo = true
      //scopeuserInfo = true

      wx.login({
        success: function (res) {
      
          app.globalData.logincode = res.code
          //设置用户
          applogin.setLoginInfo(e.detail)

          //解析分享信息
          //applogin.getShareInfo()

          //获取用户
          applogin.getUserOpenInfo(getUserOpenInfoSuccess)

        },
        fail(res) {
          app.globalData.userloginflag = -1
        }
      })


      //获取用户
      //applogin.getUserOpenInfo(getUserOpenInfoSuccess)
      return
    }
  },
})

function getUserOpenInfoSuccess(res)
{
  //已经授权
  that.setData({
    isNotAuth: false
  })

  applogin.setisloginphone(true)
  applogin.getUserOpenInfoSuccess(res)

  // if (!util.isTempCustomer()) {
  //   app.globalData.loginphonesuccess = true
  //   wx.navigateBack(-1)
  // }
}

function showAuthMessage() {
  wx.showModal({
    title: '提示',
    content: '必须先允许授权才能登录使用哦~',
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
      }
    }
  })
}


function getVerificationCode()
{
  // if (!util.checkCustomerInfo())
  // {
  //   return
  // }

  if(!checkCustomerType())
  {
    return
  }

  if(checkPhone() == false)
  {
    return
  }

  if (app.globalData.customerInfo == null) {
    setTimeout(getVerificationCode, 300)
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

    util.showToast('验证码已发送，请注意查收短信')

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

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function countDown() {

  timecount--;
  var hideButtomName = '重新获取(' + timecount + ')'
  that.setData({
    hideButtomName: hideButtomName
  })

  if(timecount <=0 )
  {
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

function checkPhone(){
  if (that.data.Phone == null ||
    that.data.Phone == "") {
    util.showModel("提示", "请输入您的手机号")
    return false
  }

  if (that.data.Phone.substring(0, 1) == "1" && !util.checkPhone(that.data.Phone)) {
    util.showModel("提示", "您的手机号填写错误，请正确填写")
    return false
  }

  // if (that.data.Phone.substring(0, 1) == "1" && that.data.Phone.length != 11) {
  //   util.showModel("提示", "您的手机号填写错误，请正确填写")
  //   return false
  // }
}

function checkInput() {

  /*
  if (that.data.Pwd == null ||
    that.data.Pwd == "") {
    util.showModel("提示", "请输入密码")
    return false
  }

  if (that.data.Pwd.length < 6) {
    util.showModel("提示", "密码长度不能小于6位")
    return false
  }

  if (that.data.Pwd.length > 16) {
    util.showModel("提示", "密码长度不能大于16位")
    return false
  }
  */
  if (that.data.VerificationCode == null ||
    that.data.VerificationCode == "") {
    util.showModel("提示", "请输入验证码")
    return false
  }
}

function getPhoneNumber()
{

  //提交时 等待formId
  if (!formId) {
    setTimeout(getPhoneNumber, 300)
    return
  }

  //快速绑定
  saveUser(1)

  that.setData({
    isShowfast: false,
  })

}

function save()
{
  //提交时 等待formId
  if(!formId)
  {
    setTimeout(save,300)
    return
  }

  // if (!util.checkCustomerInfo()) {
  //   return
  // }

  if (app.globalData.customerInfo == null)
  {
    setTimeout(save, 300)
    return
  }

  if (!checkCustomerType()) {
    return
  }

  if (isSubimting) {
    return
  }

  if (checkPhone() == false) {
    return
  }

  if (checkInput() == false) {
    return
  }

  fastType = 0
  saveUser(1)
}

function saveUser(saveByInvitationCode){

  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  data.WXOpenFastType = fastType

  if (data.WXOpenFastType == 0)
  {
    that.data.Pwd = that.data.Phone.substring(that.data.Phone.length - 6)

    
    data.Phone = that.data.Phone
    data.Pwd = that.data.Pwd
    data.VerificationCode = that.data.VerificationCode
  }
  else
  {
    data.iv = iv
    data.encryptedData = encryptedData
  }
  
  // if (that.data.InvitationCode != null && that.data.InvitationCode.length > 0)
  // {
  //   data.InvitationCode = that.data.InvitationCode
  // }

  //邀请码错误时，不带邀请码保存
  if (saveByInvitationCode == 1)
  {
    if (app.globalData.invitationCode != null && app.globalData.invitationCode.length > 0) {
      data.InvitationCode = app.globalData.invitationCode
    }
  }

  if (formId) {
    data.WXFormId = formId
  }

  isSubimting = true

  util.requestPost('SaveCustomerInfoService', data, saveUserSuccess, saveUserFail, null)
}

function saveUserSuccess(res) {

  //特殊错误处理
  if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 300310) {

    //极速绑定时 需要获取返回的手机号
    var phone = that.data.Phone
    if (fastType == 1 && res.data.Entity != null && res.data.Entity.Phone != null && res.data.Entity.Phone.length > 0)
    {
      phone = res.data.Entity.Phone
    }

    wx.showModal({
      title: '账号确认',
      content: '该手机号已经注册，请确认是否需要关联并切换到该账号',
      success: function (res) {
        if (res.confirm) {
          //切换管理用户
          isSubimting = false
          changeWXOpenUser(phone)
        }
      }
    })

    isSubimting = false
    return
  }

  if (res.data != null && res.data.Entity != null) {

    isSubimting = false
    changeCustomerInfo(res.data.Entity, '登录成功！')

    return
  }


  isSubimting = false
  //邀请码错误时，不带邀请码保存
  if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 306301) {
    saveUser(0)
    return
  }

  util.showToast(res.data.ResponseStatus.Message)
}

function changeCustomerInfo(customerInfo,message)
{
  app.globalData.customerInfo = customerInfo
  app.globalData.loginphonesuccess = true

  wx.getStorage({
    key: userInfo_key,
    success: function (res) {
      // success
      if (res != null) {
        res.data.CustomerInfo = customerInfo

        //存储本地用户
        wx.setStorage({
          key: userInfo_key,
          data: res.data
        })
      }
    }
  })

  //上报收银系统
  if (fromShouYin == 1 && pNo != null && pNo.length > 0)
  {
    //上报收银服务
    //util.ReportShouYinLogin(pNo)
  }

  

  var regCouponFlag = false
  if (customerInfo.RegCouponFlag)
  {
    regCouponFlag = customerInfo.RegCouponFlag
  }

  if (regCouponFlag)
  {
    //延迟显示
    if (afterShowRegCoupon == 0)
    {
      that.setData({
        isShowCouponImage:true,
        isShowfast:false,
      })

      return
    }
    else
    {
      //延迟显示
      app.globalData.showRegCouponView = true
    }
  }
  else
  {
    util.showToast(message)
  }

  if (fromPage == 0) {
    util.toHome()
  }
  else {
    applogin.loginBack()
  }
}


function saveUserFail()
{
  isSubimting = false
}

//切换管理用户
function changeWXOpenUser(phone)
{

  var data = {};
  data.TempCustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.Phone = phone
  //data.Phone = that.data.Phone
  data.WXUnionId = app.globalData.userInfo.unionId

  util.requestGet(appconst.ChangeWXOpenUserService, data, changeWXOpenUserSuccess, changeWXOpenUserFail, null)
  
}


function changeWXOpenUserSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    changeCustomerInfo(res.data.Entity.CustomerInfo,'关联手机号成功')
    return
  }

  util.showToast(res.data.ResponseStatus.Message)
}

function changeWXOpenUserFail()
{

}

function checkCustomerType()
{
  if (app.globalData.customerInfo != null
    && app.globalData.customerInfo.CustomerType != null
    && app.globalData.customerInfo.CustomerType != appenum.CustomerType.Temp.Value.toString()) {
    wx.showModal({
      title: '提示',
      content: '您已绑定过手机号',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          if (fromPage == 0)
          {
            util.toHome()
          }
          else
          {
            applogin.loginBack()
          }
        }
      }
    })

    return false
  }

  return true
}


function toCouponlist()
{
  wx.redirectTo({
    url: '../people/couponlist'
  })
}