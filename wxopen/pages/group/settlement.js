// pages/group/settlement.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var scrollPaddingTopValue = appconst.scrollPaddingTopValue

var planSysNo
var settType
var gmsysNo
var productSysNo
var storeSysNo
var addressSysNo
var firstRequest = 1

var isSelectAddress = false
var deliveryAddressSysNo=0

var selectCouponCode = null
var isSelectCoupon = false

var isSelectStore = false

var expressDelivery
var homeDelivery

// //提交时间对象
// var submitTimeObject
var isSubimting
var isClearAddress = false
var firstLocation
var confirmShipType = 0
var formId 

Page({
  data:{
    PTSettlementInfo:null,
    showHowActorView:false,
    showServeDescView:false,
    scrollPaddingTop:0,
    isTempCustomer: false,
    maxQty: appconst.maxQty,
    minQty: appconst.minQty,
    memo:null,
    soSysNo:0,
    submitButtonName:'立即支付',
    inputDisabled:false,
    showHowActorView:false,
    windowHeight:0,
    windowWidth:0,

    couponCount: 0,//几张红包可用
    useCoupon: 1,//使用红包 默认非选中不使用

    selectShipTypeSysNo: 0,
    selectShipTypeName:'',
    selectNodeTime: null,

    ExpressDelivery: 1,
    HomeDelivery: 2,
    storeInfo: null,
    receivePhone: null,

    isShowToast:false,
    toastMessage:'',

    isIpx: app.globalData.isIpx ? true : false,
    IsReservation:0
  },
   onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    if(options.PlanSysNo == undefined)
    {
      planSysNo = null;
    }
    else
    {
      planSysNo = options.PlanSysNo
    }

    if(options.SettType == undefined)
    {
      settType = null;
    }
    else
    {
      settType = options.SettType
    }

    if(options.GMSysNo == undefined)
    {
      gmsysNo = null;
    }
    else
    {
      gmsysNo = options.GMSysNo
    }

    //商品名称
    if (options.ProductSysNo == undefined) {
      productSysNo = null;
    }
    else {
      productSysNo = options.ProductSysNo
    }
     
    //无拼团编号或购买类型
    if(planSysNo == null || settType == null)
    {
      return
    }

    that = this

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    expressDelivery = appenum.ShipType.ExpressDelivery.Value
    homeDelivery = appenum.ShipType.HomeDelivery.Value

    that.setData({
      windowHeight:windowHeight,
      windowWidth:windowWidth,
      ExpressDelivery: expressDelivery,
      HomeDelivery: homeDelivery,
      storeInfo: app.globalData.storeInfo,

      selectShipTypeSysNo: 0,
      selectShipTypeName: '',
    })
    
    //校验临时账户
    checkTempCustomer()

    //清空配送地址
    app.globalData.deliveryAddressSysNo = 0

    storeSysNo = 0
    addressSysNo = 0

    firstRequest = 1
    confirmShipType = 0
    formId = null

    isSelectAddress = false
    deliveryAddressSysNo = 0
    selectCouponCode = null
    isSelectCoupon = false

    isSelectStore = false

    firstLocation = true

    //清空选择门店
    app.globalData.submitSelectStoreInfo = null

    // //初始化提交时间
    // submitTimeObject = new Object()
    // submitTimeObject.lastSubmitTime = null

    isSubimting = false
    isClearAddress = false

    initPtSettlement()
    /*
    if(app.globalData.storeInfo != null)
    {
      initPtSettlement()
    }
    else
    {
      //getLocation()
      if (firstLocation) {
        getLocation()
        firstLocation = false
      }
      else {
        getLocationStoreFail()
      }
    }
    */
  },
  onShow:function(){
    //选择地址
    // if(isSelectAddress && app.globalData.deliveryAddressSysNo != 0)
    // {
    //   isSelectAddress = false
    //   deliveryAddressSysNo = app.globalData.deliveryAddressSysNo
    //   checkAddress()
    // }
    /*
    if (app.globalData.refreshuserLocation) {
      if (app.globalData.scopeuserLocation) {
        firstLocation = true
        initPtSettlement()
      }
      else {
        getLocationStoreFail()
      }
      app.globalData.refreshuserLocation = false
      return
    }
    */
    //选择地址
    if (isSelectAddress) {

      if (that.data.PTSettlementInfo.CustomerAddress != null)
      {
        deliveryAddressSysNo = that.data.PTSettlementInfo.CustomerAddress.SysNo
      }

      if (app.globalData.isEditSelectAddress && app.globalData.deliveryAddressSysNo <= 0) {
        app.globalData.deliveryAddressSysNo = deliveryAddressSysNo

      }

      app.globalData.isEditSelectAddress = false

      if (app.globalData.deliveryAddressSysNo != 0) {
        if (app.globalData.deliveryAddressSysNo == deliveryAddressSysNo) {
          isClearAddress = true
        }

        isSelectAddress = false
        deliveryAddressSysNo = app.globalData.deliveryAddressSysNo
        //校验地址
        checkAddress()
      }
    }

    if (isSelectStore) {
      if (app.globalData.submitSelectStoreInfo != null && app.globalData.submitSelectStoreInfo.SysNo != storeSysNo)
      {
        //重新结算
        rePTSettlement()
      }
      
      isSelectStore = false
    }

    if (isSelectCoupon && app.globalData.selectCouponInfo != null) {
      isSelectCoupon = false
      var selectCoupon = app.globalData.selectCouponInfo

      if (selectCoupon != null) {
        selectCouponCode = selectCoupon.CouponCode
        that.setData({
          useCoupon: 1,
        })
      }

      //重新结算
      rePTSettlement()
    }

    //绑定后重新结算
    if (app.globalData.loginphonesuccess)
    {
      app.globalData.loginphonesuccess = false

      //校验临时账户
      checkTempCustomer()
      //重新结算
      rePTSettlement()

    }
  },
  selectShipType: function (e) {
    if (checkSOSysNo()) {
      return
    }


    //var selectShipTypeSysNo = e.currentTarget.dataset.sysno
    var i = e.currentTarget.dataset.index;
    
    var selectShipTypeSysNo = that.data.PTSettlementInfo.ListShipTypes[i].SysNo
    var selectShipTypeName = that.data.PTSettlementInfo.ListShipTypes[i].ShipTypeName

    //配送方式不变
    if (that.data.selectShipTypeSysNo == selectShipTypeSysNo)
    {
      return
    }

    that.setData({
      selectShipTypeSysNo: selectShipTypeSysNo,
      selectShipTypeName:selectShipTypeName
    })

    //重新结算
    rePTSettlement()
  },
  selectaddress:function()
  {
    if(checkSOSysNo())
    {
      return
    }

    selectaddress()
  },
  toSelectStore: function () {

    if(that.data.selectShipTypeSysNo == homeDelivery)
    {
      if (checkSOSysNo()) {
        return
      }

      toSelectStore()
    }
  },
  bindTimeNode: function (e) {
    if (checkSOSysNo()) {
      return
    }

    var index = e.detail.value
    var selectNodeTime = that.data.PTSettlementInfo.ListTimeNodes[index]

    //addressInfo.ProvinceName = provinceName
    that.setData({
      selectNodeTime: selectNodeTime
    })
  },
  receivePhoneInput: function (e) {
    if (checkSOSysNo()) {
      return
    }

    that.setData({
      receivePhone: e.detail.value
    })
  },
  qtyInput:function(e) {
    if(checkSOSysNo())
    {
      return
    }
    var qty = e.detail.value
    changeQty(qty)
  },
  addQty:function()
  {
    if(checkSOSysNo())
    {
      return
    }

    var qty = parseInt (that.data.PTSettlementInfo.Qty) + 1
    changeQty(qty)
  },
  subQty:function()
  {
    if(checkSOSysNo())
    {
      return
    }

    var qty = parseInt (that.data.PTSettlementInfo.Qty) - 1
    changeQty(qty)
  },
  useCouponChange: function () {
    if (checkSOSysNo()) {
      return
    }

    if (that.data.useCoupon == 0) {
      that.setData({
        useCoupon: 1,
      })

      toSelectCoupon()
    }
    else {
      that.setData({
        useCoupon: 0,
      })

      //不使用红包
      selectCouponCode = null

      //重新结算
      rePTSettlement()
    }
  },
  toSelectCoupon: function () {
    if (checkSOSysNo()) {
      return
    }

    toSelectCoupon()
  },
  memoInput:function(e)
  {
    if(checkSOSysNo())
    {
      return
    }

    that.setData({
      memo:e.detail.value
    })
  },
  submit:function(e)
  {
    // //校验重复提交
    // if (!util.checkReSubmit(submitTimeObject)) {
    //   return
    // }
    
    if (isSubimting)
    {
      return
    }

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

      return
    }

    formId = e.detail.formId.toString()
    submit()
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
  bindPhone:function()
  {
    util.toLoginPhone()
  },
  getPhoneNumber: function (e) {
    
    if (checkSOSysNo()) {
      return
    }

    if (e.detail != null) {
      //获取
      if (e.detail.encryptedData
        && e.detail.iv) {
        if (isSubimting) {
          return
        }

        isSubimting = true
        util.getPhoneNumber(e.detail.encryptedData, e.detail.iv, getPhoneNumberSuccess, getPhoneNumberFail)
      }
    }
  },
})

