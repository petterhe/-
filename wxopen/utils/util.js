//所有方法必须注册
module.exports = {
  initApp:initApp,
  getScrollHeight:getScrollHeight,
  isDevelopTest:isDevelopTest,
  isIPhone:isIPhone,

  saveInvitationCode: saveInvitationCode,
  getInvitationCode: getInvitationCode,

  toHome:toHome,
  showHomeByType: showHomeByType,
  showHomeBySpecial: showHomeBySpecial,
  toPTDetail: toPTDetail,
  toProductdetail: toProductdetail,
  toCart: toCart,
  toOrderlist: toOrderlist,
  redirectToPTDetail: redirectToPTDetail,
  redirectToList: redirectToList,
  toSettting: toSettting,
  openUserSetting: openUserSetting,
  showQCode: showQCode,
  toAboutAPP: toAboutAPP,
  toCouponList: toCouponList,

  toBarDetail: toBarDetail,
  toWebView: toWebView,
  openShareApp: openShareApp,
  toGiveHelp: toGiveHelp,
  toFansGroup: toFansGroup,
  showTipsPage: showTipsPage,

  showTabBarCartCount: showTabBarCartCount,

  isTempCustomer: isTempCustomer,
  confirmToLoginPhone: confirmToLoginPhone,
  toLoginPhone: toLoginPhone,
  redirectToLoginPhone: redirectToLoginPhone,
  checkCustomerInfo: checkCustomerInfo,
  checkReSubmit: checkReSubmit,

  showModel: showModel,
  showToast: showToast,
  //showToastImage:showToastImage,
  showLoading:showLoading,
  hideLoading:hideLoading,

  showShareMenu: showShareMenu,
  canGetUserInfo: canGetUserInfo,
  canShare: canShare,
  canWebView: canWebView,
  canLaunchApp: canLaunchApp,
  useNewAuth: useNewAuth,

  getUrl:getUrl,
  requestGet:requestGet,
  requestPost:requestPost,
  uploadFile: uploadFile,

  getWebUrl: getWebUrl,

  reportClick: reportClick,

  getLocation:getLocation,
  changeStore:changeStore,
  ReportShouYinLogin: ReportShouYinLogin,
  getPhoneNumber: getPhoneNumber,

  getGisStore:getGisStore,
  setCityInfo: setCityInfo,
  toselectAddress:toselectAddress,
  toSearch: toSearch,

  addCart:addCart,
  BindWXOpenUserToApp: BindWXOpenUserToApp,
  getWxAqrCode: getWxAqrCode,

  getShareTitle:getShareTitle,
  getShareInfo: getShareInfo,
  saveNoTicketShareInfo: saveNoTicketShareInfo,
  getSharePath: getSharePath,

  getSysDataConfigList: getSysDataConfigList,
  getSysDataConfig: getSysDataConfig,
  getSysDataConfigValue: getSysDataConfigValue,
  getSysDataConfigBykey: getSysDataConfigBykey,
  getSysDataConfigValueBykey: getSysDataConfigValueBykey,

  //选择地址失败授权
  chooseLocationFail: chooseLocationFail,

  setClipboardData: setClipboardData,
  scan:scan,
  callPhone:callPhone,
  checkPhone:checkPhone,
  checkEmail: checkEmail,
  previewImage:previewImage,
  previewImageOnly: previewImageOnly,

  dateformatChina: dateformatChina,
  dateformat: dateformat,
  formatTime: formatTime,
  convertTime:convertTime,
  getdateDiffMinSecond: getdateDiffMinSecond,
  countDown:countDown,
  sleep:sleep,

  ToDBC: ToDBC,//半角转换为全角函数 
  ToCDB: ToCDB,//全角转换为半角函数

  UrlFromApp: UrlFromApp,
  UrlEncode: UrlEncode,
  UrlDecode: UrlDecode,

  stringToByte: stringToByte,
  byteToString: byteToString,

  GetStrLen: GetStrLen,
  
  // unzip: unzip,
  // zip:zip,

  //testPromise,
}

const isDevelop = true;

const appenum = require('/appenum.js')
const appconst = require('/appconst.js')
const md5 = require('/md5.js')

//const pako = require('/pako.min.
const WXAppId = 'wx3f786e322cdde149'
const RequestKey = 'J1fEnA5Mdp6NvA'

const httpTestUrl = "https://189service.mmsshh.com/"
//const httpTestUrl = "http://10.1.8.4:9000/"a
//const httpTestUrl = "http://testopenapi.mmsshh.com/"
//const httpTestUrl = "http://10.1.8.13:6010/"
//const httpTestUrl = "http://10.1.2.189:9000/"
const httpUrl = "https://service.mmsshh.com/"

const httpTestWeb = "https://189service.mmsshh.com:6013/"
//const httpTestWeb = "http://192.168.1.114:9003/"
const httpWeb = "https://m.mmsshh.com/"

var app = getApp()
var shareLogType = 0

function initApp(that)
{
  if(app == null)
  {
    app = that
  }
}

function isDevelopTest() {
  return isDevelop
}

function getScrollHeight(marginHeight)
{
  var height = app.globalData.systemInfo.windowHeight - marginHeight
  return height
}

function isIPhone()
{
  if(app.globalData.systemInfo != null)
  {
    var model = app.globalData.systemInfo.model.toLowerCase()
    if(model.indexOf('iphone') >= 0)
    {
      return true
    }
  }

  return false
}

function isTempCustomer()
{
  if (app.globalData.customerInfo == null)
  {
      return true
  }

  if (app.globalData.customerInfo != null && app.globalData.customerInfo.CustomerType == appenum.CustomerType.Temp.Value.toString())
  {
    return true
  }

  return false
}

function checkCustomerInfo() {
  if (app.globalData.customerInfo == null) 
  {
    wx.showModal({
      title: '提示',
      content: '获取用户信息失败，请退出后重新进入',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          wx.navigateBack()
        }
      }
    })

    return false
  }

  return true
}


