// pages/order/orderdetail.js
var app = getApp()
var that

var soSysNo
var isSubmit
var pttype = '0'

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

Page({
  data:{
    orderDetailInfo:null,
    WaitingPay:2,
    Finished:7,
    WaitingOutStock:1,
    OutStock:4,
    WaitReceive:21,
    showShareView:false,
    windowHeight:0,
    windowWidth:0,

    ExpressDelivery:1,
    HomeDelivery: 2,
    
    isShowToast: false,
    toastMessage: '',

    isIpx: app.globalData.isIpx ? true : false,
    //虚拟订单
    VirtualProduct: appenum.SaleType.VirtualProduct.Value,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    if(options.SOSysNo == undefined)
    {
      soSysNo = 0;
    }
    else
    {
      soSysNo = options.SOSysNo
    }

    if(options.isSubmit == undefined)
    {
      isSubmit = 0;
    }
    else
    {
      isSubmit = options.isSubmit
    }

    if (options.pttype == undefined) {
      pttype = '0';
    }
    else {
      pttype = options.pttype
    }

    that = this

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowHeight:windowHeight,
      windowWidth: windowWidth,

        WaitingPay:appenum.OrderStatus.WaitingPay.Value,
        OutStock:appenum.OrderStatus.OutStock.Value,
        WaitingOutStock:appenum.OrderStatus.WaitingOutStock.Value,
        Finished:appenum.OrderStatus.Finished.Value,     WaitReceive:appenum.OrderStatus.WaitReceive.Value,

        ExpressDelivery: appenum.ShipType.ExpressDelivery.Value,
        HomeDelivery: appenum.ShipType.HomeDelivery.Value,
    })

    getOrderDetail()
  },
  callstorephone:function()
  {
    var storeInfo = that.data.orderDetailInfo.StoreInfo
    if(storeInfo != null
    && storeInfo.Tel != null 
    && storeInfo.Tel.length > 0)
    {
      var phone = storeInfo.Tel
      util.callPhone(phone)
    }
  },
  calldeliveryphone:function()
  {
    var deliveryUserInfo = that.data.orderDetailInfo.DeliveryUserInfo
    if(deliveryUserInfo != null
    && deliveryUserInfo.DeliveryUserPhone != null 
    && deliveryUserInfo.DeliveryUserPhone.length > 0)
    {
      var phone = deliveryUserInfo.DeliveryUserPhone
      util.callPhone(phone)
    }
  },
  toPay:function()
  {
     getPayInfo(that.data.orderDetailInfo.SOSysNo)
  },
  cancelorder:function()
  {
    cancelOrder(that.data.orderDetailInfo.SOSysNo)
  },
  toShare:function()
  {
    toptgmdetail(1)
  },
  groupDetail:function()
  {
    toptgmdetail(0)
  },
  repeatBuy:function()
  {
    if (that.data.orderDetailInfo.PTType != null)
    {
      pttype = that.data.orderDetailInfo.PTType
    }

    if (pttype == '0')
    {
      repeatbuy()
    }
    else
    {
      toPTdetail()
    }
  },
  showDeliveryInfo:function()
  {
    showDeliveryInfo()
  },
  // //分享
  // onShareAppMessage: function () {

  //   //util.showToast("defdfd")
  //   var info = that.data.orderDetailInfo
  
  //   that.setData({
  //     showShareView:false
  //   })

  //   if(info != null && info.OrderFromProducts!=null && info.OrderFromProducts.length >0)
  //   {
  //     var price = info.OrderFromProducts[0].Price/100.00
  //      var title = '我买了 ' + price.toString() + '元 ' + info.OrderFromProducts[0].ProductName + ' 赶快一起来参团吧'

  //      var url = '/pages/group/ptdetail?PlanSysNo=' + 27
  //     return {
  //       title:title,
  //       path:url
  //     }
  //   }
  // }
})