//校验是否临时用户
function checkTempCustomer()
{
  var scrollPaddingTop = 0
  var isTempCustomer = util.isTempCustomer()
  if (isTempCustomer) {
    scrollPaddingTop = scrollPaddingTopValue
  }

  that.setData({
    scrollPaddingTop: scrollPaddingTop,
    isTempCustomer: isTempCustomer,
  })
}

function initPtSettlement()
{
  storeSysNo = app.globalData.storeInfo.SysNo
  addressSysNo = app.globalData.selectAddressSysNo 
  ptSettlement(1)
}

function rePTSettlement()
{
  var qty = 1
  if (that.data.PTSettlementInfo != null)
  {
    qty = that.data.PTSettlementInfo.Qty
  }
  ptSettlement(qty)
}


function ptSettlement(qty)
{
  //ToPTSettlementService?
  var data = {};
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))
  data.StoreSysNo = storeSysNo
  //选择了自提门店
  if (app.globalData.submitSelectStoreInfo != null)
  {
    data.StoreSysNo = app.globalData.submitSelectStoreInfo.SysNo
  }

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.PlanSysNo = planSysNo
  data.SettType = settType
  if(gmsysNo != null)
  {
    data.GMSysNo = gmsysNo
  }

  if(addressSysNo != 0)
  {
    data.AddressSysNo=addressSysNo
  }

  if (selectCouponCode != null && selectCouponCode.length > 0)  {
    data.CouponCode = selectCouponCode
  }

  data.ShipTypeSysNo = that.data.selectShipTypeSysNo

  //时间节点
  if (that.data.selectNodeTime != null) {
    data.TimeNodeSysNo = that.data.selectNodeTime.SysNo
  }

  data.APIVersion = '3.0'
  data.Qty = qty

  util.requestPost('ToPTSettlementService',data,ptSettlementSuccess,ptSettlementFail,null)
} 