//校验是否重复提交 主要针对iPhone按钮重复响应
function checkReSubmit(submitObject,timeDiff = 1000)
{
  var second = 60 * 1000;
  var submitTime = new Date()

  if (submitObject != null && submitObject.lastSubmitTime != null) {
    second = getdateDiffMinSecond(submitObject.lastSubmitTime, submitTime)
  }

  //1秒钟内，认为是重复提交
  if (second < timeDiff) {
    return false
  }

  submitObject.lastSubmitTime = submitTime
  return true
}

//***************邀请码处理***************//
//保存邀请码
function saveInvitationCode(invitationCode)
{
  if (invitationCode == null || invitationCode.length == 0)
  {
    return
  }

  app.globalData.invitationCode = invitationCode

  wx.setStorage({
    key: appconst.invitationCode_key,
    data: invitationCode,
  })

}

function getInvitationCode()
{
  //获取本地用户
  wx.getStorage({
    key: appconst.invitationCode_key,
    success: function (res) {
      // success
      if (res != null) {
        var invitationCode = res.data
        if (invitationCode == null || invitationCode.length == 0) {
          return
        }
        app.globalData.invitationCode = invitationCode
      }
    }
  })
}
//***************邀请码处理***************//

//***************首页等通用界面***************//
function toHome() {
  wx.switchTab({

    url: '../home/index'
  })
}

function showHomeByType(eCategoryType, eC1SysNo)
{
  if (eCategoryType == null || eCategoryType.length == 0) {
    return
  }

  if (eC1SysNo == null || eC1SysNo.length == 0) {
    return
  }

  app.globalData.changeHomeECType = true
  app.globalData.selectECategoryType = eCategoryType
  app.globalData.selectEC1SysNo = eC1SysNo

  wx.switchTab({
    url: '../home/index'
  })
}

//调整到特价
function showHomeBySpecial() {
  app.globalData.changeHomeSpecial = true

  wx.switchTab({
    url: '../home/index'
  })
}

//去助力
function toGiveHelp(aSysNo) {
  wx.navigateTo({
    url: '../active/givehelp?ActiveSysNo=' + aSysNo
  })
}

function toPTDetail(planSysNo) {

  if (isTempCustomer()) {
    confirmToLoginPhone()
    return
  }

  if (planSysNo != null && planSysNo.length > 0) {
    wx.navigateTo({
      url: '../group/ptdetail?PlanSysNo=' + planSysNo
    })
  }
}

function toProductdetail(sysNo) {
  if (sysNo == null || sysNo.length == 0)
  {
    return
  }

  wx.navigateTo({
    url: '../product/productdetail?SysNo=' + sysNo
  })
}

function toBarDetail(sysNo) {
  if (sysNo == null || sysNo.length == 0) {
    return
  }

  wx.navigateTo({
    url: '../base/bardetail?SysNo=' + sysNo
  })
}

function toWebView(url)
{
  if (url == null || url.length == 0) {
    return
  }

  wx.navigateTo({
    url: '../base/webview?Url=' + UrlEncode(url)
  })
}

function openShareApp(invitationCode)
{
  var url = getWebUrl("App/ShareApp?invitationCode=" + invitationCode + "&fromwxapp=1")
  toWebView(url)
}

function toCart(){
  wx.switchTab({
    url: '../cart/cart'
  })
}

function toOrderlist() {
  wx.switchTab({
    url: '../order/orderlist'
  })
}

function confirmToLoginPhone(afterShowRegCoupon = 0,message = null) {

  //有邀请码 先跳邀请码
  if (app.globalData.invitationCode) 
  {
    openShareApp(app.globalData.invitationCode)
    return false
  }

  if(!message)
  {
    message = '很抱歉，您尚未登录，请先登录再操作哦~'
  }

  wx.showModal({
    title: '提示',
    content: message,
    success: function (res) {
      if (res.confirm) {
        toLoginPhone(afterShowRegCoupon)
      }
    }
  })
}

function toLoginPhone(afterShowRegCoupon = 0)
{
  wx.navigateTo({
    url: '../people/loginphone?FromPage=1&afterShowRegCoupon=' + afterShowRegCoupon,
  })
}

function redirectToLoginPhone(afterShowRegCoupon = 0) {
  wx.redirectTo({
    url: '../people/loginphone?FromPage=1&afterShowRegCoupon=' + afterShowRegCoupon,
  })
}

function toSearch() {
  wx.navigateTo({
    url: '../list/search',
  })
}

//关闭跳转至团详情
function redirectToPTDetail(planSysNo)
{
  wx.redirectTo({
    url: '../group/ptdetail?PlanSysNo=' + planSysNo,
  })
}

//到列表 listType 0:不带list  1:listPT 2:listProduct
function redirectToList(listType,title,tips) {

  var url = '../list/list?ListType=' + listType
  if (title != null && title.length > 0) {
    url = url + '&Title=' + title
  }

  if (tips != null && tips.length > 0)
  {
    url = url + '&Tips=' + tips
  }

  wx.redirectTo({
    url: url
  })
}

function showTabBarCartCount()
{
  if (app.globalData.ShoppingCartCount > 0)
  {
    if (wx.setTabBarBadge) {
      wx.setTabBarBadge({
        index: 1,
        text: app.globalData.ShoppingCartCount.toString()
      })
    }
  }
  else
  {
    if (wx.removeTabBarBadge)
    {
      wx.removeTabBarBadge({
        index: 1,
      })
    }
  }
}

function toSettting(message)
{
  wx.navigateTo({
    url: '/pages/setting/setting?message=' + message,
  })
}

function openUserSetting() {
  // var message = "您好，必须允许用户信息授权才能使用本小程序，请先允许您的授权";
  var message = "您好，妙生活小程序须允许用户信息授权才能使用，感谢您的理解，谢谢配合~";
  wx.navigateTo({
    url: '/pages/setting/setting?setuser=1&logincode=' + app.globalData.logincode + '&message=' + message,
  })
}

function showQCode() {
  if (isTempCustomer()) {
    toLoginPhone()
    return
  }

  var url = getWebUrl("Common/UserQRCode?sysNo=" + app.globalData.customerInfo.CustomerSysNo);

  toWebView(url)
}

