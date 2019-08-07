// pages/product/productdetail.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var sysNo;
var index = 0;
var windowHeight
var windowWidth

var fromApp = 0
var firstRequest = 1
var firstLocation
var activeSysNo
var showOpenVip = 0

Page({
  data:{
    productDetail:null,
    graphicDetail:null,
    productAttribute:null,
    tabIndex:0,
    ShoppingCartCount:0,
    StarImgUrl: appconst.StarImgUrl,
    canShare:false,
    canWebView:false,

    showServeDescView: false,

    isIpx: app.globalData.isIpx ? true : false,

    canLaunchApp: util.canLaunchApp(),
    fromApp: fromApp,

    activeInfo:null,
    shareDialogTitle: '分享微信群得红包',
    shareDialogContent:'',
    shareDialogbuttonText: '立即分享',
    shareDialogisShowShare:true,

    Complete: appenum.ActStatus.Complete.Value,
    Received: appenum.ActStatus.Received.Value,
    NoComplete: appenum.ActStatus.NoComplete.Value,
    privigecardbg: appconst.PrivigeCardBg,

    showOpenVip:0,
    // indicatorDots: true,
    // autoplay: true,
    // interval: 5000,
    // duration: 1000,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')
    //设置分享
    util.showShareMenu()

    if(options.SysNo == undefined)
    {
      sysNo = 0;
    }
    else
    {
      sysNo = options.SysNo
    }

    fromApp = 0
    firstRequest = 1 

    if (!(options.FromApp == undefined)) {
      fromApp = options.FromApp
    }

    if (!(options.fromApp == undefined)) {
      fromApp = options.fromApp
    }

    showOpenVip = 0
    var strShowOpenVip = util.getSysDataConfigValue('WXXCXShowOpenVIP')

    if (strShowOpenVip && strShowOpenVip == "1") {
      showOpenVip = 1
    }

    /*
    if (!(options.ActiveSysNo == undefined)) {
      activeSysNo = options.ActiveSysNo
    }*/
    
    that = this

    firstLocation = true

    index = 0
    windowHeight = app.globalData.systemInfo.windowHeight
    windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      canShare: util.canShare(),
      canWebView: util.canWebView(),
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      ShoppingCartCount: app.globalData.ShoppingCartCount,
      fromApp: fromApp,
      showOpenVip: showOpenVip,
    })

    refreshPageData()
  },
  onReady: function () {
   
  },
  onShow: function () {
    
    /*
    if (app.globalData.refreshuserLocation) {
      if (app.globalData.scopeuserLocation) {
        getLocation()
      }
      else {
        getLocationStoreFail()
      }

      app.globalData.refreshuserLocation = false
      return
    }

    if (!firstLocation && app.globalData.storeInfo == null)
    {
      getLocationStoreFail()
    }*/

    if (!firstLocation
      && app.globalData.storeInfo == null) {
      getLocation()
      return
    }

    if (app.globalData.loginphonesuccess) {
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }
    //firstLocation = false
  },
  tabchage:function(e){
    index = e.currentTarget.dataset.index
    that.setData({
      tabIndex:index
    })
  },
  toProductDetail: function (e) {
    index = e.currentTarget.dataset.index

    if (that.data.productDetail == null 
   || that.data.productDetail.SeeProducts == null
   || that.data.productDetail.SeeProducts.length <= index)
      {
        return
      }

    var product = that.data.productDetail.SeeProducts[index]
    if (product == null)
    {
      return
    }

    //sysNo = product.SysNo
    //getProductInfo()
    //util.toProductdetail(product.SysNo)
    showSeeProduct(product.SysNo)
    //showSeeProduct(16)
  },
  toHome:function()
  {
    util.toHome()
  },
  toCart: function () {
    util.toCart()
  },
  toAboutAPP: function () {
    util.toAboutAPP()
  },
  Collect: function () {
    Collect()
  },
  toProductReview :function ()
  {
    toProductReview()
  },
  toProductPara:function()
  {
    toProductPara()
  },
  toProductGraphic: function () {
    toProductGraphic()
  },
  showServeDescView: function () {
    that.setData({
      showServeDescView: true
    })
  },
  hideServeDescView: function () {
    that.setData({
      showServeDescView: false
    })
  },
  addCart: function () {
    addCart(sysNo)
  },
  addCartSee: function (e) {
    var productSysNo = e.currentTarget.dataset.productsysno
    addCart(productSysNo)
  },
  //分享
  onShareAppMessage: function () {

    //util.showToast("defdfd")
    var productdetail = that.data.productDetail
    if(productdetail == null || productdetail.Product == null)
    {
      return
    }

    var path = 'pages/product/productdetail?SysNo=' + sysNo
    path = util.getSharePath(path)

    //没有活动 分享商品
    if(that.data.activeInfo == null)
    {
      //获取分享术语
      var price = productdetail.Product.Price / 100.00
      var title = price.toString() + '元 ' + productdetail.Product.ProductName
      
      if (title == null || title.length == 0) {
        title = '花擦！这家的水果好吃就算了，居然还能1小时送到！'
      }

      return {
        title: title,
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
    else{
      //获取分享术语
      var title = that.data.activeInfo.ShareTitle

      if (title == null || title.length == 0) {
        title = '花擦！这家的水果好吃就算了，居然还能1小时送到！'
      }

      var imageurl = that.data.activeInfo.ShareImgUrl
      if (imageurl == null || imageurl.length == 0)
      {
        imageurl = that.data.productDetail.PictureUrls[0]
      }

      return {
        title: title,
        path: path,
        imageUrl: imageurl,
        success: function (res) {
          if (res.shareTickets && res.shareTickets[0]) {
            //获取分享信息及上报解密
            console.log('获取到群签名:' + JSON.stringify(res))
            //获取分享信息及上报解密
            getShareInfo(res.shareTickets[0], path, appenum.WXOpenShareLogType.Share.Value)
          }
          else {
            util.saveNoTicketShareInfo(path, appenum.WXOpenShareLogType.Share.Value)
            
            if (that.data.activeInfo.ActStatus == that.data.NoComplete)
            {
              //必须分享到群提醒
              wx.showModal({
                title: '红包提醒',
                content: '必须分享到微信群，才能领取红包！',
                showCancel:false,
              })
            }
          }
        },
        fail: function (res) {
        }
      }
    }
  },
  //红包悬浮点击事件
  _folatcoupon_click: function () {
    couponProcess()
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
  //粉丝群操作
  _wxGroupInClick: function () {
    util.toFansGroup()
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

  /*
  if (app.globalData.storeInfo == null) {
    if (firstLocation) {
      getLocation()
    }
    else {
      getLocationStoreFail()
    }
    return
  }*/

  if (app.globalData.storeInfo == null) {
    getLocation()
    firstLocation = false
    return
  }

  getProductInfo()
}

function getProductInfo()
{
  getProductDetail()
  //getGraphicDetail()
  //getProductAttribute()
}

function getProductDetail()
{
  var data = {};
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))
  if(app.globalData.customerInfo)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }

  data.StoreSysNo = app.globalData.storeInfo.SysNo
  data.ProductSysNo = sysNo

  util.requestGet('ProductDetailService',data,getProductDetailSuccess,getProductDetailFail,null)
} 