function ptSettlementSuccess(res)
{

  if(res.data != null && res.data.Entity != null)
  {
    showPTSettlementInfo(res.data.Entity)

    firstRequest = 0
    return
  }

  if(res.data != null && res.data.ResponseStatus != null)
  {
    var errCode = res.data.ResponseStatus.ErrorCode
    var message = res.data.ResponseStatus.Message

    if (errCode == 303320 && productSysNo != null && productSysNo.length > 0) {
      
      wx.showModal({
        title: '拼团失败',
        content: message,
        showCancel: true,
        cancelText:'取消',
        confirmText:'优惠购买',
        success: function (res) {
          if (res.confirm) {
            addCart()
          }
          else
          {
            wx.navigateBack()
          }

          firstRequest = 0
        }
      })

      return;
    }

    if (that.data.selectShipTypeSysNo == homeDelivery && app.globalData.submitSelectStoreInfo != null && errCode == 303306) {
      message = "很抱歉，" + app.globalData.submitSelectStoreInfo.StoreName + "此商品已售罄，请您选择其他门店自提"
    }

    wx.showModal({
    title: '拼团失败',
    content: message,
    showCancel:false,
    success: function(res) {
      if (res.confirm) {
          //首次请求 返回上一页
          if (firstRequest == 1)
          {
            if (errCode == 303316 || errCode == 303317)
            {
              util.redirectToLoginPhone()
            }
            else
            {
              wx.navigateBack()   
            }     
          }
        }

        firstRequest = 0
      }
    })
  }
  else
  {
    firstRequest = 0
  }


  app.globalData.submitSelectStoreInfo = null
  var info = that.data.PTSettlementInfo

  that.setData({
    PTSettlementInfo: info
  })
}