function toAboutAPP()
{
  wx.navigateTo({
    url: '../about/aboutapp'
  })
}

function toCouponList() {
  wx.navigateTo({
    url: '../people/couponlist'
  })
}

function toFansGroup()
{
  wx.navigateTo({
    url: '../group/fansgroup',
  })
}

function showTipsPage(tipsInfo)
{
  if (tipsInfo)
  {
    app.globalData.tipsInfo = tipsInfo
    wx.navigateTo({
      url: '../about/tipspage',
    })
  }
}

//***************首页等通用界面***************//

//***************统一调用后台服务***************//

function getUrl(key)
{
    if(isDevelop)
    {
      return httpTestUrl + key;
    }
    return httpUrl +  key;
}

function getRequestDefualData(data)
{ 
    if(data == null)
    {
      data = {}
    }

    data.SourceEquipment = 'WXOpen'
    data.Version='5.0.2'
    data.ClientType=4
    data.AppID='10001'

    if(app.globalData.storeInfo != null)
    {
      data.StoreNo = app.globalData.storeInfo.SysNo
    }
    
    if(app.globalData.locationInfo != null)
    {
      data.Location = app.globalData.locationInfo.longitude + '*' + app.globalData.locationInfo.latitude
    }

    if(app.globalData.networkType != null)
    {
      data.NetWorkStates = app.globalData.networkType
    }

    if (app.globalData.systemInfo == null) 
    {
      app.globalData.systemInfo = wx.getSystemInfoSync()
    }

    if(app.globalData.systemInfo != null)
    {
      //需要url编码，防止特殊符号
      data.DeviceModel = encodeURI(app.globalData.systemInfo.model)
      data.OSVer = app.globalData.systemInfo.system + " WXVer:" + app.globalData.systemInfo.version + " SDKVer:" + app.globalData.systemInfo.SDKVersion 
      //data.SourceEquipment = app.globalData.systemInfo.platform
      data.Screen = app.globalData.systemInfo.windowWidth + '*' + app.globalData.systemInfo.windowHeight
      data.ClientTypeVersion = app.globalData.systemInfo.version;
      //SDKVersion 
    }

    if(app.globalData.customerInfo != null && app.globalData.customerInfo.CustomerSysNo != null)
  {
    data.UserSysNo = app.globalData.customerInfo.CustomerSysNo
    if (app.globalData.customerInfo.SessionID != null && app.globalData.customerInfo.SessionID.length > 0)
    {
      data.Token = app.globalData.customerInfo.SessionID;
    }

    data.WXAppId = WXAppId
    // data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }

    //记录来源群
    if (app.globalData.fromOpenGId != null && app.globalData.fromOpenGId.length > 0)
    {
      data.FromOpenGId = app.globalData.fromOpenGId
    }

    //记录来源用户 主要用户订单分销统计等
    if (app.globalData.fromUserSysNo != null && app.globalData.fromUserSysNo.length > 0 && app.globalData.fromUserSysNo != 'undefined') {
      data.FromUserSysNo = app.globalData.fromUserSysNo
    }

    //uuid 默认为 unionId
    if(app.globalData.userInfo != null)
    {
      data.Uuid = app.globalData.userInfo.unionId
      //data.WXUnionid = app.globalData.userInfo.unionId
      data.WXOpenId = app.globalData.userInfo.openId
    }

    data.NonceStr = NewGuid()
    data.TimeStamp = getNowTimeSpan()

    var sign = getSign(data)
    if(sign != null && sign.length >0)
    {
      data.sign = sign
    }

    return data;
}

function getSign(data)
{
  if (data == null)
  {
    return null;
  }

  var strSign = ""
  
  strSign += "AppID" + data.AppID
  strSign += "ClientType" + data.ClientType.toString()
  strSign += "NonceStr" + data.NonceStr
  strSign += "TimeStamp" + data.TimeStamp
  if (data.UserSysNo != null && data.UserSysNo.length > 0)
  {
    strSign += "UserSysNo" + data.UserSysNo
  }
  strSign += "Version" + data.Version
  strSign += RequestKey

  return md5.hexMD5(strSign.toLocaleLowerCase())
}

function requestGet(urlKey,data,doSuccess,doFail,doComplete,isShowLoading = true){

  if(isShowLoading)
  {
    if(data != null && (data.CurrentPage == undefined || data.CurrentPage == 1))
    {
      showLoading()
    }
  }

  //var host = getApp().conf.host;
  data = getRequestDefualData(data)
  //返回json格式
  data.format = 'json'
  var url = getUrl(urlKey)
  //showModel('dd',getUrl(urlKey))
  wx.request({
    url: url,
    data:data,
    //method: 'POST', 
    header: {
          'content-type': 'application/json'
      },
    success: function(res){
      if(isShowLoading)
      {
        hideLoading()
      }
      
      if(res.statusCode == 200)
      {
        if(typeof doSuccess == "function"){
            doSuccess(res);
        }
      }
      else
      {
        showToast("很抱歉，服务出现异常",-1);
        if(typeof doFail == "function"){
          doFail();
        }
      }
    },
    fail:function(e)
    {
      //showModel('dd',JSON.stringify(e))
      console.log(e)
      if(isShowLoading)
      {
        hideLoading()
      }
      
      showToast("访问服务出错，请检查您的网络",-1);
      if(typeof doFail == "function"){
          doFail();
      }
    },
    complete: function() {
      if(typeof doComplete == "function"){
          doComplete();
      }
    }
  });
}


function requestPost(urlKey,data,doSuccess,doFail,doComplete,isShowLoading = true){
    //var host = getApp().conf.host;
    if(isShowLoading)
    {
      showLoading()
    }
  
    data = getRequestDefualData(data)
    //showModel('dd',getUrl(urlKey))
    //json格式
    var url = getUrl(urlKey) + "?format=json"

    wx.request({
      url: url,
      data:data,
      method: 'POST', 
      header: {
            'content-type': 'application/json'
        },
      success: function(res){
        //showModel('dd','12311')
        // if(isShowLoading)
        // {
        //   hideLoading()
        // }
        
        if(res.statusCode == 200)
        {
          if(typeof doSuccess == "function"){
            //showToast("访问服务成功", -1);
            doSuccess(res);
          }
        }
        else
        {
          showToast("访问服务出错",-1);

          if (typeof doFail == "function") {
            doFail();
          }
        }
      },
      fail:function(e)
      {
        //showModel('dd',JSON.stringify(e))
        console.log(e)
        // if(isShowLoading)
        // {
        //   hideLoading()
        // }
        if(typeof doFail == "function"){
            doFail();
        }
      },
      complete: function() {
        if(typeof doComplete == "function"){
            doComplete();
        }

        if (isShowLoading) {
          hideLoading()
        }
      }
    });
}

function uploadFile(data, filePath, doSuccess, doFail, doComplete, isShowLoading = true)
{
  if (isShowLoading) {
    showLoading()
  }

  data = getRequestDefualData(data)
  //返回json格式
  data.format = 'json'
  var url = getUrl('WXOpenUploadFileService') + "?format=json";
  wx.uploadFile({
    url: url,
    filePath: filePath,
    name: 'file',
    header: {
      //"Content-Type": "multipart/form-data"
      'content-type': 'application/json'
    },
    formData: data,
    success: function (res) {
      if (res.statusCode == 200) {
        if (typeof doSuccess == "function") {
          doSuccess(res);
        }
      }
      else {
        showToast("访问服务出错", -1);
      }
    },
    fail: function (e) {
      //showModel('dd',JSON.stringify(e))
      console.log(e)
      // if(isShowLoading)
      // {
      //   hideLoading()
      // }
      if (typeof doFail == "function") {
        doFail();
      }
    },
    complete: function () {
      if (typeof doComplete == "function") {
        doComplete();
      }

      if (isShowLoading) {
        hideLoading()
      }
    }
  })
}

//***************统一调用后台服务***************//

//***************统一WebUrl***************//
function getWebUrl(keyString) {
  if (isDevelop) {
    return httpTestWeb + keyString;
  }
  return httpWeb + keyString;
}
//***************统一WebUrl***************//


//***************信息提示***************//
function showToast(message,showType = 1)
{ 
  if(message == null || message.length ==0)
  {
    return
  }

  //成功
  if(showType == 1)
  {
    //util.showModel('11','1');
    wx.showToast({
        title: message,
        icon: 'success',
      })
    return
  }

  //等待
  if(showType == 0)
  {
    //util.showModel('11','2');
    wx.showToast({
        title: message,
        icon: 'loading',
      })
      return
  }

  //失败
  if(showType == -1)
  {
    //util.showModel('11','3');
    wx.showToast({
      title: message,
        //icon: 'success',
      icon:'none',
        //image:'/image/personal_lose.png',
      })
      return
  }
}

// function showToastImage(message,image)
// {
//   wx.showToast({
//     title: message,
//     icon: 'success',
//     image:image,
//     duration: 2000
//   })
// }


 function showModel(title,message)
 {
    wx.showModal({
    title: title,
    content: message,
    showCancel:false,
    success: function(res) {
    if (res.confirm) {
     
      }
    }
  })
 }

function showLoading(title)
{
  // if (wx.showLoading) {
  //   if(title == null || title.length == 0)
  //   {
  //     title="处理中，请稍候"
  //   }

  //   wx.showLoading({
  //     title: title,
  //   })
  // }
}

function hideLoading()
{
  // //延迟一会 防止和提示冲突 不显示提示
  // setTimeout(function(){
  //   if (wx.hideLoading) {
  //   wx.hideLoading()
  //   }
  // },640)

  // if (wx.hideLoading) {
  //   wx.hideLoading()
  // }
}

//***************信息提示***************//

//***************微信统一方法 ***********/

//设置分享
function showShareMenu()
{
  if (wx.showShareMenu) {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
}

function useNewAuth() //采用新授权 
{
  return app.globalData.SDKVersion >= 207
}

function canGetUserInfo() {
  if (wx.canIUse) {
    return wx.canIUse('button.open-type.getUserInfo')
  }

  return false
}

function canShare()
{
  if (wx.canIUse)
  {
     return wx.canIUse('button.open-type.share')
  }

  return false
}

function canLaunchApp() {
  if (wx.canIUse) {
    return wx.canIUse('button.open-type.launchApp')
  }

  return false
}

function canWebView() {
  if (wx.canIUse) {
    return wx.canIUse('web-view')
  }

  return false
}


//***************微信统一方法 ***********/

//***************定位***************//
function getLocation(doSuccess,doFail,doComplete)
{
    showLoading('正在为您定位，请稍候')
    wx.getLocation({
    type: 'wgs84',
    success: function(res) {

      hideLoading()
      //showModel('dd',JSON.stringify(res))
      //全球转火星
      transform2Mars(res.latitude, res.longitude)
      res.latitude = mgLat
      res.longitude = mgLon
    
      //showModel('dd', JSON.stringify(res))

      if(typeof doSuccess == "function"){
          doSuccess(res);
      }
    },
    fail:function(e)
    {
      console.log(e)  

      hideLoading() 

      if (useNewAuth())
      {
        var message = "您好，请允许我们获取您的地理位置，更好的为您提供服务"
        toSettting(message)
        /*
        wx.showModal({
          title: '提示',
          content: '请允许我们获取您的地理位置，更好的为您提供服务',
          showCancel: true,
          success: function (res) {
            if (res.confirm) {
              toSettting()
            }
            else
            {
              if (typeof doFail == "function") {
                doFail();
              }
            }
          }
        }) */

        // if (typeof doFail == "function") {
        //   doFail();
        // }
      }
      else{
        if (wx.getSetting) {
          wx.getSetting({
            success: function (res) {
              if (!res.authSetting["scope.userLocation"]) {
                chooseLocationFail(doSuccess, null)
              }
              else
              {
                if (typeof doFail == "function") {
                  doFail();
                }
              }
            },
            fail: function (e) {
              chooseLocationFail(doSuccess, null)
            }
          })
        }
        else {
          if (e.errMsg.indexOf("fail auth deny") >= 0) {
            chooseLocationFail(doSuccess, null)
          }
        }
      }
    },
    complete: function() {
      if(typeof doComplete == "function"){
          doComplete();
      }
    }
  })
}
//***************定位***************//


//***************获取gis门店****************//

//获取gis门店
function getGisStore(getGisStoreSuccess,getGisStoreFail)
{
    //showLoading('正在查找分店，请稍候')
    var location =  app.globalData.locationInfo

    var data = {}

    data.Longitude = location.longitude
    data.latitude = location.latitude

    // data.Longitude = 125.666;
    // data.latitude = 30.1435;
  
    requestGet('gisstoresservice',data,getGisStoreSuccess,getGisStoreFail,null)

}

function setCityInfo() {
  // showModel('33', JSON.stringify(app.globalData.storeInfo.CityInfo))
  if (app.globalData.storeInfo != null && app.globalData.storeInfo.CityInfo != null && app.globalData.storeInfo.CityInfo.AreaID != null && app.globalData.storeInfo.CityInfo.AreaID != 0 &&
app.globalData.storeInfo.CityInfo.AreaName != null && app.globalData.storeInfo.CityInfo.AreaName.length > 0) {
    app.globalData.areaID = app.globalData.storeInfo.CityInfo.AreaID
    app.globalData.areaName = app.globalData.storeInfo.CityInfo.AreaName

    //showModel('33', app.globalData.areaName)
  }
}

function toselectAddress()
{
  if (isTempCustomer()) {
    confirmToLoginPhone()
    return
  }

  wx.navigateTo({
    url: '../store/selectdaddress'
  })
}

//***************定位及获取门店****************//


//******************门店切换*****************//
function changeStore(storeInfo)
{
    app.globalData.storeInfo = storeInfo
    app.globalData.changeStore = true
    accessStore(storeInfo)
}

function accessStore(storeInfo)
{
    var data = {};
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
    data.CustomerID = app.globalData.customerInfo.CustomerID
    data.StoreSysNo = storeInfo.SysNo

    requestPost('CustomerAccessStoreService',data,accessStoreSuccess,accessStoreFail,null)
}


function accessStoreSuccess(res)
{
  //console.log(JSON.stringify(res))
}

function accessStoreFail()
{

}

//******************门店切换*****************//


//***************加入购物车***************//
function addCart(sysNo, addCartSuccess, addCartFail, doComplete) {

  //必须登录才可加入购物车
  if (isTempCustomer()) {
    confirmToLoginPhone(0)
    return
  }

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ProductSysNo = sysNo
  data.Num = 1

  // requestPost('AddShopCartService', data, addCartSuccess, addCartFail, doComplete)

  requestPost('AddShopCartServiceV4', data, addCartSuccess, addCartFail, doComplete)
}
//***************加入购物车***************//

//***************绑定微信小程用户到APP***************//
function BindWXOpenUserToApp(wxOpenUserSysNo,appUserSysNo, confirmType, doSuccess, doFail, doComplete) {

  var data = {};

  data.WXOpenUserSysNo = wxOpenUserSysNo
  data.AppUserSysNo = appUserSysNo
  data.ConfirmType = confirmType

  requestGet('BindWXOpenUserToAppService', data, doSuccess, doFail, null)
}
//***************绑定微信小程用户到APP***************//

//***************获取微信手机号 ************//

function getPhoneNumber(encryptedData, iv, doSuccess, doFail) {

  var data = {};

  data.encryptedData = encryptedData
  data.iv = iv

  requestGet('GetWXOpenPhoneService', data, doSuccess, doFail, null)
}

//***************获取微信手机号 ************//

//***************上报收银登录***************//

var shouYinPNo
var reportShouYinlogin

function ReportShouYinLogin(pNo)
{
  reportShouYinlogin = 0
  shouYinPNo = pNo

  ReportShouYinLoginProcess()
}

function ReportShouYinLoginProcess()
{
  if (shouYinPNo != null && shouYinPNo.length > 0 && shouYinPNo != 'undefined')
  {
    var data = {};
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
    data.PNo = shouYinPNo

    requestPost('ReportShouYinLoginService', data, ReportShouYinLoginSuccess, ReportShouYinLoginFail, null)
  }
}

function ReportShouYinLoginSuccess()
{
  shouYinPNo = null
}

function ReportShouYinLoginFail() {
  //失败重试
  reportShouYinlogin ++ 
  if (reportShouYinlogin < 3)
  {
    ReportShouYinLoginProcess()
  }
}

//***************上报收银登录***************//

//***************日志上报***************//
//点击日志上报
function reportClick(clickTypeNo,businessNo,reportClickSuccess, reportClickFail) {
  
  var data = {}
  data.ClickTypeNo = clickTypeNo
  data.BusinessNo = businessNo

  requestPost('reportclickservice', data, reportClickSuccess, reportClickFail, null,false)

}
//***************日志上报***************//


//***************生成二维码***************//
// function getWxAqrCode(data) {

//   requestGet('GetWxAqrCodeService', data, getWxAqrCodeSuccess, getWxAqrCodeFail, null)
// }

function getWxAqrCode(data, doSuccess, doFail, doComplete) {
  
  if(doSuccess == null)
  {
    doSuccess = getWxAqrCodeSuccess
  }

  if (doFail == null) {
    doFail = getWxAqrCodeFail
  }

  requestGet('GetWxAqrCodeService', data, doSuccess, doFail, null)
}

function getWxAqrCodeSuccess(res) {

  if (res.data != null && res.data.Entity != null) {

    if (res.data.Entity.ImgUrl != null && res.data.Entity.ImgUrl.length > 0) {
      var imgUrl = res.data.Entity.ImgUrl
      
      previewImageOnly(imgUrl)

      // wx.previewImage({
      //   current: imgUrl, // 当前显示图片的http链接
      //   urls: urls // 需要预览的图片http链接列表
      // })

      //previewImage(imgUrl,urls)
      return
    }

    showToast('获取二维码图片失败', -1)
  }

  showToast(res.data.ResponseStatus.Message, -1)
}

function getWxAqrCodeFail() {

}
//***************生成二维码***************//

//******************授权处理*****************/
//选择地址失败
function chooseLocationFail(doSuccess, doFail) {
  wx.showModal({
    title: '提示',
    content: '您拒绝了地理信息授权，请重新选择授权',
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        openUserLocationSetting(doSuccess, doFail)
      }
    }
  })
}

