// pages/group/ptgmdetail.js


var app = getApp()
var that
var countDownTimer
var refreshTimer

var windowHeight
var windowWidth
var PlanSysNo
var GMSysNo
var SOSysNo
var SelectType
var isShare
var fromShare
var countDownNum
var refreshNum
var countDownRefresh

var openRefresh

var limitTimer

var firstLocation

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

Page({
  data:{
    showShareView:false,
    showHowActorView:false,
    showServeDescView:false,
    fromShare:0,
    windowHeight:1000,
    windowWidth:0,
    PTGMDetailInfo:null,
    countDownTime:null,
    Invitation:1,
    OneKeyActor:2,
    OneKeyOpen:3,
    Finished:4,
    Succeed:5,
    Failed:6,
    isIPhone:false,
    XiaoShiType:1,
    canShare: false,
    showOtherGroup:false,//看看其他团
    showReloadView:false,

    InvitationNew: '1',
    HeadFreeCouponINew: '3',

    ExpressDelivery: 1,
    HomeDelivery: 2,

    limitTime: '',

    isIpx: app.globalData.isIpx ? true : false
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    //设置分享
    util.showShareMenu()

    if(options.PlanSysNo == undefined)
    {
      PlanSysNo = appconst.intDefual;
    }
    else
    {
      PlanSysNo = options.PlanSysNo
    }

    if(options.GMSysNo == undefined)
    {
      GMSysNo = appconst.intDefual;;
    }
    else
    {
      GMSysNo = options.GMSysNo
    }

    SOSysNo = appconst.intDefual;
    if(!(options.SOSysNo == undefined))
    {
      SOSysNo = options.SOSysNo
    }

    if (!(options.SoSysNo == undefined)) {
      SOSysNo = options.SoSysNo
    }

     //SelectType 查询类型：1去参团 2团单详情
    if(options.SelectType == undefined)
    {
      SelectType = 1;
    }
    else
    {
      SelectType = options.SelectType
    }

    if(options.isShare == undefined)
    {
      isShare = 0;
    }
    else
    {
      isShare = options.isShare
    }

    if(options.fromShare == undefined)
    {
      fromShare = 0;
    }
    else
    {
      fromShare = options.fromShare
    }
    
    that = this

    countDownTimer = null
    refreshTimer = null

    refreshNum = 0
    countDownNum = 0
    countDownRefresh = false
    openRefresh = false
    firstLocation = true

    windowHeight = app.globalData.systemInfo.windowHeight + 60
    windowWidth = app.globalData.systemInfo.windowWidth

    var isIPhone = util.isIPhone()

    that.setData({
      canShare: util.canShare(),
      windowHeight:windowHeight,
      windowWidth:windowWidth,
      fromShare:fromShare,
      isIPhone:isIPhone,
      XiaoShiType:appenum.GroupBuyType.XiaoShi.Value,
      InvitationNew: appenum.PTScenarioType.InvitationNew.Value.toString(),
      HeadFreeCouponINew: appenum.PTScenarioType.HeadFreeCouponINew.Value.toString(),

      ExpressDelivery: appenum.ShipType.ExpressDelivery.Value,
      HomeDelivery: appenum.ShipType.HomeDelivery.Value,
    })

    if((PlanSysNo <= 0 || GMSysNo <= 0) && SOSysNo <= 0)
    {
      return
    }
    
    that.setData({
      Invitation:appenum.PTGMDetailStatus.Invitation.Value,
    OneKeyActor:appenum.PTGMDetailStatus.OneKeyActor.Value,
    OneKeyOpen:appenum.PTGMDetailStatus.OneKeyOpen.Value,
     Finished:appenum.PTGMDetailStatus.Finished.Value,
    Succeed:appenum.PTGMDetailStatus.Succeed.Value,
    Failed:appenum.PTGMDetailStatus.Failed.Value,
    })

    if ((PlanSysNo <= 0 || GMSysNo <= 0) && SOSysNo <= 0) {
      return
    }

    refreshPageData()
  },
  onShow:function()
  {
    if (app.globalData.loginphonesuccess) {
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }

    /*
    if (app.globalData.refreshuserLocation) {
      if (app.globalData.scopeuserLocation) {
        //firstLocation = true
        getLocation()
      }
      else {
        getLocationStoreFail()
      }
      app.globalData.refreshuserLocation = false
      return
    }

    if (!firstLocation && app.globalData.storeInfo == null) {
      getLocationStoreFail()
      return
    }
    */

    if (!firstLocation
      && app.globalData.storeInfo == null) {
      getLocation()
      return
    }

    if (openRefresh)
    {
      openRefresh = false
      if((PlanSysNo <= 0 || GMSysNo <= 0) && SOSysNo <= 0)
      {
        return
      }

      refreshPageData()
    }
  },
  onHide:function(){
    // 页面隐藏
    //clearTimer()
  },
  onUnload:function(){
    // 页面关闭
    clearTimer()
  },
  //隐藏
  hideShareView:function()
  {
    // that.setData({
    //   showShareView:false
    // })
    hideShareView()
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
  button_click:function()
  {
    clickProcess()
  },
  toHome:function()
  {
    //wx.showShareMenu()
    util.toHome()
  },
  showOtherGroup:function ()
  {
    toPTDetail()
  },
  //分享
  onShareAppMessage: function () {

    //util.showToast("defdfd")
    var info = that.data.PTGMDetailInfo

    if (!that.data.canShare && that.data.showShareView)
    {
      hideShareView()
      util.sleep(300)
    }
    
    if(info != null)
    {
      var price = info.GPrice/100.00
       var title = '我买了 ' + price.toString() + '元 ' + info.CustPName + ' 赶快一起来参团吧'

       var path = 'pages/group/ptgmdetail?PlanSysNo=' + PlanSysNo + "&GMSysNo="  + GMSysNo + "&SelectType=1&fromShare=1"

       path = util.getSharePath(path)
       
       var imageurl = info.PictureUrl
       if (info.PictureUrls != null 
          && info.PictureUrls.length > 0
          && info.PictureUrls[0] != null
          && info.PictureUrls[0].length > 0 ) {
         imageurl = info.PictureUrls[0]
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
    }
  },
  refreshData: function (e) {
    refreshPageData()
  },
  //粉丝群操作
  _wxGroupInClick: function () {
    util.toFansGroup()
  },
})

function refreshPageData()
{
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
  if(app.globalData.storeInfo == null)
  {
    if (firstLocation) {
      getLocation()
      firstLocation = false
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

  getPTGMDetail()
  clearTimer()

  refreshTimer = setInterval(getPTGMDetail,3*60*1000)
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

function getPTGMDetail()
{
  //PTGMDetailService
  var data = {};
  data.StoreSysNo = app.globalData.storeInfo.SysNo
  if(app.globalData.customerInfo != null)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }
  data.PlanSysNo = PlanSysNo
  data.GMSysNo = GMSysNo

  
  //SOSysNo时 SelectType=2 服务端报错
  if (SOSysNo > 0)
  {
    data.SOSysNo = SOSysNo
  }
  else
  {
    SelectType = 1
  }
  
  //SelectType 查询类型：1去参团 2团单详情
  data.SelectType = SelectType

  refreshNum ++
  util.requestGet('PTGMDetailService',data,getPTGMDetailSuccess,getPTGMDetailFail,null,refreshNum == 1)
} 

function getPTGMDetailSuccess(res)
{
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))

  if(res.data != null && res.data.Entity != null)
  {
    // util.shwoModel('11',res.data.Entity.IsCollectItem.toString());

    that.setData({
      PTGMDetailInfo:res.data.Entity,
    })

    hideReloadView()

    calShowOtherGroup(res.data.Entity)

    if (res.data.Entity.Status != null && res.data.Entity.Status.length > 0 
      && (res.data.Entity.Status == appenum.PTGMDetailStatus.Invitation.Value 
      ||res.data.Entity.Status == appenum.PTGMDetailStatus.OneKeyActor.Value))
    {
      if (that.data.PTGMDetailInfo.EndTime != null && that.data.PTGMDetailInfo.EndTime.length >0)
      {
        //限时购
        if (that.data.PTGMDetailInfo.IsLimitTime != null && that.data.PTGMDetailInfo.IsLimitTime == 1) {
          showLimitTime()
          if (that.data.limitTime != "-1") {
            limitTimer = setInterval(showLimitTime, 1000)
          }
        }

        getCountDown()
        if(that.data.countDownTime != null && that.data.countDownTime.length > 0)
        {
          if (isShare == 1 && !that.data.canShare)
          {
            showShareView()
          }
          countDownTimer = setInterval(countDown,1000)
        }
        return
      }
    }
    
    that.setData({
      countDownTime: null
    });
  }

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getPTGMDetailFail()
{

}

function showLimitTime(endTime) {

  var limitTime = util.countDown(that.data.PTGMDetailInfo.EndTime)

  if (limitTime == "-1" && limitTimer != null) {
    clearInterval(limitTimer)
  }

  that.setData({
    limitTime: limitTime
  });
}

//******************倒计时****************//
function getCountDown()
{
  var memo =util.countDown(that.data.PTGMDetailInfo.EndTime)
      
    if(memo == "-1")
    {
      memo = null
      //clearInterval(countDownTimer)
      clearTimer()
    }

    countDownNum ++;
    that.setData({
      countDownTime: memo
    });
}

function countDown(){

  if (that.data.countDownTime == null || that.data.countDownTime.length == 0) {
    return
  }

  var memo =util.countDown(that.data.PTGMDetailInfo.EndTime)
    
  if(memo == "-1")
  {
    memo = null
    clearTimer()

    //刷新过一次 不再刷新
    if (!countDownRefresh)
    {
      countDownRefresh = true
      getPTGMDetail()
    }
  }
  
    countDownNum ++;
    that.setData({
      countDownTime: memo
    });
}
//******************倒计时****************//

//计算看看其他团
function calShowOtherGroup(info) 
{

  //看看其他团
  var showOtherGroup = false
  //var info = that.data.PTGMDetailInfo
  switch (parseInt(info.Status)) {
    case appenum.PTGMDetailStatus.Invitation.Value:
      break;
    case appenum.PTGMDetailStatus.OneKeyActor.Value:
      showOtherGroup = true
      break;
    case appenum.PTGMDetailStatus.OneKeyOpen.Value:
      showOtherGroup = true
      break;
    case appenum.PTGMDetailStatus.Finished.Value:
      showOtherGroup = true
      break;
    case appenum.PTGMDetailStatus.Succeed.Value:
      break;
    case appenum.PTGMDetailStatus.Failed.Value:
      showOtherGroup = true
      break;
  }

  that.setData({
    showOtherGroup: showOtherGroup
  })

}


function clickProcess()
{
  var info = that.data.PTGMDetailInfo
  switch(parseInt(info.Status))
  {
    case appenum.PTGMDetailStatus.Invitation.Value:
      //wx.showShareMenu()
      showShareView()
      break;
    case appenum.PTGMDetailStatus.OneKeyActor.Value:
      actorGroup()
      break;
    case appenum.PTGMDetailStatus.OneKeyOpen.Value:
      //openGroup()
      toPTDetail()
      break;
    case appenum.PTGMDetailStatus.Finished.Value:
      toHome()
      break;
    case appenum.PTGMDetailStatus.Succeed.Value:
      //openGroup()
      toPTDetail()
      break;
    case appenum.PTGMDetailStatus.Failed.Value:
      break;
  }

}

function actorGroup()
{

  if (isTempUser()) {
    return
  }

  openRefresh = true

  var url = '../group/settlement?PlanSysNo=' + PlanSysNo + '&GMSysNo=' + GMSysNo + '&SettType=' + appenum.PTSettlementType.Actor.Value + "&ProductSysNo=" + that.data.PTGMDetailInfo.ProductSysNo
  wx.navigateTo({
    url: url
  })
  
}

//开团
function openGroup()
{
  if (isTempUser()) {
    return
  }

  var url = '../group/settlement?PlanSysNo=' + PlanSysNo + '&SettType=' + appenum.PTSettlementType.Open.Value + "&ProductSysNo=" + that.data.PTGMDetailInfo.ProductSysNo
  wx.navigateTo({
    url: url
  })
}

function toPTDetail() {
  wx.redirectTo({
    url: '../group/ptdetail?PlanSysNo=' + PlanSysNo
  })
}

function isTempUser() {
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

function toHome()
{
  util.toHome()
}

function showShareView()
{
    that.setData({
      showShareView:true
    })

    setTimeout(hideShareView,2000)
}

function hideShareView()
{
  that.setData({
    showShareView:false
  })
}

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
   
    getPTGMDetail()

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
    //util.toselectAddress()
}

//定位失败等，使用默认门店
function getLocationStoreFail() {

  if (app.globalData.locationFailStoreInfo != null)
  {
    app.globalData.storeInfo = app.globalData.locationFailStoreInfo

    getPTGMDetail()
  }
}
//***************定位及获取门店****************//