function showPTSettlementInfo(ptSettlementInfo)
{
  if (!that.data.isTempCustomer) {
    var scrollPaddingTop = 0
    if (ptSettlementInfo.NewsTip != null && ptSettlementInfo.NewsTip.length > 0) {
      scrollPaddingTop = scrollPaddingTopValue
    }
  }

  var selectShipTypeSysNo = that.data.selectShipTypeSysNo
  var selectShipTypeName = that.data.selectShipTypeName

  if (ptSettlementInfo.ListShipTypes != null
    && ptSettlementInfo.ListShipTypes.length > 0) {
    for (var i = 0; i < ptSettlementInfo.ListShipTypes.length; i++) {
      if (ptSettlementInfo.ListShipTypes[i].IsSelected == '1') {
        selectShipTypeSysNo = ptSettlementInfo.ListShipTypes[i].SysNo
        selectShipTypeName = ptSettlementInfo.ListShipTypes[i].ShipTypeName
        break
      }
    }

    //为0时 用第一个
    if (selectShipTypeSysNo == 0)
    {
      selectShipTypeSysNo = ptSettlementInfo.ListShipTypes[0].SysNo
      selectShipTypeName = ptSettlementInfo.ListShipTypes[0].ShipTypeName
    }
  }

 
  //计算配送节点
  var selectNodeTime = null
  if (ptSettlementInfo.ListTimeNodes) {
    if (ptSettlementInfo.TimeNodeSysNo) {
      for (var i = 0; i < ptSettlementInfo.ListTimeNodes.length; i++) {
        if (ptSettlementInfo.ListTimeNodes[i].SysNo.toString() == ptSettlementInfo.TimeNodeSysNo) {
          selectNodeTime = ptSettlementInfo.ListTimeNodes[i]
          break;
        }
      }
    }
  }
 
  if (ptSettlementInfo.CustomerAddress != null) {
    addressSysNo = ptSettlementInfo.CustomerAddress.SysNo
  }

  //计算收货电话
  var receivePhone = null
  if (selectShipTypeSysNo == homeDelivery 
    && !that.data.receivePhone) 
  {
    if (ptSettlementInfo.CustomerUsed != null
      && ptSettlementInfo.CustomerUsed.ReceivePhone)
    {
        receivePhone = ptSettlementInfo.CustomerUsed.ReceivePhone
    }

    if (!receivePhone) {
      receivePhone = app.globalData.customerInfo.Phone
    }
  }
  else {
    receivePhone = that.data.receivePhone
  }

  //计算红包
  var couponCount = 0

  /*
  if (ptSettlementInfo.CardCouponV4 != null) {
    //选中的红包
    if (ptSettlementInfo.CardCoupon.SelectedCoupon != null) {
      selectCouponCode = ptSettlementInfo.CardCoupon.SelectedCoupon.CouponCode
    }

    if (ptSettlementInfo.CardCoupon.ListRedPaper != null && ptSettlementInfo.CardCoupon.ListRedPaper.length > 0) {
      couponCount += ptSettlementInfo.CardCoupon.ListRedPaper.length
    }

    if (ptSettlementInfo.CardCoupon.ListCoupon != null && ptSettlementInfo.CardCoupon.ListCoupon.length > 0) {
      couponCount += ptSettlementInfo.CardCoupon.ListCoupon.length
    }

    if (ptSettlementInfo.CardCoupon.ListPTFree != null && ptSettlementInfo.CardCoupon.ListPTFree.length > 0) {
      couponCount += ptSettlementInfo.CardCoupon.ListPTFree.length
    }
  }*/
  
  //选择自提门店
  if (that.data.selectShipTypeSysNo == homeDelivery && app.globalData.submitSelectStoreInfo != null) {
    //切换门店
    util.changeStore(app.globalData.submitSelectStoreInfo)
    storeSysNo = app.globalData.storeInfo.SysNo
    app.globalData.submitSelectStoreInfo = null
  }

  that.setData({
    PTSettlementInfo: ptSettlementInfo,
    scrollPaddingTop: scrollPaddingTop,
    selectShipTypeSysNo:selectShipTypeSysNo,
    selectShipTypeName: selectShipTypeName,
    receivePhone: receivePhone,
    couponCount: couponCount,
    storeInfo: app.globalData.storeInfo,
    selectNodeTime: selectNodeTime,
    IsReservation: ptSettlementInfo.IsReservation
  })

}