function getProductDetailSuccess(res)
{
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))
  if(res.data != null && res.data.Entity != null)
  {
    // util.shwoModel('11',res.data.Entity.IsCollectItem.toString());

    if (res.data.Entity.ProductRemark != null)
    {
      res.data.Entity.ProductRemark.strRowCreateDate = util.convertTime(res.data.Entity.ProductRemark.rowCreateDate).substr(0,10)
    }

    that.setData({
      productDetail:res.data.Entity,
    })

    /*
    if(activeSysNo)
    {
      //获取商品活动
      getShareActive()
    }*/

    getShareActive()

    firstRequest = 0
    return
  }



  if (fromApp != 0 && firstRequest == 1)
  {
    var message = null
    if(res.data == null || res.data.ResponseStatus == null)
    {
      message = res.data.ResponseStatus.Message
    }

    if(message == null || message.length <= 0)
    {
      message = '获取商品信息失败'
    }

    wx.showModal({
      title: '提示',
      content: message,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          util.toHome()
        }
      }
    })

    firstRequest = 0
    return
  }

  firstRequest = 0
  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getProductDetailFail()
{

}


function getGraphicDetail()
{
  var data = {};
  data.ProductSysNo = sysNo

  util.requestGet('GraphicDetailsService',data,getGraphicDetailSuccess,getGraphicDetailFail,null)
} 

function getGraphicDetailSuccess(res)
{
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))

  if(res.data != null && res.data.Entity != null)
  {
    that.setData({
      graphicDetail:res.data.Entity,
    })
    return
  }

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getGraphicDetailFail()
{

}

function getProductAttribute()
{
  var data = {};
  data.ProductSysNo = sysNo

  util.requestGet('ProductAttributeService',data,getProductAttributeSuccess,getProductAttributeFail,null)
} 

function getProductAttributeSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    that.setData({
      productAttribute:res.data.Entity,
    })
    return
  }

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getProductAttributeFail()
{

}

function Collect() {
  if (that.data.productDetail.IsCollectItem) {
    cancelCollect()
  }
  else {
    addCollect()
  }
}

function addCollect()
{
  var data = {};
  
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.ProductSysNo = sysNo

  util.requestPost('addcollectservice', data, addCollectSuccess, addCollectFail, null)
}

