// pages/group/productdetail.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var planSysNo
var listPTGM
var index = 0
var countDownTimer
var refreshTimer
var limitTimer
var refreshNum

var firstLocation

Page({
  data:{
    PTGPDInfo:null,
    timeArray:null,
    showHowActorView:false,
    showServeDescView:false,
    windowHeight:0,
    windowWidth:0,
    XiaoShiType:1,
    canShare: false,
    ShoppingCartCount:0,
    showReloadView:false,

    InvitationNew: '1',
    HeadFreeCouponINew: '3',
    StarImgUrl: appconst.StarImgUrl,

    ExpressDelivery: 1,
    HomeDelivery: 2,

    limitTime:'',

    isIpx: app.globalData.isIpx ? true : false,
    canWebView: util.canWebView(),
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    //设置分享
    util.showShareMenu()

    if(options.PlanSysNo == undefined)
    {
      planSysNo = null;
    }
    else
    {
      planSysNo = options.PlanSysNo
    }

    that = this

    listPTGM = null
    index = 0
    countDownTimer = null
    refreshTimer = null
    limitTimer = null
    refreshNum = 0

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    //console.log(windowHeight)

    that.setData({
      canShare: util.canShare(),
      windowHeight:windowHeight,
      windowWidth:windowWidth,
      XiaoShiType:appenum.GroupBuyType.XiaoShi.Value,
      ShoppingCartCount: app.globalData.ShoppingCartCount,
      InvitationNew: appenum.PTScenarioType.InvitationNew.Value.toString(),
      HeadFreeCouponINew: appenum.PTScenarioType.HeadFreeCouponINew.Value.toString(),
      ExpressDelivery: appenum.ShipType.ExpressDelivery.Value,
      HomeDelivery: appenum.ShipType.HomeDelivery.Value,
    })
    
    firstLocation = true
    // //延迟10秒显示重新加载
    // setTimeout(showReloadView, 10 * 1000)
  },
  onShow:function()
  {
     //无拼团编号
    if(planSysNo == null)
    {
      return
    }

    /*
    if (app.globalData.refreshuserLocation) {
      if (app.globalData.scopeuserLocation) {
        //firstLocation = true
        getLocation()
        return
      }
      app.globalData.refreshuserLocation = false
    }*/

    /*
    if (app.globalData.refreshuserLocation) {
      if (app.globalData.scopeuserLocation) {
        firstLocation = true
        getLocation()
      }
      else {
        getLocationStoreFail()
      }
      app.globalData.refreshuserLocation = false
      return
    }*/

    if (!firstLocation
      && app.globalData.storeInfo == null) {
      getLocation()
      return
    }

    refreshPageData()
  },
  onHide:function(){
    // 页面隐藏
    clearTimer()
  },
  onUnload:function(){
    // 页面关闭
    clearTimer()
  },
  toHome:function()
  {
    util.toHome()
    //getWxAqrCode()
  },
  retailbuy:function(e)
  {
    //单独购买加入购物车
    //retailbuy()
    addCart()
  },
  toCart: function (e)
  {
    util.toCart()
  },
  groupbuy:function(e)
  {
    groupbuy()
  },
  actorgroup:function(e)
  {
    var index = e.currentTarget.dataset.index
    actorgroup(index)
  },
  showHowActorView:function()
  {
    that.setData({
      showHowActorView:true
    })
  },
  hideHowActorView:function()
  {
    that.setData({
      showHowActorView:false
    })
  },
  showServeDescView:function()
  {
    that.setData({
      showServeDescView:true
    })
  },
  hideServeDescView:function()
  {
    that.setData({
      showServeDescView:false
    })
  },
  toProductReview: function () {
    toProductReview()
  },
  //分享
  onShareAppMessage: function () {

    //util.showToast("defdfd")
    var info = that.data.PTGPDInfo
    if (info == null) {
      return
    }

    //var url = that.route
    var path = 'pages/group/ptdetail'

    if (planSysNo != null && planSysNo.length > 0) {
      path = path + '?PlanSysNo=' + planSysNo
    }

    var price = info.GPrice/100.00
    var title = price.toString() + '元 ' +  info.CustPName + ' 赶快一起来拼团吧'
  
    path = util.getSharePath(path)
    var imageurl = null
    if (that.data.PTGPDInfo.PictureUrls != null
      && that.data.PTGPDInfo.PictureUrls.length > 0
      && that.data.PTGPDInfo.PictureUrls[0] != null  
      && that.data.PTGPDInfo.PictureUrls.length > 0)
    {
      imageurl = that.data.PTGPDInfo.PictureUrls[0]
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
  refreshData: function (e) {
    refreshPageData()
  },
  //粉丝群操作
  _wxGroupInClick: function () {
    util.toFansGroup()
  },
  toProductGraphic: function () {
    toProductGraphic()
  },
})

function refreshPageData()
{
  // if (app.globalData.customerInfo == null) {
  //   //延迟3秒刷新数据
  //   setTimeout(refreshPageData, 3 * 1000)
  //   return
  // }
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

  if(app.globalData.storeInfo != null)
  {
    getPTGPDInfo()
  }
  else
  {
    /*
    //getLocation()
    if (firstLocation) {
      getLocation()
      firstLocation = false
    }
    else {
      getLocationStoreFail()
    }*/

    if (app.globalData.storeInfo == null) {
      getLocation()
      firstLocation = false
      return
    }
  }

  clearTimer()

  refreshTimer = setInterval(getPTGPDInfo,3*60*1000)
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

//清空定时刷新
function clearTimer()
{
  if(countDownTimer != null)
  {
    clearInterval(countDownTimer)
  }

  if(refreshTimer != null)
  {
    clearInterval(refreshTimer)
  }

  if (limitTimer != null)
  {
    clearInterval(limitTimer)
  }
}

function getPTGPDInfo()
{
  var data = {};
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))
  data.StoreSysNo = app.globalData.storeInfo.SysNo
  if(app.globalData.customerInfo != null)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }
  data.PlanSysNo = planSysNo

  refreshNum++;
  util.requestGet('GetPTGPDService',data,getPTGPDInfoSuccess,getPTGPDInfoFail,null,refreshNum == 1)
} 

