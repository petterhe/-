//所有方法必须注册
module.exports = {
  initApp: initApp,

  setIsSettingOpen: setIsSettingOpen,
  setLoginInfo: setLoginInfo,

  login: login,
  getSystemInfo: getSystemInfo,
  getNetworkType: getNetworkType,
  getSysDataConfig: getSysDataConfig,

  getShareInfo: getShareInfo,
  getUserOpenInfo: getUserOpenInfo,

  getUserOpenInfoSuccess: getUserOpenInfoSuccess,
  getDefualStore: getDefualStore,
  setisloginphone: setisloginphone,
  loginBack:loginBack,
}

const util = require('/util.js')
const appenum = require('/appenum.js')
const appconst = require('/appconst.js')

var app = getApp()

var loginInfo
var failCount = 0

var userInfo_key = appconst.userInfo_key
var sysDataConfig_key = appconst.sysDataConfig_key

var appUserSysNo
var wxOpenUserSysNo
var fromApp
var launchshareTicket
var launchpath

var isSettingOpen = false

var loginSuccessProcess = null
var isloginphone = false

function initApp(that) {
  if (app == null) {
    app = that
    isSettingOpen = false
    loginInfo = null
  }
}

function setisloginphone(value)
{
  isloginphone = value
}

function setIsSettingOpen(open)
{
  isSettingOpen = open
}

function setLoginInfo(info)
{
  loginInfo = info
}

function login() {
  //获取本地用户
  //getLocalUser(loginProcess)

  loginProcess()
}

function loginProcess()
{
  wx.login({
    success: function (res) {

      app.globalData.logincode = res.code

      wx.getSetting({
        success: res => {
          if (res.authSetting['scope.userInfo']) {
            console.log('已经授权')
            // 已经授权，可以直接调用 getUserInfo 
            wx.getUserInfo({
              success: res => {
                console.log('app.js执行 getUserInfo')
                
                loginInfo = res
                app.globalData.userInfo = res.userInfo
                getUserOpenInfo(null, JSON.stringify(app.globalData.userInfo))
              }
            })
          } else {
            getLocalUser();
          }
        }
      })
    },
    fail(res) {
    }
  })
}

function getUserOpenInfo(doSuccess, strUserInfo) {
  var data = {};
  data.code = app.globalData.logincode
  //已经授权过，不再解密用信息

  if (loginInfo)
  {
    data.rawData = loginInfo.rawData
    data.encryptedData = loginInfo.encryptedData
    data.iv = loginInfo.iv
  }
  else
  {
    if (strUserInfo)
    {
      data.strUserInfo = strUserInfo
    }
  }

  if (appUserSysNo) {
    data.AppUserSysNo = appUserSysNo
  }

  if (!doSuccess)
  {
    doSuccess = getUserOpenInfoSuccess
  }

  util.requestGet(appconst.GetWXOpenUserService, data, doSuccess, getUserOpenInfoFail, null)
  // util.requestGet(appconst.GetWXOpenUserService, data, getUserOpenInfoSuccess, getUserOpenInfoFail, null)

}

function getUserOpenInfoSuccess(res) {
  //保存本地用户
  if (res.data != null && res.data.Entity != null) {
    wxOpenUserSysNo = res.data.Entity.CustomerInfo.CustomerSysNo
    app.globalData.userInfo = res.data.Entity.OpenUserInfo

    //APP打开时 判断用户是否一致
    if (fromApp == "1" && appUserSysNo) {
      //用户不一一致
      if (wxOpenUserSysNo != appUserSysNo) {
        util.BindWXOpenUserToApp(wxOpenUserSysNo, appUserSysNo, 0, BindWXOpenUserToAppSuccess, BindWXOpenUserToAppFile)
        return
      }
    }

    //用户登录处理
    userLoginSuccess(res)

    return
  }

  getUserOpenInfoFail()
}

function BindWXOpenUserToAppSuccess(res) {
  //保存本地用户
  if (res.data != null && res.data.Entity != null) {

    //用户登录处理
    userLoginSuccess(res)
    return
  }

  if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 317006) {

    var message = res.data.ResponseStatus.Message
    wx.showModal({
      title: '关联确认',
      content: message,
      success: function (res) {
        if (res.confirm) {
          util.BindWXOpenUserToApp(wxOpenUserSysNo, appUserSysNo, 1, BindWXOpenUserToAppSuccess, BindWXOpenUserToAppFile)
        }
        else {
          BindWXOpenUserToAppFile()
        }
      }
    })

    return
  }

}