//位置授权失败
function openUserLocationSetting(doSuccess, doFail) {
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        //授权成功
        if (res.authSetting["scope.userLocation"]) {
          //这里是授权成功之后 填写你重新获取数据的js
          if (typeof doSuccess == "function") {
            doSuccess();
          }
        }
        else{
          if (typeof doFail == "function") {
            doFail();
          }
        }
      },
    })
  }
}

//******************授权处理*****************/

//******************拨打电话****************//

function callPhone(phone)
{
  phone = phone.replace("-",",")
  wx.makePhoneCall({
    phoneNumber: phone 
  })
}

function checkPhone(phonenum) {
  phonenum = phonenum.trim()
    if (!phonenum.match(/^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/) || phonenum.length != 11) {
        return false;
    }
    return true;
}

function checkEmail(email)
{
  email = email.trim().toLowerCase()

  //对电子邮件的验证
  var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");

  if (reg.test(email))
  {
    return true
  }
  return false
}

//******************拨打电话****************//

//****************** 全角半角转换 ***********//
//半角转换为全角函数 
function ToDBC(txtstring) {
  var tmp = "";
  for (var i = 0; i < txtstring.length; i++) {
    if (txtstring.charCodeAt(i) == 32) {
      tmp = tmp + String.fromCharCode(12288);
    }
    if (txtstring.charCodeAt(i) < 127) {
      tmp = tmp + String.fromCharCode(txtstring.charCodeAt(i) + 65248);
    }
  }
  return tmp;
}

