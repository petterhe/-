// pages/order/orderlist.js
var app = getApp()
var that

const pageSize = 5

var currentPage
var orderlist
var bmore = true
var bmoretoast = true
var orderStatus = 0
var selectIndex = -1
var isRefreshNotify = false
var isRefreshIndex = false
var firstLocation
	
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

Page({
  data:{
    orderlist:null,
    orderStatus:0,
    AllStats:0,
    WaitingPay:2,
    OutStock:4,
    Weighing:5,
    WaitingSelf:6,
    Finished:7,
    WaitMakeGroup:20,
    WaitReceive:21,
    WaitingPayCount:'',
    WaitMakeGroupCount:'',
    WaitOutStockCount:'',
    WaitReceiveCount:'',
    listHeight:600,
    isIPhone:false,

    isShowToast: false,
    toastMessage: '',
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    currentPage = 1
    bmore = true
    bmoretoast = true
    orderStatus = 0
    selectIndex = -1
    isRefreshNotify = false
    isRefreshIndex = false
    firstLocation = true

    that = this

    var height =  util.getScrollHeight(70)
    that.setData(
      {
        listHeight:height,
        WaitingPay:appenum.OrderStatus.WaitingPay.Value,
        OutStock:appenum.OrderStatus.OutStock.Value,
        Weighing:appenum.OrderStatus.Weighing.Value,
        Finished:appenum.OrderStatus.Finished.Value,
      WaitMakeGroup:appenum.OrderStatus.WaitMakeGroup.Value,
        WaitReceive:appenum.OrderStatus.WaitReceive.Value,
        isIPhone:util.isIPhone()
      })

    refreshPageData()
  },
  onShow:function(){

    //更新购物车红点
    util.showTabBarCartCount()

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
    }*/

    if (!firstLocation
      && app.globalData.storeInfo == null) {
      if (app.globalData.scopeuserLocation) {
        getLocation()
      }
    }

    if (app.globalData.loginphonesuccess) {

      refreshOrderList()
      app.globalData.loginphonesuccess = false
    }

    //显示通知
    if(app.globalData.refreshOrderList)
    {
      refreshOrderList()

      app.globalData.refreshOrderList = false;
    }

    if(isRefreshNotify)
    {
      getNotice()
      isRefreshNotify = false
    }

  },
  statuschage:function(e){
    orderStatus = e.currentTarget.dataset.status
    that.setData({
      orderStatus:orderStatus
    })
    refreshOrderList();
  },
  //下拉按钮
  onReachBottom:function(e){
    if(!bmore)
    {
      if(bmoretoast)
      {
        //util.showToast('已经是最后一页',-1);
        showToastView('已经是最后一页', -1);
        bmoretoast = false
      }
      return
    }
    loadmore()
  },
  orderdetail:function(e){
    var index = e.currentTarget.dataset.index
    toOrderDetail(index)
  },
  deleteorder:function(e){
    wx.showModal({
      title: "删除确认",
      content:  "您确定需要删除此订单？",
      showCancel:true,
      success: function(res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index
          deleteOrder(index)
        }
      }
    })
  },
  payorder:function(e){
    var index = e.currentTarget.dataset.index
    getPayInfo(index)
  },
  cancelorder:function(e){
     wx.showModal({
      title: "取消确认",
      content:  "您确定需要取消此订单？",
      showCancel:true,
      success: function(res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index
          cancelOrder(index)
          }
        }
    })
  },
  toPTdetail(e)
  {
    if (app.globalData.storeInfo == null) {
      getLocation()
      firstLocation = false
      return
    } 

    var index = e.currentTarget.dataset.index
    toPTdetail(index)
  },
  repeatBuy:function(e){

    if (app.globalData.storeInfo == null) {
      getLocation()
      firstLocation = false
      return
    } 
    var index = e.currentTarget.dataset.index
    repeatbuy(index)
  },
  reminderorder:function(e){
    var index = e.currentTarget.dataset.index
    reminderOrder(index)
  },
  revieworder:function(e){
    var index = e.currentTarget.dataset.index
    reviewOrder(index)
  },
  refreshorder:function(e){
    var index = e.currentTarget.dataset.index
    isRefreshIndex = true
    refreshOrder(index)
  },
  toShare:function(e)
  {
    if (app.globalData.storeInfo == null) {
      getLocation()
      firstLocation = false
      return
    } 

    var index = e.currentTarget.dataset.index
    toptgmdetail(index,1)
  },
  groupDetail:function(e)
  {
    if (app.globalData.storeInfo == null) {
      getLocation()
      firstLocation = false
      return
    } 
    
    var index = e.currentTarget.dataset.index
    toptgmdetail(index,0)
  },
  toOrderAppeal: function (e) {
    var index = e.currentTarget.dataset.index
    toOrderAppeal(index)
  },
  //展示二维码
  showQCode: function (e) {
    util.showQCode()
  },
  //下拉刷新
  onPullDownRefresh: function(){

     refreshOrderList()
     //getNotice()

     wx.stopPullDownRefresh()
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


  refreshOrderList()

  /*
  if (app.globalData.storeInfo == null) {

    if (firstLocation) {
      getLocation()
      firstLocation = false
    }
    else {
      getLocationStoreFail()
    }
  }*/
}