function ptSettlementFail()
{

}

function changeQty(qty)
{

  // if(qty < 0)
  // {
  //   qty = that.data.minQty
  // }

  if(qty < that.data.minQty)
  {
    qty = that.data.minQty
  }

  if(qty > that.data.maxQty)
  {
    qty = that.data.maxQty
  }

  if(qty == that.data.PTSettlementInfo.Qty)
  {
    return
  }

  ptSettlement(qty)
}

function selectaddress()
{
  //清除路由地址
  app.globalData.deliveryAddressSysNo = 0
  isSelectAddress = true
  
  var url = '../group/selectaddress'
  if(that.data.PTSettlementInfo.CustomerAddress != null && that.data.PTSettlementInfo.CustomerAddress.SysNo >0)
  {
    url = url+'?selectAddressSysNo=' + that.data.PTSettlementInfo.CustomerAddress.SysNo
  }

  wx.navigateTo({
    url: url
  })
}

function checkAddress()
{
  var data = {};

  data.StoreSysNo = app.globalData.storeInfo.SysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.AreaSysNo = app.globalData.areaID

  if (deliveryAddressSysNo != 0)
  {
    data.AddressSysNo = deliveryAddressSysNo
  }

  data.ProductSysNo = that.data.PTSettlementInfo.ProductSysNo
  data.Qty = that.data.PTSettlementInfo.Qty
  data.BuyType = appenum.BuyType.PT.Value

  util.requestGet('CheckAddressService',data,checkAddressSuccess,checkAddressFail,null)
} 

function checkAddressSuccess(res)
{
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))

  if(res.data != null && res.data.Entity != null)
  {
     //util.shwoModel('11',JSON.stringify(res.data.Entity));
     if(res.data.Entity.Result)
     {
       isClearAddress = false
       if (storeSysNo != res.data.Entity.StoreSysNo)
       {
         //切换门店
         //app.globalData.changeStore = true
         //app.globalData.storeInfo = res.data.Entity.StoreInfo
         util.changeStore(res.data.Entity.StoreInfo)

         //地标和选中地址
         app.globalData.selectAddress = res.data.Entity.CustomerAddress.Placemarks
         app.globalData.selectAddressSysNo = res.data.Entity.CustomerAddress.SysNo
       }

       storeSysNo = res.data.Entity.StoreSysNo
       addressSysNo = deliveryAddressSysNo

       var info = that.data.PTSettlementInfo
       info.CustomerAddress = res.data.Entity.CustomerAddress
       that.setData({
         PTSettlementInfo: info
       })

        return
     }

     //util.showToast('暂无可服务门店',-1)
     showToastView('暂无可服务门店',-1)
     if (isClearAddress) {
       clearAddress()
       isClearAddress = false
     }
     return
  }

  // util.showModel('提示', res.data.ResponseStatus.Message)
  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1)
  if (isClearAddress) {
    clearAddress()
    isClearAddress = false
  }
}

function clearAddress() {
  var PTSettlementInfo = that.data.PTSettlementInfo
  PTSettlementInfo.CustomerAddress = null
  that.setData({
    PTSettlementInfo: PTSettlementInfo,
  })
}

function checkAddressFail()
{

}

function toSelectStore()
{
  isSelectStore = true
  wx.navigateTo({
    url: '../store/selectdaddress?fromOrderSubmit=1'
  })
}