//全角转换为半角函数 
function ToCDB(str) {
  var tmp = "";
  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
      tmp += String.fromCharCode(str.charCodeAt(i) - 65248);
    }
    else {
      tmp += String.fromCharCode(str.charCodeAt(i));
    }
  }
  return tmp
}
//****************** 全角半角转换 ***********//

//*******************扫描****************//
function scan(doSuccess,doFail,doComplete)
{
  wx.scanCode({
    success: (res) => {
     if(typeof doSuccess == "function"){
              doSuccess(res);
          }
      },
      fail:function(e)
      {
        console.log(e)   
        showToast('扫描失败',-1) 
        if(typeof doFail == "function"){
            doFail();
        }
      },
      complete: function() {
        if(typeof doComplete == "function"){
            doComplete();
        } 
    }
  })
}

//******************扫描****************//


//*******************剪切板****************//
function setClipboardData(value) {

  if (value == null || value.length <= 0)
  {
    return
  }
  
  if (wx.setClipboardData)
  {
    wx.setClipboardData({
      data: value,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            showToast('复制成功')
          }
        })
      }
    })
  }
}
//*******************剪切板****************//

//**************图片文件*****************//

function previewImageOnly(imgUrl)
{
  if(imgUrl == null || imgUrl.length <= 0)
  {
    return
  }

  var urls = new Array()
  urls[0] = imgUrl

  previewImage(imgUrl, urls)
}