function addCollectSuccess(res)
{
  if (res.data != null && res.data.result) {
   
    var productDetail = that.data.productDetail
    productDetail.IsCollectItem = true

    that.setData({
      productDetail: productDetail
    })

    util.showToast('收藏成功')
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function addCollectFail()
{

}


function cancelCollect() {
  var data = {};
  
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.ProductSysNo = sysNo

  util.requestPost('canceledcollectservice', data, cancelCollectSuccess, cancelCollectFail, null)
}

function cancelCollectSuccess(res) {
  if (res.data != null && res.data.result) {
    var productDetail = that.data.productDetail
    productDetail.IsCollectItem = false

    that.setData({
      productDetail: productDetail
    })

    util.showToast('取消收藏成功')
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function cancelCollectFail() {

}

//***************加入购物车**************//
function addCart(sysNo) {
  util.addCart(sysNo, addCartSuccess, addCartFail, null)
}

function addCartSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    app.globalData.ShoppingCartCount = res.data.Entity.ShoppingCartCount

    util.showTabBarCartCount()

    that.setData({
      ShoppingCartCount: app.globalData.ShoppingCartCount
    })

    util.showToast('加入购物车成功')
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function addCartFail() {

}
//***************加入购物车**************//

//***************红包活动****************//
//获取商品红包
function getShareActive()
{
  if (app.globalData.customerInfo == null)
  {
    return
  }

  var data = {};

  data.FromUserNo = app.globalData.customerInfo.CustomerSysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveType = appenum.ActiveType.Product.Value
  // if(activeSysNo)
  // {
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

  if (app.globalData.customerInfo == null)
  {
    return
  }
  var data = {};

  data.FromUserNo = app.globalData.customerInfo.CustomerSysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.ActiveType = appenum.ActiveType.Product.Value
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

  if (res.data.ResponseStatus != null && res.data.ResponseStatus.Message != null && res.data.ResponseStatus.Message.length > 0)
  {
    wx.showModal({
      title: '红包提示',
      content: res.data.ResponseStatus.Message,
      showCancel:false,
    })
  }


  //util.showToast(res.data.ResponseStatus.Message, -1)
}

function saveActiveLogFail() {

}

//领取红包
function receiveCoupon()
{
  if (that.data.activeInfo == null)
  {
    return
  }

  if (app.globalData.customerInfo == null)
  {
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
      confirmText:'立即使用',
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

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function receiveCouponFail() {

}

function couponProcess()
{
  if(that.data.activeInfo != null)
  {
    //已经完成
    if (that.data.activeInfo.ActStatus == that.data.Complete)
    {
      //领取红包
      receiveCoupon()
    }

    //已经领取
    if (that.data.activeInfo.ActStatus == that.data.Received) {
      // wx.showModal({
      //   title: '13',
      //   content: that.data.activeInfo.ActStatus,
      // })
      //领取红包
      util.toCouponList()
    }

    //分享
    if (that.data.activeInfo.ActStatus == that.data.NoComplete)     {
      // wx.showModal({
      //   title: '14',
      //   content: that.data.activeInfo.ActStatus,
      // })
      //领取红包
      showShareDialog()
    }
  }
}

function showShareDialog()
{
  if (that.data.activeInfo != null) {

    var content = "分享到" + that.data.activeInfo.ActNeedTimes + "个群，立得" + that.data.activeInfo.ActAmt + "元红包"
    var buttonText = "立即分享"

    if (that.data.activeInfo.ActJoinTimes > 0)
    {
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
      shareDialogisShowShare:true,
    })

    that.dialog.showDialog();
  }

}


function showReceivedDialog(message) {
  if (that.data.activeInfo != null) {
    that.setData({
      shareDialogTitle: '红包领取成功',
      shareDialogContent: message,
      shareDialogbuttonText: '立即使用',
      shareDialogisShowShare:false,
    })

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

//***************页面跳转****************//
function toProductReview()
{
  wx.navigateTo({
    url: '../product/productreview?SysNo=' + sysNo,
  })
}

function toProductPara() {
  wx.navigateTo({
    url: '../product/productpara?SysNo=' + sysNo,
  })
}


function toProductGraphic() {
  wx.navigateTo({
    url: '../product/productgraphic?SysNo=' + sysNo,
  })
}

function showSeeProduct(sysNo){
  wx.redirectTo({
    url: '../product/productdetail?SysNo=' + sysNo,
  })
}
//***************页面跳转****************//

//***************定位及获取门店****************//
//解决分享后门店定位问题

function getLocation() {
  util.getLocation(getLocationStoreSuccess, getLocationStoreFail, null)
}

function getLocationStoreSuccess(res) {
  app.globalData.locationInfo = res

  //获取可配送门店
  util.getGisStore(getGisStoreSuccess, getGisStoreFail, null)
}

function getGisStoreSuccess(res) {
  if (res.data != null && res.data.Entity != null) {
    app.globalData.storeInfo = res.data.Entity
    
    getProductInfo()

    util.setCityInfo()
  }
  else {
    getLocationStoreFail()
  }
}

function getGisStoreFail() {
  getLocationStoreFail()
  //util.toselectAddress()
}

//定位失败等，使用默认门店
function getLocationStoreFail() {

  if (app.globalData.locationFailStoreInfo != null) {
    app.globalData.storeInfo = app.globalData.locationFailStoreInfo

    getProductInfo()
  }
}
//***************定位及获取门店****************//