function getOrderDetail()
{
 var data = {};
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.SOSysNo = soSysNo

  util.requestGet('OrderFromDetailService',data,getOrderDetailSuccess,getOrderDetailFail,null)
}

function getOrderDetailSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {

    if(res.data.Entity.ReceiveInfo != null
    && res.data.Entity.ReceiveInfo.ReceiveAddress != null)
    {
    res.data.Entity.ReceiveInfo.ReceiveAddress = res.data.Entity.ReceiveInfo.ReceiveAddress.replace('上海市 ','').replace(' ','')
  }
  
    res.data.Entity.strRowCreateDate = util.convertTime(res.data.Entity.rowCreateDate)

    res.data.Entity.otherAmt = parseInt(res.data.Entity.CouponAmt) + parseInt(res.data.Entity.TransFee)

    //util.shwoModel('11','请输入您需要搜索的内容');
    that.setData({
      orderDetailInfo:res.data.Entity
    })

    // //订单提交页 自动支付
    // if(isSubmit == 1 && res.data.Entity.Status == appenum.OrderStatus.WaitingPay.Value)
    // {
    //   getPayInfo(res.data.Entity.SOSysNo)
    //   isSubmit = 0
    // }
    return
  }

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getOrderDetailFail()
{

}

function getPayInfo(soSysNo)
{
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
        app.globalData.refreshOrderList = true
        var order = that.data.orderDetailInfo
        order.OrderFromStatus = appenum.OrderStatus.WaitingOutStock.Value
        order.OrderStatusName = appenum.OrderStatus.WaitingOutStock.Name

        that.setData({
          orderDetailInfo: order
        })

        //3秒后刷新
        //setTimeout(getOrderDetail,1500)
        util.showToast('支付成功')
        //等待1.5
        util.sleep(1500)
        getOrderDetail()
      },
    'fail':function(res){
        util.showToast('支付未完成',-1)
      //util.showModel('333',JSON.stringify(res))
      }
    })

    return 
  }
  
  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getPayDataFail()
{

}


function cancelOrder(soSysNo)
{
  var data = {};
  data.SOSysNo = soSysNo
  // data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  util.requestPost('CanceledOrderFromService',data, cancelOrderSuccess, cancelOrderFail,null)
}

function cancelOrderSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
     app.globalData.refreshOrderList = true

    var info = that.data.orderDetailInfo
    info.OrderFromStatus = res.data.Entity.OrderFromStatus
    info.OrderStatusName = res.data.Entity.ShowStatusName
    info.IsCanCancel = res.data.Entity.IsCanCancel

     that.setData({
      orderDetailInfo: info
    })

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

function showDeliveryInfo()
{
  wx.navigateTo({
    url: '../order/orderprocess?soSysNo=' + that.data.orderDetailInfo.SOSysNo
  })
}


function toptgmdetail(isShare)
{
  var info = that.data.orderDetailInfo
  //SelectType 查询类型：1去参团 2团单详情
  var url = '../group/ptgmdetail?PlanSysNo=' + info.PTPlanSysNo + "&GMSysNo="  + info.PTGMSysNo + "&SoSysNo=" + info.SOSysNo + '&SelectType=2&isShare=' + isShare
  wx.redirectTo({
    url: url
  })
}

function toPTdetail()
{
  var info = that.data.orderDetailInfo
  var url = '../group/ptdetail?PlanSysNo=' + info.PTPlanSysNo
  wx.redirectTo({
    url: url
  })
}

function repeatbuy() {
  
  var data = {};
  data.SOSysNo = soSysNo
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.StoreSysno = app.globalData.storeInfo.SysNo

  util.requestPost('AddCartFromSOService', data, repeatbuySuccess, repeatbuyFail, null)
}

function repeatbuySuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    app.globalData.ShoppingCartCount = res.data.Entity.ProductCount

    //util.showTabBarCartCount()

    //util.showToast('重新加入购物车成功')
    showToastView('重新加入购物车成功');
    return
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function repeatbuyFail() {

}

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