function previewImage(imgUrl, urls)
{
  if (imgUrl == null || imgUrl.length <= 0) {
    return
  }

  if (urls == null || urls.length <= 0) {
    return
  }

  wx.previewImage({
    current: imgUrl, // 当前显示图片的http链接
    urls: urls // 需要预览的图片http链接列表
  })
}

//**************图片文件*****************//

//******************分享处理****************//

function getShareInfo(shareTicket, path, logtype)
{
  // if (shareTicket == null || shareTicket.length == 0)
  // {
  //   showToast("获取微信群信息失败，请重试",-1)
  //   return
  // }
  console.log('开始获取分享群信息')

  wx.getShareInfo({
    shareTicket: shareTicket,
    success: function (res) {

      console.log('获取分享群信息成功:' + JSON.stringify(res))
      //showToast('获取分享群信息成功',-1)
      //保存
      saveShareInfo(res, shareTicket, path, logtype)
      
    },
    fail: function (res) {
      console.log('获取分享群信息失败:' + JSON.stringify(res))
      //showToast('获取分享群信息失败', -1)
      //showModel('223', '22')
      saveNoTicketShareInfo(path, logtype)
      },
    complete: function (res) {
      //saveNoTicketShareInfo(path, logtype)
      },
  })
  
}

function saveShareInfo(res, shareTicket, path, logtype)
{
  // if (res.encryptedData == null 
  //   || res.encryptedData.length == 0 
  //   || res.iv == null 
  //   || res.iv.length == 0)
  // {
  //   showToast("获取微信群信息失败，请重试", -1)
  //   return
  // }

  var data = {};
  
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.LogType = logtype

  data.path = path
  data.shareTicket = shareTicket

  data.openid = app.globalData.userInfo.openId
  data.rawData = res.rawData
  data.encryptedData = res.encryptedData
  data.iv = res.iv
  
  shareLogType = logtype

  //showModel('11','555');
  console.log('提交分享群信息日志')
  //showToast('提交分享群信息日志', -1)
  requestPost(appconst.SaveWXOpenShareLogService, data, saveShareInfoSuccess, saveShareInfoFail, null)
  
}

function saveNoTicketShareInfo(path, logtype) {
  var data = {};

  if (app.globalData.customerInfo != null)
  {
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }
  data.LogType = logtype
  data.path = path
  if (app.globalData.userInfo != null)
  {
    data.openid = app.globalData.userInfo.openId
  }
  shareLogType = logtype

  requestPost(appconst.SaveWXOpenShareLogService, data, saveShareInfoSuccess, saveShareInfoFail, null)
}