function refreshOrderList()
{
   clearData()
   getOrderList()
   getNotice()
}

function clearData()
{
  currentPage = 1
  bmore = true
  bmoretoast = true

 orderlist = null
  that.setData({
    orderlist: orderlist
  })

}

function loadmore()
{
  currentPage++
  getOrderList()
}

function getOrderList()
{
  if (!app.globalData.customerInfo)
  {
    return
  }

  var data = {};
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.PageSize = pageSize
  data.CurrentPage = currentPage
  data.OrderStatus = orderStatus
  data.IsGroupBuy = 1 //暂时只显示团单

  util.requestGet('GetOrderFromService',data,getOrderListSuccess,getOrderListFail,null)
}

function getOrderListSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    
    if(res.data.Entity.length > 0)
    {
      showorderlist(res.data.Entity)
      return
    }

    if(currentPage == 1)
    {
      var message = "没有符合条件的订单"

      switch(orderStatus)
      {
        case 0:
          message = "难受，你还没宠幸过妙妙"
          break
        case appenum.OrderStatus.WaitingPay.Value:
          message = "土豪如你，钱都付完了"
          break
        case appenum.OrderStatus.WaitMakeGroup.Value:
          message = "这么划算，你居然还没有团"
          break
        case appenum.OrderStatus.OutStock.Value:
          message = "您目前没有外卖待配送哦"
          break
        case appenum.OrderStatus.WaitReceive.Value:
          message = "你目前没有外卖可收哦"
          break
      }

      //util.showModel('11',message);
      //util.showToast(message,-1)
      showToastView(message, -1);
    }
    return
  }

  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function showorderlist(list)
{
  if(orderlist == null || currentPage == 1)
  {
    orderlist = new Array()
    //orderlist = list
  }
 
  for (var i = 0 ; i < list.length; i++ ) 
　{ 
    list[i].strRowCreateDate = util.convertTime(list[i].rowCreateDate)

　　 orderlist.push(list[i])
　}
  
  if(list.length < pageSize)
  {
    bmore = false;
  }

  that.setData({
    orderlist: orderlist
  })
}

function getOrderListFail()
{

}

function deleteOrder(index)
{
  selectIndex = index
  var soSysNo = orderlist[index].SOSysNo

var data = {};
  data.SOSysNo = soSysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  util.requestPost('DelOrderService',data, deleteOrderSuccess, deleteOrderFail,null)
    
}

function deleteOrderSuccess(res)
{
  if(res.data != null && res.data.Entity != null &&  res.data.Entity.DelStatus == "1")
  {
     var orderlist = that.data.orderlist
     orderlist.splice(selectIndex,1)
     that.setData({
      orderlist: orderlist
    })

    util.showToast('订单删除成功')
    getNotice()
  }
  else
  {
    util.showToast('订单删除失败',-1)
  }
}

function deleteOrderFail()
{

}

function getPayInfo(index)
{
  selectIndex = index
  var soSysNo = orderlist[index].SOSysNo

  var data = {};
  data.OrderSysNo = soSysNo
  data.CustomerSysNo =    app.globalData.customerInfo.CustomerSysNo
  data.WXOpenId = app.globalData.userInfo.openId

  util.requestGet(appconst.GetWXOpenPayParamsService,data, getPayDataSuccess, getPayDataFail,null)

}

function getPayDataSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {

    //util.showModel('111',JSON.stringify(res.data))

    wx.requestPayment({
    'timeStamp': res.data.Entity.timeStamp,
    'nonceStr': res.data.Entity.nonceStr,
    'package': res.data.Entity.packageValue,
    'signType': 'MD5',
    'paySign': res.data.Entity.sign,
    'success':function(res){

      //util.showModel('222',JSON.stringify(res))
        var order = that.data.orderlist[selectIndex]
        order.OrderFromStatus = appenum.OrderStatus.WaitingOutStock.Value
        order.OrderStatusName = appenum.OrderStatus.WaitingOutStock.Name

        orderlist[selectIndex] = order

        that.setData({
          orderlist: orderlist
        })

        //getNotice()
        //setTimeout(refreshOrder(selectIndex),1500);
        util.showToast('支付成功')

        //等待1.5
        util.sleep(1500)
        refreshOrder(selectIndex)
        getNotice()
      },
    'fail':function(res){
        util.showToast('支付未完成',-1)
      //util.showModel('333',JSON.stringify(res))
      }
    })

    return 
  }
  
  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function getPayDataFail()
{

}

function refreshOrder(index)
{
  selectIndex = index
  var soSysNo = orderlist[index].SOSysNo

  var data = {};
  data.SOSysNo = soSysNo
  data.CustomerSysno =    app.globalData.customerInfo.CustomerSysNo

  util.requestGet('OrderFromDetailService',data, refreshOrderSuccess, refreshOrderFail,null)
}

function refreshOrderSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    var order = that.data.orderlist[selectIndex]
    order = res.data.Entity
     orderlist[selectIndex] = order

     that.setData({
      orderlist: orderlist
    })

    getNotice()
    if(isRefreshIndex)
    {
      isRefreshIndex = false
      util.showToast('订单刷新成功')
    }
    return
  }
    if(isRefreshIndex)
    {
      isRefreshIndex = false
      util.showToast('订单刷新失败',-1)
    }
}

function refreshOrderFail()
{

}

function cancelOrder(index)
{
  selectIndex = index
  var soSysNo = orderlist[index].SOSysNo

  var data = {};
  data.SOSysNo = soSysNo
  // data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  util.requestPost('CanceledOrderFromService',data, cancelOrderSuccess, cancelOrderFail,null)
}

function cancelOrderSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    var order = that.data.orderlist[selectIndex]
    order.OrderFromStatus = res.data.Entity.OrderFromStatus
    order.OrderStatusName = res.data.Entity.ShowStatusName
    order.IsCanCancel = res.data.Entity.IsCanCancel

    orderlist[selectIndex] = order

    that.setData({
      orderlist: orderlist
    })

    getNotice()
    util.showToast('取消处理完成')
  }
  else
  {
    util.showToast('订单取消失败',-1)
  }
}

function cancelOrderFail()
{

}


function reminderOrder(index)
{
  selectIndex = index
  var soSysNo = orderlist[index].SOSysNo

  var data = {};
  data.SOSysNo = soSysNo
  data.ReminderType = "1"
  data.OptUserSysNo = app.globalData.customerInfo.CustomerSysNo.toString()

  util.requestPost('SOReminderService',data, reminderOrderSuccess, reminderOrderFail,null)
}