function toSelectCoupon() {

  /*
  var couponInfo = that.data.PTSettlementInfo.CardCoupon
  if (couponInfo == null) {
    app.globalData.confirmCardCoupon = null
    return
  }

  app.globalData.confirmCardCoupon = couponInfo
  app.globalData.selectCouponInfo = null
  */

  var couponInfo = that.data.PTSettlementInfo.CardCouponV4
  if (couponInfo == null) {
    app.globalData.confirmCardCoupon = null
    return
  }

  app.globalData.confirmCardCoupon = couponInfo
  app.globalData.selectCouponInfo = null

  var url = '../people/couponlist?IsSelectAction=1'
  if (selectCouponCode != null && selectCouponCode.length > 0) {
    url = url + '&SelectCouponCode=' + selectCouponCode
  }

  isSelectCoupon = true

  wx.navigateTo({
    url: url
  })
}


function checkSubmit()
{
  //送货上门
  if (that.data.selectShipTypeSysNo == expressDelivery) {
    if (addressSysNo <= 0) {
      util.showModel('提示', '请选择您的收货地址')
      return false
    }

    if (that.data.selectNodeTime == null) {
      util.showModel('提示', '请选择预计送达时间')
      return false
    }
  }
  

  //到店自提
  if (that.data.selectShipTypeSysNo == homeDelivery) {

    if (that.data.selectNodeTime == null) {
      util.showModel('提示', '请选择自提时间')
      return false
    }

    if (that.data.receivePhone == null || that.data.receivePhone.length <= 0) {
      util.showModel('提示', '请输入您的联系电话')
      return false
    }

    if (that.data.receivePhone.substring(0, 1) == "1" && !util.checkPhone(that.data.receivePhone)) {
      util.showModel('提示', '联系电话错误，请输入正确的联系电话')
      return
    }
  }

  if(that.data.PTSettlementInfo.Qty < that.data.minQty)
  {
    util.showModel('提示','不能小于最小购买数量' + that.data.minQty.toString())
    return false
  }

  if(that.data.PTSettlementInfo.Qty > that.data.maxQty)
  {
    util.showModel('提示','不能大于最大购买数量' + that.data.maxQty.toString())
    return false
  }

  return true
}

function submit()
{

  if(that.data.soSysNo > 0)
  {
    getPayInfo(that.data.soSysNo)
    return
  }

  if(!checkSubmit())
  {
    return
  }

  var data = {};
  data.StoreSysNo = storeSysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.PlanSysNo = planSysNo
  data.SettType = settType
  data.ShipTypeSysNo = that.data.selectShipTypeSysNo

  if(gmsysNo != null)
  {
    data.GMSysNo = gmsysNo
  }

  if (that.data.selectShipTypeSysNo == expressDelivery) {
    if (addressSysNo != 0) {
      data.AddressSysNo = addressSysNo
    }
  }
  
  if (that.data.selectShipTypeSysNo == homeDelivery) {
    //联系电话
    if (that.data.receivePhone != null && that.data.receivePhone.length > 0) {
      data.ReceivePhone = that.data.receivePhone
    }
  }

  //时间节点
  if (that.data.selectNodeTime != null) {
    data.TimeNodeSysNo = that.data.selectNodeTime.SysNo
  }

  data.Qty = that.data.PTSettlementInfo.Qty

  if (selectCouponCode != null && selectCouponCode.length > 0)  {
    data.CouponCode = selectCouponCode
  }

  if(that.data.memo != null && that.data.memo.length >0)
  {
    data.Memo = that.data.memo
  }

  if(formId != null && formId.length >0)
  {
    data.WXFormId  = formId
  }
  
  data.ConfirmShipType = confirmShipType

  data.WXOpenId  = app.globalData.userInfo.openId
  
  isSubimting = true
  util.requestPost('SubmitPTOrderService',data,submitSuccess,submitFail,null)
} 

function submitSuccess(res)
{
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))

  if(res.data != null && res.data.Entity != null)
  {
    //var orderData = res.data.Entity
    app.globalData.refreshOrderList = true
    submitComplete(res.data.Entity)
    isSubimting = false    
    return
  }

  isSubimting = false  

  //配送方式确认
  if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 301722) {
    wx.showModal({
      title: "订单确认",
      content: res.data.ResponseStatus.Message,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          confirmShipType = 1
          submit()
        }
      }
    })
    return
  }

  
  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1)
}