function saveShareInfoSuccess(res)
{
  //console.log(res)
  if (res.data != null && res.data.Entity != null) {
    //打开时 记录openGId
    if (shareLogType == appenum.WXOpenShareLogType.Open.Value)
    {
      app.globalData.fromOpenGId = res.data.Entity.openGId
      //showModel('11', app.globalData.fromOpenGId)
    }
  }
}

function saveShareInfoFail() {

}

function getSharePath(path) {
  if (path.indexOf('?') >= 0) {
    path = path + '&'
  }
  else {
    path = path + '?'
  }

  return path + 'fromUserSysNo=' + app.globalData.customerInfo.CustomerSysNo
}
//******************分享处理****************//

//*******************配置信息***********//
function getShareTitle()
{
  if (app.globalData.shareTitleList == null ||
    app.globalData.shareTitleList.length == 0)
  {
    return null
  }

  if (app.globalData.shareTitleList.length == 1)
  {
    return app.globalData.shareTitleList[0].Value
  }

  //根据秒数取余
  var date = new Date()
  var seconds = date.getSeconds()
  var i = seconds% app.globalData.shareTitleList.length

  return app.globalData.shareTitleList[i].Value  
}


function getSysDataConfigList(configType) {
  var listSysDataConfig = new Array()

  if (app.globalData.sysDataConfig == null || app.globalData.sysDataConfig.length == 0) {
    return null
  }

  for (var i = 0; i < app.globalData.sysDataConfig.length; i++) {
    var config = app.globalData.sysDataConfig[i]
    if (config != null && config.ConfigType.toLowerCase() == configType.toLowerCase()) {
      listSysDataConfig.push(config)
    }
  }

  return listSysDataConfig
}

function getSysDataConfig(configType) {
  if (app.globalData.sysDataConfig == null || app.globalData.sysDataConfig.length == 0) {
    return null
  }

  for (var i = 0; i < app.globalData.sysDataConfig.length; i++) {
    var config = app.globalData.sysDataConfig[i]
    if (config != null && config.ConfigType.toLowerCase() == configType.toLowerCase()) {
      return config
    }
  }
}

function getSysDataConfigBykey(configType,key) {
  if (app.globalData.sysDataConfig == null || app.globalData.sysDataConfig.length == 0) {
    return null
  }

  for (var i = 0; i < app.globalData.sysDataConfig.length; i++) {
    var config = app.globalData.sysDataConfig[i]
    if (config != null && config.ConfigType.toLowerCase() == configType.toLowerCase() && config.Key.toLowerCase() == key.toLowerCase()) {
      return config
    }
  }
}

function getSysDataConfigValue(key)
{
  if (app.globalData.sysDataConfig == null || app.globalData.sysDataConfig.length == 0)
  {
    return ''
  }

  for (var i = 0; i < app.globalData.sysDataConfig.length; i++) {
    var config = app.globalData.sysDataConfig[i]
    if (config != null && config.ConfigType.toLowerCase() == key.toLowerCase()) {
      return config.Value
    }
  }
}

function getSysDataConfigValueBykey(configType, key) {
  if (app.globalData.sysDataConfig == null || app.globalData.sysDataConfig.length == 0) {
    return ''
  }

  for (var i = 0; i < app.globalData.sysDataConfig.length; i++) {
    var config = app.globalData.sysDataConfig[i]
    if (config != null && config.ConfigType.toLowerCase() == configType.toLowerCase() && config.Key.toLowerCase() == key.toLowerCase()) {
      return config.Value
    }
  }
}

//*******************配置信息***********//

//******************经纬度转换*****************//
var mgLat;
var mgLon;
var pi = 3.14159265358979324;
var a = 6378245.0;
var ee = 0.00669342162296594323;