function getPTGPDInfoSuccess(res)
{
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))

  if(res.data != null && res.data.Entity != null)
  {
    // util.shwoModel('11',res.data.Entity.IsCollectItem.toString());
    if (res.data.Entity.ProductRemark != null) {
      res.data.Entity.ProductRemark.strRowCreateDate = util.convertTime(res.data.Entity.ProductRemark.rowCreateDate).substr(0, 10)
    }

    that.setData({
      PTGPDInfo:res.data.Entity,
    })

    hideReloadView()

    //限时购
    if (that.data.PTGPDInfo.EndTime != null && that.data.PTGPDInfo.EndTime.length > 0) {
      if (that.data.PTGPDInfo.IsLimitTime != null && that.data.PTGPDInfo.IsLimitTime == 1)
      {
        showLimitTime()
        if (that.data.limitTime != "-1")
        {
          limitTimer = setInterval(showLimitTime, 1000)
        }
      }
    }

    //倒计时
    listPTGM = res.data.Entity.ListPTGM
    showCountDown()
    
    return
  }

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getPTGPDInfoFail()
{

}

function showLimitTime(endTime)
{

  var limitTime = util.countDown(that.data.PTGPDInfo.EndTime)

  if (limitTime == "-1" && limitTimer != null)
  {
    clearInterval(limitTimer)
  }

  that.setData({
    limitTime: limitTime
  });
}

function showCountDown()
{
  if (listPTGM == undefined || listPTGM == null || listPTGM.length == 0) {
    return
  }

  countDown()
  countDownTimer = setInterval(countDown, 1000)
}

// function toHome()
// {
//    wx.switchTab({
 
//     url: '../group/index'
//   })

//   //wx.navigateBack()
// }

function retailbuy()
{
  toSettlement(appenum.PTSettlementType.Retail.Value,null)
}

function groupbuy()
{
  toSettlement(appenum.PTSettlementType.Open.Value,null)
}


function actorgroup(index)
{
    if(listPTGM == undefined || listPTGM == null || listPTGM.length <= index)
    {
      return
    }

    var item = listPTGM[index]
    var gmsysNo = item.GMSysNo
    
    //自己团，去团单详情
    if (app.globalData.customerInfo.CustomerSysNo == item.CustomerSysNo)
    {
      toptgmdetail(gmsysNo)
      return
    }

    //参团
    actorGroup(gmsysNo)
}

function actorGroup(gmsysNo) {
  if (isTempUser()) {
    return
  }

  var url = '../group/settlement?PlanSysNo=' + planSysNo + '&GMSysNo=' + gmsysNo + '&SettType=' + appenum.PTSettlementType.Actor.Value + "&ProductSysNo=" + that.data.PTGPDInfo.ProductSysNo
  wx.navigateTo({
    url: url
  })
}

function toptgmdetail(gmsysNo)
{
  var url = '../group/ptgmdetail?PlanSysNo=' + planSysNo + "&GMSysNo="  + gmsysNo + '&SelectType=1'
  wx.navigateTo({
    url: url
  })
}