function BindWXOpenUserToAppFile() {

  app.globalData.userloginflag = 1

  if(isSettingOpen)
  {
    app.globalData.notBindUserToApp = true //拒绝绑定用户到APP
  }
  wx.navigateBack()
}

function userLoginSuccess(res) {
  //util.showModel('11',JSON.stringify(res))
 
  app.globalData.customerInfo = res.data.Entity.CustomerInfo
  if (res.data.Entity.OpenUserInfo != null) {
    app.globalData.userInfo = res.data.Entity.OpenUserInfo
  }
  app.globalData.userloginflag = 1
  if (isloginphone) {
    if (!util.isTempCustomer()) {
      app.globalData.loginphonesuccess = true
      loginBack()
    }
    isloginphone = false
  }

  //定位失败，使用默认门店
  // app.globalData.locationFailStoreInfo = res.data.Entity.StoreInfo

  //存储本地用户
  wx.setStorage({
    key: userInfo_key,
    data: res.data.Entity
  })

  //上报分享信息
  reportShareInfo()

  if (isSettingOpen)
  {
    wx.navigateBack()
  }
}

function loginBack() {
  if (app.globalData.invitationCode) {

    wx.navigateBack({
      delta:2 //返回2级页面
    })
  }
  else {
    wx.navigateBack()
  }
}

function getUserOpenInfoFail() {

  /*
  failCount++
  if (failCount >= 3) {
    //3次获取不到用户，则获取本地用户
    //getLocalUser()
    app.globalData.scopeuserauthflag = -1
  }
  else {
    login()
    //getUserOpenInfo()
  }*/
}