function transformLat(x, y) {
    var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLon(x, y) {
    var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
    return ret;
}

function outOfChina(lat, lon) {
    if (lon < 72.004 || lon > 137.8347)
        return true;
    if (lat < 0.8293 || lat > 55.8271)
        return true;
    return false;
}

function transform2Mars(wgLat, wgLon) {
    if (outOfChina(wgLat, wgLon)) {
        mgLat = wgLat;
        mgLon = wgLon;
        return;
    }

    var dLat = transformLat(wgLon - 105.0, wgLat - 35.0);
    var dLon = transformLon(wgLon - 105.0, wgLat - 35.0);
    var radLat = wgLat / 180.0 * pi;
    var magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    var sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    //mgLat = wgLat + dLat;
    //mgLon = wgLon + dLon;

    var mgLat1 = wgLat + dLat;
    var mgLon1 = wgLon + dLon;

    mgLat = Math.round(mgLat1 * 1000000) / 1000000.0;
    mgLon = Math.round(mgLon1 * 1000000) / 1000000.0;
}
//*************************

//***************时间转换***************//
function convertTime(date)
{
    var rowDate  = new Date(parseInt(date.replace("/Date(","").replace(")/","")) * 1)
    return formatTime(rowDate)
}

function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function countDown(strEndTime)
{
  var endTime  = stringToDate(strEndTime)
  var starTime = new Date()
  var second = getdateDiff(starTime,endTime)
  
  //showModel('11',endTime.toString())

  //second = second -3200
  if(second <= 0)
  {
    return "-1";
  }
  return dateformat(second)
}

function stringToDate(strDate)
{
    var arr = strDate.split(/[- : \/]/)
    return new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
}

function getdateDiff(starTime,endTime)
{ 
  return parseInt((endTime.getTime() - starTime.getTime())/1000)
}

function getdateDiffMinSecond(starTime, endTime) {
  return parseInt(endTime.getTime() - starTime.getTime())
}

function dateformatChina(second) {
  var dateStr = "";
  var hr = Math.floor(second / 3600);
  var min = Math.floor((second - hr * 3600) / 60);
  var sec = (second - hr * 3600 - min * 60);// equal to => var sec = second % 60;
  dateStr = formatNumber(hr) + "时" + formatNumber(min) + "分" + formatNumber(sec) + "秒";
  //dateStr = [hr, min, sec].map(formatNumber).join(':');
  return dateStr
}

function dateformat(second) {
  var dateStr = "";
  var hr = Math.floor(second / 3600);
  var min = Math.floor((second - hr * 3600) / 60);
  var sec = (second - hr * 3600 - min * 60);// equal to => var sec = second % 60;
  //dateStr = hr + ":" + min + ":" + sec;
  dateStr = [hr, min, sec].map(formatNumber).join(':');
  return dateStr
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//暂停几秒
function sleep(numberMillis) {
　　var now = new Date();
　　var exitTime = now.getTime() + numberMillis;
　　while (true) {
　　now = new Date();
　　if (now.getTime() > exitTime)
　　return;
　　}
}

//获取时间戳
function getNowTimeSpan()
{
  return new Date().getTime().toString()
}
//***************时间转换***************//

//***************url加密解密 ***************//
function UrlFromApp(url)
{
  if (url.indexOf("fromwxapp=1"))
  {
    return url
  }

  if (url.indexOf("fromapp=1") < 0) {
    if (url.indexOf('?') >= 0) {
      url = url + '&fromapp=1'
    }
    else {
      url = url + '?fromapp=1'
    }
  }

  return url;
}

function UrlEncode(str) {
  var ret = "";
  var strSpecial = "!\"#$%&'()*+,/:;<=>?[]^`{|}~%";
  var tt = "";
  for (var i = 0; i < str.length; i++) {
    var chr = str.charAt(i);
    var c = str2asc(chr);
    tt += chr + ":" + c + "n";
    if (parseInt("0x" + c) > 0x7f) {
      ret += "%" + c.slice(0, 2) + "%" + c.slice(-2);
    } else {
      if (chr == " ")
        ret += "+";
      else if (strSpecial.indexOf(chr) != -1)
        ret += "%" + c.toString(16);
      else
        ret += chr;
    }
  }
  return ret;
}

function UrlDecode(str) {
  var ret = "";
  for (var i = 0; i < str.length; i++) {
    var chr = str.charAt(i);
    if (chr == "+") {
      ret += " ";
    } else if (chr == "%") {
      var asc = str.substring(i + 1, i + 3);
      if (parseInt("0x" + asc) > 0x7f) {
        ret += asc2str(parseInt("0x" + asc + str.substring(i + 4, i + 6)));
        i += 5;
      } else {
        ret += asc2str(parseInt("0x" + asc));
        i += 2;
      }
    } else {
      ret += chr;
    }
  }
  return ret;
}

function str2asc(str) {
  return str.charCodeAt(0).toString(16);
}
function asc2str(str) {
  return String.fromCharCode(str);
} 
//***************url加密解密 ***************//

//***************数据转换 ***************//
function stringToByte(str) {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10FFFF) {
      bytes.push(((c >> 18) & 0x07) | 0xF0);
      bytes.push(((c >> 12) & 0x3F) | 0x80);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00FFFF) {
      bytes.push(((c >> 12) & 0x0F) | 0xE0);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007FF) {
      bytes.push(((c >> 6) & 0x1F) | 0xC0);
      bytes.push((c & 0x3F) | 0x80);
    } else {
      bytes.push(c & 0xFF);
    }
  }
  return bytes;
}

function byteToString(arr) {
  if (typeof arr === 'string') {
    return arr;
  }
  var str = '',
    _arr = arr;
  for (var i = 0; i < _arr.length; i++) {
    var one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length == 8) {
      var bytesLength = v[0].length;
      var store = _arr[i].toString(2).slice(7 - bytesLength);
      for (var st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2);
      }
      str += String.fromCharCode(parseInt(store, 2));
      i += bytesLength - 1;
    } else {
      str += String.fromCharCode(_arr[i]);
    }
  }
  return str;
}
//***************数据转换 ***************//

//***************生成guid **************//
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

function NewGuid() {
  return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
}

function NewGuid1() {
  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
//***************生成guid **************//

//***************获取字符串长度 英文0.5 **************//
function GetStrLen(str) {
  if (str == null) return 0;
  if (typeof str != "string") {
    str += "";
  }
  return str.replace(/[^\x00-\xff]/g, "ab").length;
}
//***************获取字符串长度 英文0.5 **************//


//***************gzip 压缩解压 ***************//
/*
function unzip(b64Data) {

  var binData = wx.base64ToArrayBuffer(b64Data)

  // unzip  
  var data = pako.ungzip(binData);

  // Convert gunzipped byteArray back to ascii string:  
  var strData = byteToString(data);
  return strData;
}

function zip(str) {
  var binaryString = pako.gzip(str, { to: 'string' });
  return wx.arrayBufferToBase64(arraybuffer)(binaryString);
} 

function stringToByte(str) {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10FFFF) {
      bytes.push(((c >> 18) & 0x07) | 0xF0);
      bytes.push(((c >> 12) & 0x3F) | 0x80);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00FFFF) {
      bytes.push(((c >> 12) & 0x0F) | 0xE0);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007FF) {
      bytes.push(((c >> 6) & 0x1F) | 0xC0);
      bytes.push((c & 0x3F) | 0x80);
    } else {
      bytes.push(c & 0xFF);
    }
  }
  return bytes;
}  

function byteToString(arr) {
  if (typeof arr === 'string') {
    return arr;
  }
  var str = '',
    _arr = arr;
  for (var i = 0; i < _arr.length; i++) {
    var one = _arr[i].toString(2),
      v = one.match(/^1+?(?=0)/);
    if (v && one.length == 8) {
      var bytesLength = v[0].length;
      var store = _arr[i].toString(2).slice(7 - bytesLength);
      for (var st = 1; st < bytesLength; st++) {
        store += _arr[st + i].toString(2).slice(2);
      }
      str += String.fromCharCode(parseInt(store, 2));
      i += bytesLength - 1;
    } else {
      str += String.fromCharCode(_arr[i]);
    }
  }
  return str;
}
*/
//***************gzip 压缩解压 ***************//

function testPromise(i) {
  return new Promise(function (resolve, reject) {

    if (i > 5) {
      resolve('测试成功');
    }
    else {
      reject('测试失败');
    }

  });
}