function toSettlement(settType,gmsysNo)
{
  if (isTempUser())
  {
    return
  }

  var url = '../group/settlement?PlanSysNo=' + planSysNo + '&SettType=' + settType

  if(!(gmsysNo == undefined) && gmsysNo != null && gmsysNo.length > 0)
  {
    url = url + '&GMSysNo=' + gmsysNo
  }

  url = url + "&ProductSysNo=" + that.data.PTGPDInfo.ProductSysNo

  wx.navigateTo({
    url: url
  })
}

function isTempUser()
{
  //Edit by hr 2018-08-06 临时用户 不允许拼团 
  if (util.isTempCustomer()) {
    wx.showModal({
      title: '提示',
      content: "很抱歉，您尚未登录，请先登录再操作哦~",
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          util.toLoginPhone()
        }
      }
    })

    return true
  }

  return false
}

//***************加入购物车**************//
function addCart() {
  
  util.addCart(that.data.PTGPDInfo.ProductSysNo, addCartSuccess, addCartFail, null)
}

function addCartSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    app.globalData.ShoppingCartCount = res.data.Entity.ShoppingCartCount

    that.setData({
      ShoppingCartCount: app.globalData.ShoppingCartCount
    })

    //util.showTabBarCartCount()

    //util.showToast('加入购物车成功')
    addCartSuccessProcess()
    return
  }

  if (res.data != null && res.data.ResponseStatus != null
    && res.data.ResponseStatus.ErrorCode == 301402) {
    addCartSuccessProcess()
    return
  }

  /*
  if (res.data != null && res.data.ResponseStatus != null
    && res.data.ResponseStatus.ErrorCode == 301404)
  {
      wx.showModal({
      title: '提示',
      content: res.data.ResponseStatus.Message,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          firstRequest = 1
          util.toLoginPhone()
        }
      }
    })
    
    return;
  }
  */
  
  addCartFailProcess(res.data.ResponseStatus.Message)
}


function addCartFail() {
  addCartFailProcess('加入购物车失败')
}

function addCartSuccessProcess() {
  //showToastView('加入购物车成功', 0)
  util.toCart()
}

function addCartFailProcess(message) {
  //showToastView('加入购物车成功', 0)
  if (message == null || message.length == 0) {
    wx.navigateBack()
    return
  }

  wx.showModal({
    title: '提示',
    content: message,
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        wx.navigateBack()
      }
    }
  })
}

//***************加入购物车**************//

function toProductReview() {
  wx.navigateTo({
    url: '../product/productreview?SysNo=' + that.data.PTGPDInfo.ProductSysNo,
  })
}

function toProductGraphic() {
  wx.navigateTo({
    url: '../product/productgraphic?SysNo=' + that.data.PTGPDInfo.ProductSysNo,
  })
}

//******************倒计时****************//
function countDown(){
    var timeArray = new Array()
    var clearCoun = 0
    for(var i = 0; i < listPTGM.length;i++)
    {
      var memo =util.countDown(listPTGM[i].EndTime)
      //util.showModel('11',memo)
      if(memo == "-1")
      {
        //memo = "已结束"
        clearCoun ++;
      }
      else{
        //memo = "剩余"+ memo + "结束"
      }
      timeArray[i] = memo
    }

    that.setData({
      timeArray: timeArray
    });

    //全部已结束，清除倒计时
    if(clearCoun == listPTGM.length && countDownTimer != null)
    {
      clearInterval(countDownTimer)
    }
}
//******************倒计时****************//

//***************定位及获取门店****************//
//解决分享后门店定位问题

function getLocation()
{
  util.getLocation(getLocationStoreSuccess, getLocationStoreFail,null)
}

function getLocationStoreSuccess(res)
{
  app.globalData.locationInfo = res

  //获取可配送门店
  util.getGisStore(getGisStoreSuccess,getGisStoreFail,null)
}

function getGisStoreSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    app.globalData.storeInfo = res.data.Entity
    
    getPTGPDInfo()

    util.setCityInfo()
  }
  else
  {
    getLocationStoreFail()
  }
}

function getGisStoreFail()
{
  getLocationStoreFail()
}

//定位失败等，使用默认门店
function getLocationStoreFail() {
  if (app.globalData.locationFailStoreInfo != null)
  {
    app.globalData.storeInfo = app.globalData.locationFailStoreInfo

    getPTGPDInfo()
  }
}
//***************定位及获取门店****************//

function getWxAqrCode()
{
  var scene = "T:1,PN:" + planSysNo

  var data = {}

  data.type = appenum.WXAqrCodeType.B.Value
  data.scene = scene
  //data.width = 430 //默认430

  util.getWxAqrCode(data, null, null,null)
}