function getShareInfo() {
  if (app.globalData.launchOptions == null) {
    return
  }

  app.globalData.fromShareTicket = app.globalData.launchOptions.shareTicket
  if (app.globalData.launchOptions.query.fromUserSysNo)
  {
    app.globalData.fromUserSysNo = app.globalData.launchOptions.query.fromUserSysNo
  }

  if (app.globalData.launchOptions.query.FromUserSysNo) {
    app.globalData.fromUserSysNo = app.globalData.launchOptions.query.FromUserSysNo
  }

  if (app.globalData.launchOptions.query.appUserSysNo) {
    appUserSysNo = app.globalData.launchOptions.query.appUserSysNo
  }

  if (app.globalData.launchOptions.query.AppUserSysNo)
  {
    appUserSysNo = app.globalData.launchOptions.query.AppUserSysNo
  }

  if (app.globalData.launchOptions.query.FromApp)
  {
    fromApp = app.globalData.launchOptions.query.FromApp
  }

  if (app.globalData.launchOptions.query.fromApp) {
    fromApp = app.globalData.launchOptions.query.fromApp
  }
  
  launchshareTicket = app.globalData.launchOptions.shareTicket
  launchpath = app.globalData.launchOptions.path

  //解析参数，生成分享链接
  var query = JSON.stringify(app.globalData.launchOptions.query)
  if (query != null && query != "undefined" && query != "{}") {
    query = query.replace(/"/g, "").replace(/{/g, "").replace(/}/g, "")
    query = query.replace(/:/g, "=").replace(/,/g, "&")
    launchpath = launchpath + "?" + query
  }
}

//上报分享信息
function reportShareInfo() {
  //app打开
  if (appUserSysNo != null && appUserSysNo.length > 0 && appUserSysNo != 'undefined') {
    util.saveNoTicketShareInfo(launchpath, appenum.WXOpenShareLogType.AppOpen.Value)
    return
  }

  //无来源用户，则判断非分享
  if (app.globalData.fromUserSysNo == null || app.globalData.fromUserSysNo == 0 || app.globalData.fromUserSysNo == 'undefined') {
    return
  }

  if (launchshareTicket == null || launchshareTicket.length == 0 || launchshareTicket == 'undefined') {

    var openType = appenum.WXOpenShareLogType.Open.Value
    //判断是否来源APP
    if (fromApp != null && fromApp.length > 0 && fromApp == '1') {
      openType = appenum.WXOpenShareLogType.AppShareOpen.Value
    }

    util.saveNoTicketShareInfo(launchpath, openType)
    return
  }

  util.getShareInfo(launchshareTicket, launchpath, appenum.WXOpenShareLogType.Open.Value)
}

//function getLocalUser(doSuccess) {
function getLocalUser() {
  //获取本地用户
  wx.getStorage({
    key: userInfo_key,
    success: function (res) {
      // success
      if (res && res.data) {

      
        app.globalData.customerInfo = res.data.CustomerInfo
        app.globalData.userInfo = res.data.OpenUserInfo

        /*
        //执行成功操作
        if (typeof doSuccess == "function") {
          doSuccess()
        }*/

        //根据本地用户信息 获取用户
        getUserOpenInfo(null, JSON.stringify(app.globalData.userInfo))
        return
      }

      app.globalData.userloginflag = -1

    }, fail: function (res) {
      app.globalData.userloginflag = -1
    }
  })
}

function loginFail() {

  if (app.globalData.customerInfo == null) {
    wx.showModal({
      title: '错误',
      content: '小程序登录失败，请退出微信重试',
      showCancel: false,
      success: function (res) {
        wx.navigateBack()
      }
    })
  }
}

function getSysDataConfig() {
  var data = {};
  data.IsDownloadToC = 1
  util.requestGet('GetSysDataConfigService', data, getSysDataConfigSuccess, getSysDataConfigFail, null)
}

function getSysDataConfigSuccess(res) {
  //保存本地用户
  if (res.data != null && res.data.Entity != null
    && res.data.Entity.length > 0) {

    app.globalData.sysDataConfig = res.data.Entity

    //存储本地用户
    wx.setStorage({
      key: sysDataConfig_key,
      data: res.data.Entity
    })

    readSysDataConfig()
    
    return
  }

  getSysDataConfigFail()
}


function getSysDataConfigFail() {

  //获取本地用户
  wx.getStorage({
    key: sysDataConfig_key,
    success: function (res) {
      // success
      if (res != null && res.data != null && res.data.length > 0) {
        app.globalData.sysDataConfig = res.data
        readSysDataConfig()
      }
    }
  })
}

function readSysDataConfig() {
  if (app.globalData.sysDataConfig == null
    || app.globalData.sysDataConfig.length == 0) {
    return
  }

  var shareTitleList = new Array()
  var returnWxNo = null

  for (var i = 0; i < app.globalData.sysDataConfig.length; i++) {
    var config = app.globalData.sysDataConfig[i]
    if (config != null && config.ConfigType.toLowerCase() == "WXXCXShareTitleList".toLowerCase()) {
      shareTitleList.push(config)
    }

    if (config != null && config.ConfigType.toLowerCase() == "returnWxNo".toLowerCase()) {
      returnWxNo = config.Value
    }
  }

  //分享术语
  app.globalData.shareTitleList = shareTitleList

  if (returnWxNo != null && returnWxNo.length > 0) {
    app.globalData.returnWxNo = returnWxNo
  }
}

function getSystemInfo() {
  app.globalData.systemInfo = wx.getSystemInfoSync()


  if (app.globalData.systemInfo.model.indexOf("iPhone X") >= 0) {
    app.globalData.isIpx = true
  }

  var version = app.globalData.systemInfo.SDKVersion
  version = version.replace(/\./g, "")
  //console.log(version)
  app.globalData.SDKVersion = parseInt(version)
}

function getNetworkType() {

  wx.getNetworkType({
    success: function (res) {
      app.globalData.networkType = res.networkType // 返回网络类型2g，3g，4g，wifi
    }
  })
}

function getDefualStore()
{
  var data = {};
  util.requestGet('GetDefualStoresService', data, getDefualStoreSuccess, getDefualStoreFail, null)

}

function getDefualStoreSuccess(res)
{
  //app.globalData.locationFailStoreInfo = res.data.StoreInfo
  if (res.data != null && res.data.Entity != null)
  {
    app.globalData.locationFailStoreInfo = res.data.Entity.StoreInfo
  }
}

function getDefualStoreFail() {

}

/*
//用户授权设置
function openUserInfoSetting() {

  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting["scope.userInfo"]) {
          //这里是授权成功之后 填写你重新获取数据的js
          getWXUserInfo()
        }
        else {
          getWXUserInfoFail()
        }
      },
      fail: function (res) {

      }
    })
  }
}

//获取微信用户失败
function getWXUserInfoFail() {
  wx.showModal({
    title: '提示',
    content: '您拒绝了用户信息授权，小程序将无法正常使用，请重新选择授权',
    showCancel: false,
    success: function (res) {
      if (res.confirm) {

        openUserInfoSetting()
      }
    }
  })
}*/