function submitFail()
{
  isSubimting = false  
}

function submitComplete(orderData)
{
  if(orderData == null || orderData.SOSysNo <= 0)
  {
    return
  }
  
  that.setData({
    soSysNo:orderData.SOSysNo,
    submitButtonName:'继续支付',
    inputDisabled:true,
  })

  //tosubmitComplete()
  //getPayInfo(that.data.soSysNo)
  if (orderData.OrderFromStatus == appenum.OrderStatus.WaitingPay.Value) {
    getPayInfo(that.data.soSysNo)
  }
  else {
    tosubmitComplete()
  }
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
        tosubmitComplete()
        util.showToast('支付成功')
      },
    'fail':function(res){
        util.showToast('支付未完成',-1)
      //util.showModel('333',JSON.stringify(res))
      }
    })

    return 
  }

  if(res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 303309)
  {
    wx.showModal({
    title: '拼团失败',
    content: res.data.ResponseStatus.Message,
    showCancel:false,
    success: function(res) {
      if (res.confirm) {
          wx.navigateBack()
        }
      }
    })
    return
  }

  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1)
}

function getPayDataFail()
{

}

function tosubmitComplete()
{
  if(that.data.soSysNo > 0)
  {
    wx.redirectTo({
      url: '../order/gorderdetail?SOSysNo=' + that.data.soSysNo + '&isSubmit=1'
    })
  }
}

function checkSOSysNo()
{
  if(that.data.soSysNo > 0)
  {
    //util.showToast('订单已生成，不能再更改',-1)
    showToastView('订单已生成，不能再更改', -1)
    return true
  }

  return false
}

//***************加入购物车**************//
function addCart() {
  util.addCart(productSysNo, addCartSuccess, addCartFail, null)
}

function addCartSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    app.globalData.ShoppingCartCount = res.data.Entity.ShoppingCartCount

    that.setData({
      ShoppingCartCount: app.globalData.ShoppingCartCount
    })

    addCartSuccessProcess()
    return
  }

  if (res.data != null && res.data.ResponseStatus != null
    && res.data.ResponseStatus.ErrorCode == 301402)
  {
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

function addCartSuccessProcess()
{
  //showToastView('加入购物车成功', 0)
  util.toCart()
}

function addCartFailProcess(message) {
  //showToastView('加入购物车成功', 0)
  if(message == null || message.length == 0)
  {
    wx.navigateBack()
    return
  }

  wx.showModal({
    title: '提示',
    content: message,
    showCancel:false,
    success: function (res) {
      if (res.confirm) {
        wx.navigateBack()
      }
    }
  })
}

//***************加入购物车**************//

//***************获取微信手机号 ************//

function getPhoneNumberSuccess(res) {
  //showToastView('加入购物车成功', 0)
  
  if (res.data != null && res.data.Entity != null) {
   var pInfo = res.data.Entity

    if (pInfo && pInfo.purePhoneNumber)
    {
      that.setData({
        receivePhone: pInfo.purePhoneNumber
      })
    }
  }

  isSubimting = false
}

function getPhoneNumberFail() {
  isSubimting = false;
  showToastView('获取手机号失败', -1) 
}

//***************获取微信手机号 ************//

//*************** 显示Toast ************//
function showToastView(toastMessage, showType = 1)
{
  that.setData({
    isShowToast:true,
    toastMessage: toastMessage,
  })

  setTimeout(hideToastView,2000);
}

function hideToastView() {
  that.setData({
    isShowToast: false,
    toastMessage: '',
  })
}
//*************** 显示Toast ************//

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
    
    initPtSettlement()

    util.setCityInfo()
  }
  else
  {
    getLocationStoreFail()
  }
}

function getGisStoreFail()
{
    //util.toselectAddress()
  getLocationStoreFail()

}

//定位失败等，使用默认门店
function getLocationStoreFail() {

  if (app.globalData.locationFailStoreInfo != null) {
    app.globalData.storeInfo = app.globalData.locationFailStoreInfo

    initPtSettlement()
  }
}
//***************定位及获取门店****************//