function reminderOrderSuccess(res)
{
  if(res.data != null && res.data.Entity != null
  && res.data.Entity.Result)
  {
    var order = that.data.orderlist[selectIndex]
    
     order.FlagDesc = "已催单"
     order.IsShowReminder = '0'
     orderlist[selectIndex] = order

     that.setData({
      orderlist: orderlist
    })

    util.showToast('催单成功')
    return
  }
  
  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function reminderOrderFail()
{

}

function repeatbuy(index) 
{
  selectIndex = index
  var soSysNo = orderlist[index].SOSysNo

  var data = {};
  data.SOSysNo = soSysNo
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.StoreSysno = app.globalData.storeInfo.SysNo

  // util.requestPost('AddCartFromSOService', data, repeatbuySuccess, repeatbuyFail, null)

  util.requestPost('AddCartFromSOService', data, repeatbuySuccess, repeatbuyFail, null)
}

function repeatbuySuccess(res) {
  if (res.data != null && res.data.Entity != null) {
    
    app.globalData.ShoppingCartCount = res.data.Entity.ProductCount

    util.showTabBarCartCount()
    
    //util.showToast('重新加入购物车成功')
    showToastView('重新加入购物车成功');
    return
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function repeatbuyFail() {

}

function getNotice()
{
  var data = {};
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo

  util.requestGet('GetNoticeService',data, getNoticeSuccess, getNoticeFail,null,false)
}

function getNoticeSuccess(res)
{
  that.setData({
    WaitingPayCount:'',
    WaitMakeGroupCount:'',
    WaitOutStockCount:'',
    WaitReceiveCount:'',
  })

  if(res.data != null && res.data.Entity != null
  && res.data.Entity.length > 0)
  {
    for(var i = 0;i< res.data.Entity.length ; i++)
    {
        var noticeInfo = res.data.Entity[i]
        //待支付
        if(noticeInfo.Type == appenum.NoticType.WaitingPay.Value && noticeInfo.Count >0)
        {
          that.setData({
            WaitingPayCount:noticeInfo.Count.toString()
          })
        }

        //待成团
        if(noticeInfo.Type == appenum.NoticType.WaitMakeGroup.Value && noticeInfo.Count >0)
        {
          that.setData({                  
            WaitMakeGroupCount:noticeInfo.Count.toString()
          })
        }

        //待发货
        if(noticeInfo.Type == appenum.NoticType.WaitOutStock.Value && noticeInfo.Count >0)
        {
          that.setData({                  
            WaitOutStockCount:noticeInfo.Count.toString()
          })
        }

        //待收货
        if(noticeInfo.Type == appenum.NoticType.WaitReceive.Value && noticeInfo.Count >0)
        {
          that.setData({                  
            WaitReceiveCount:noticeInfo.Count.toString()
          })
        }
    }
    
    return
  }
  //util.showToast(res.data.ResponseStatus.Message,-1)
}

function getNoticeFail()
{

}

function toOrderDetail(index)
{
  var soSysNo = orderlist[index].SOSysNo
  var ptype = orderlist[index].PTType

  wx.navigateTo({
      //url: '../list/search?sourceType=1'
    url: '../order/gorderdetail?SOSysNo=' + soSysNo + '&pttype=' + ptype//打开带参数
    })
}

function reviewOrder(index)
{
  var soSysNo = orderlist[index].SOSysNo
  wx.navigateTo({
      //url: '../list/search?sourceType=1'
      url: '../order/orderfeed?SOSysNo='  + soSysNo//打开带参数
    })
}


function toptgmdetail(index,isShare)
{
  //SelectType 查询类型：1去参团 2团单详情
  var info = orderlist[index]
  var url = '../group/ptgmdetail?PlanSysNo=' + info.PTPlanSysNo + "&GMSysNo="  + info.PTGMSysNo + "&SoSysNo=" + info.SOSysNo + '&SelectType=2&isShare=' + isShare

  wx.navigateTo({
    url: url
  })
}

function toPTdetail(index)
{
  var info = orderlist[index]
  var url = '../group/ptdetail?PlanSysNo=' + info.PTPlanSysNo
  wx.navigateTo({
    url: url
  })
}

function toOrderAppeal(index)
{
  var soSysNo = orderlist[index].SOSysNo
  wx.navigateTo({
    //url: '../list/search?sourceType=1'
    url: '../refund/orderrefund?soSysNo=' + soSysNo//打开带参数
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
   
    refreshOrderList()

    util.setCityInfo()
    //getNotice()
  }
  else
  {
    getLocationStoreFail()
    //util.toselectAddress()
  }
}

function getGisStoreFail()
{
    //util.toselectAddress()
}

function getLocationStoreFail() {

  if (app.globalData.locationFailStoreInfo != null) {
    app.globalData.storeInfo = app.globalData.locationFailStoreInfo
  }
  // if (app.globalData.locationFailStoreInfo != null) {
  //   app.globalData.storeInfo = app.globalData.locationFailStoreInfo
    
  //   refreshOrderList()
  // }
}

//***************定位及获取门店****************//

//*************** 显示Toast ************//
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
//*************** 显示Toast ************//