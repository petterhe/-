var app = getApp()
var that;

var windowHeight
var windowWidth
var shopCartSysNos
var invStoreSysNo

var expressDelivery = 1
var homeDelivery = 2

var isSelectAddress = false
var isSelectCoupon = false
//var selectCoupon = null

//参数
var selectAddressSysNo = 0
var selectPayTypeSysNo = 4
var selectCouponCode = null
var storeSysNo = 0

var firstRequest = 1

var formId = null

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var scrollPaddingTopValue = appconst.scrollPaddingTopValue

// //提交时间对象
// var submitTimeObject
var isSubimting

var isClearAddress = false//是否能清空地址

var confirmShipType
var confirmDeliveryDate
var showOpenVip
var isSelectStore

// pages/cart/orderconfirm.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: windowHeight,
    windowWidth: windowWidth,
    confirmInfo:null,

    selectShipTypeSysNo:0,
    selectNodeTime:null,

    showNodeTime:false,
    waitSelectNodeIndx:0,

    selectNodeIndx:0,
    selectNodeValue:[0],

    receivePhone:null,
    storeInfo:null,

    couponCount:0,//几张红包可用
    useCoupon:1,//使用红包 默认非选中不使用
    
    memo:null,

    inputDisabled:false,
    ExpressDelivery:1,
    HomeDelivery:2,

    soSysNo:0,//已生成订单
    submitButtonName:'立即支付',

    scrollPaddingTop: 0,
    cartopenvipbg: appconst.CartOpenVipBg,
    isTempCustomer: false,

    isShowToast: false,
    toastMessage: '',

    isIpx: app.globalData.isIpx ? true : false
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    if (options.ShopCartSysNos == undefined) {
      shopCartSysNos = null;
    }
    else {
      shopCartSysNos = options.ShopCartSysNos
    }

    if (options.InvStoreSysNo == undefined) {
      invStoreSysNo = null;
    }
    else {
      invStoreSysNo = options.InvStoreSysNo
    }

    //购物车未选中或者无库存门店
    if (shopCartSysNos == null || invStoreSysNo == null) 
    {
      wx.navigateBack()
      return
    }

    if (app.globalData.customerInfo == null ||
      app.globalData.customerInfo.CustomerSysNo == 0)
      {
        wx.navigateBack()
        return
      }

    showOpenVip = 0
    var strShowOpenVip = util.getSysDataConfigValue('WXXCXShowOpenVIP')

    if (strShowOpenVip && strShowOpenVip == "1") {
      showOpenVip = 1
    }

    that = this

    windowHeight = app.globalData.systemInfo.windowHeight
    windowWidth = app.globalData.systemInfo.windowWidth

    expressDelivery = appenum.ShipType.ExpressDelivery.Value
    homeDelivery = appenum.ShipType.HomeDelivery.Value

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      ExpressDelivery: expressDelivery,
      HomeDelivery: homeDelivery,
      storeInfo: app.globalData.storeInfo,
    })

    //清空配送地址
    app.globalData.deliveryAddressSysNo = 0

    //默认请求参数
    selectPayTypeSysNo = appenum.PayType.weixin.Value
    selectAddressSysNo = app.globalData.selectAddressSysNo
    storeSysNo = app.globalData.storeInfo.SysNo

    selectCouponCode = null
    isSelectCoupon = false
    isSelectAddress = false
    isSelectStore = false

    formId = null
    firstRequest = 1

    // //初始化提交时间
    // submitTimeObject = new Object()
    // submitTimeObject.lastSubmitTime = null
    isSubimting = false

    isClearAddress = false

    confirmShipType = 0
    confirmDeliveryDate = 0

    settlement()
  },
  onShow: function () {

    //选择地址
    if (isSelectAddress) 
    {
      if (that.data.confirmInfo.Customer_Address != null) {
        selectAddressSysNo = that.data.confirmInfo.Customer_Address.SysNo
      }

      if (app.globalData.isEditSelectAddress && app.globalData.deliveryAddressSysNo <= 0)
      {
        app.globalData.deliveryAddressSysNo = selectAddressSysNo
        
      }

      app.globalData.isEditSelectAddress = false

      if (app.globalData.deliveryAddressSysNo != 0)
      {
        if (app.globalData.deliveryAddressSysNo == selectAddressSysNo)
        {
          isClearAddress = true
        }

        isSelectAddress = false
        selectAddressSysNo = app.globalData.deliveryAddressSysNo
        //校验地址
        checkAddress()
      }
    }

    if (isSelectStore) {
      if (app.globalData.submitSelectStoreInfo != null && app.globalData.submitSelectStoreInfo.SysNo != storeSysNo) {
        //重新结算
        settlement()
      }

      isSelectStore = false
    }

    if (isSelectCoupon && app.globalData.selectCouponInfo != null)
    {
      isSelectCoupon = false
      var selectCoupon = app.globalData.selectCouponInfo
      
      if (selectCoupon != null)
      {
        selectCouponCode = selectCoupon.CouponCode
        that.setData({
          useCoupon: 1,
        })
      }

      //重新结算
      settlement()
      //checkAddress()
    }

    //绑定后重新结算
    if (app.globalData.loginphonesuccess) 
    {
      app.globalData.loginphonesuccess = false

      settlement()
    }
  },
  toAboutAPP: function () {
    util.toAboutAPP()
  },
  selectShipType:function(e)
  {
    if (checkSOSysNo()) {
      return
    }
    var selectShipTypeSysNo = e.currentTarget.dataset.sysno
    that.setData({
      selectShipTypeSysNo:selectShipTypeSysNo
    })

    //重新调结算
    settlement()
  },
  receivePhoneInput: function (e) {
    if(checkSOSysNo()) {
      return
    }

    that.setData({
      receivePhone: e.detail.value
    })
  },
  memoInput: function (e) {
    if (checkSOSysNo()) {
      return
    }

    that.setData({
      memo: e.detail.value
    })
  },
  selectaddress: function () {
    if (checkSOSysNo()) {
      return
    }

    toSelectAddress()
  },
  toSelectStore: function () {

    if (that.data.selectShipTypeSysNo == homeDelivery) {
      if (checkSOSysNo()) {
        return
      }

      toSelectStore()
    }
  },
  showSelectTimeNode:function(e) {
    if (checkSOSysNo()) {
      return
    }

    that.setData({
      showNodeTime: true
    })
  },
  bindTimeNode: function (e) {
    if (checkSOSysNo()) {
      return
    }

    var index = e.detail.value
    that.setData({
      waitSelectNodeIndx: index
    })
    /*
    var index = e.detail.value
    var selectNodeTime = that.data.confirmInfo.ListTimeNodes[index]

    //addressInfo.ProvinceName = provinceName
    that.setData({
      selectNodeTime: selectNodeTime
    })*/
  },
  selectTimeNodeOK: function (e) {
    if (checkSOSysNo()) {
      return
    }

    var index = that.data.waitSelectNodeIndx

    var selectNodeTime = that.data.confirmInfo.ListTimeNodes[index]

    var selectNodeValue = new Array()
    selectNodeValue.push(index)
    
    that.setData({
      selectNodeTime: selectNodeTime,
      selectNodeValue: selectNodeValue,
      selectNodeIndx: index,
      showNodeTime:false,
      
    })
  },
  selectTimeNodeCancel: function (e) {
    if (checkSOSysNo()) {
      return
    }

    that.setData({
      showNodeTime: false,
      waitSelectNodeIndx: that.data.selectNodeIndx
    })
  },
  useCouponChange:function () {
    if (checkSOSysNo()) {
      return
    }

    if (that.data.useCoupon == 0)
    {
      that.setData({
        useCoupon:1,
      })

      toSelectCoupon()
    }
    else
    {
      that.setData({
        useCoupon: 0,
      })

      //不使用红包
      selectCouponCode = null
      
      //重新结算
      settlement()
    }
  },
  showTipsInfo: function () {

    if (that.data.confirmInfo.LabelTextInfo.TipsInfo)
    {
      if (checkSOSysNo()) {
        return
      }

      util.showTipsPage(that.data.confirmInfo.LabelTextInfo.TipsInfo)
    }
  },
  toSelectCoupon: function () {
    if (checkSOSysNo()) {
      return
    }

    toSelectCoupon()
  },
  submit: function (e) {
    // //校验重复提交
    // if (!util.checkReSubmit(submitTimeObject)) {
    //   return
    // }
    if (isSubimting)
    {
      return
    }

    formId = e.detail.formId.toString();

    confirmShipType = 0
    confirmDeliveryDate = 0

    submit()
  },
  bindPhone: function () {
    util.toLoginPhone()
  }
})

/*
//校验是否临时用户
function checkTempCustomer() {
  var scrollPaddingTop = 0
  var isTempCustomer = util.isTempCustomer()
  if (isTempCustomer) {
    scrollPaddingTop = scrollPaddingTopValue
  }

  that.setData({
    scrollPaddingTop: scrollPaddingTop,
    isTempCustomer: isTempCustomer,
  })
}*/

function settlement()
{
  //校验临时账户
  if (util.isTempCustomer()) {
    util.confirmToLoginPhone(0)
    return
  }

  app.globalData.confirmCardCoupon = null

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.StoreSysNo = storeSysNo
  data.InvStoreSysNo = invStoreSysNo

  data.ShopCartSysNos = shopCartSysNos
  data.APIVersion='3.0'

  if (that.data.selectShipTypeSysNo > 0) {
    data.ShipTypeSysNo = that.data.selectShipTypeSysNo
  }

  data.PayTypeSysNo = selectPayTypeSysNo


  if (selectAddressSysNo > 0)
  {
    data.AreaSysNo = selectAddressSysNo
    data.AddressSysNo = selectAddressSysNo
  }

  if (that.data.selectShipTypeSysNo == homeDelivery  && app.globalData.submitSelectStoreInfo != null) {
    data.StoreSysNo = app.globalData.submitSelectStoreInfo.SysNo
    data.InvStoreSysNo = app.globalData.submitSelectStoreInfo.SysNo
  }

  if (selectCouponCode != null && selectCouponCode.length > 0)
  {
    data.CouponCode = selectCouponCode
  }
  
  util.requestGet('settlementservice', data, settlementSuccess, settlementFail, null)

}

function settlementSuccess(res) {
  //util.showToast(JSON.stringify(res))
  if (res.data != null && res.data.Entity != null) {

    //showCartInfo(res.data.Entity)
    showConfirmData(res.data.Entity)
    firstRequest = 0
    return
  }

  var message='获取结算信息失败'
  if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.Message != null && res.data.ResponseStatus.Message.length > 0) {
    
    message = res.data.ResponseStatus.Message
    //return
  }

  wx.showModal({
    title: '结算失败',
    content: message,
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        //首次请求 返回上一页
        if (firstRequest == 1) {
          wx.navigateBack()
        }

        firstRequest = 0
      }
    }
  })
}

function settlementFail()
{

}

//校验地址
function checkAddress() {
  var data = {};
  
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  data.StoreSysNo = storeSysNo
  data.AreaSysNo = app.globalData.areaID

  if (selectAddressSysNo != 0) {
    data.AddressSysNo = selectAddressSysNo
  }

  data.BuyType = appenum.BuyType.ShoppingCart.Value

  util.requestGet('CheckAddressService', data, checkAddressSuccess, checkAddressFail, null)
}

function checkAddressSuccess(res) {

  if (res.data != null && res.data.Entity != null) {
    if (res.data.Entity.Result) {

      isClearAddress = false
      
      //门店未改变
      if (storeSysNo == res.data.Entity.StoreSysNo)
      {
    
        //无异常 替换地址
        if (res.data.Entity.ErrorInfo == null)
        {
          var confirmInfo = that.data.confirmInfo
          confirmInfo.Customer_Address = res.data.Entity.CustomerAddress

          that.setData({
            confirmInfo: confirmInfo
          })

          return
        }

        //异常处理
        if (res.data.Entity.ErrorInfo != null) {

          var errorInfo = res.data.Entity.ErrorInfo

          if (errorInfo.ErrorCount > 0 && errorInfo.CustMsg != null && errorInfo.CustMsg.length > 0) {
            //弹窗提醒
            if (errorInfo.ErrHandleType == appenum.ErrHandleType.PopupShow.Value.toString()) {
              wx.showModal({
                title: '提示',
                content: errorInfo.CustMsg,
                showCancel: false,
              })
            }

            //弹窗后继续执行
            if (errorInfo.ErrHandleType == appenum.ErrHandleType.ConfrimNext.Value.toString()) {
              wx.showModal({
                title: '提示',
                content: errorInfo.CustMsg,
                showCancel: false,
              })
            }

            //弹窗调转 返回购物车重新结算
            if (errorInfo.ErrHandleType == appenum.ErrHandleType.PopupSkipTurn.Value.toString()) {
              wx.showModal({
                title: '提示',
                content: errorInfo.CustMsg,
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack()
                  }
                }
              })

              return
            }
          }

        }
      }

      //门店改变 重新结算
      if (storeSysNo != res.data.Entity.StoreSysNo) {

        //无异常 替换地址
        if (res.data.Entity.ErrorInfo == null) {

          //切换门店
          //app.globalData.changeStore = true
          //app.globalData.storeInfo = res.data.Entity.StoreInfo
          util.changeStore(res.data.Entity.StoreInfo)
          
          //地标和选中地址
          app.globalData.selectAddress = res.data.Entity.CustomerAddress.Placemarks
          app.globalData.selectAddressSysNo = res.data.Entity.CustomerAddress.SysNo

          storeSysNo = res.data.Entity.StoreSysNo
          selectAddressSysNo = res.data.Entity.CustomerAddress.SysNo

          //重新结算
          settlement()
          return
        }
        
        //异常处理
        if (res.data.Entity.ErrorInfo != null) 
        {
          var errorInfo = res.data.Entity.ErrorInfo

          if (errorInfo.ErrorCount > 0 && errorInfo.CustMsg != null && errorInfo.CustMsg.length > 0) {
            //弹窗提醒
            if (errorInfo.ErrHandleType == appenum.ErrHandleType.PopupShow.Value.toString()) {
              wx.showModal({
                title: '提示',
                content: errorInfo.CustMsg,
                showCancel: false,
              })
            }

            //弹窗后继续执行
            if (errorInfo.ErrHandleType == appenum.ErrHandleType.ConfrimNext.Value.toString()) {
              wx.showModal({
                title: '提示',
                content: errorInfo.CustMsg,
                showCancel: false,
              })
            }

            //弹窗调转 返回购物车重新结算
            if (errorInfo.ErrHandleType == appenum.ErrHandleType.PopupSkipTurn.Value.toString()) {
              wx.showModal({
                title: '提示',
                content: errorInfo.CustMsg,
                showCancel: false,
                success: function (result) {
                  if (result.confirm) {

                    //切换门店
                    //app.globalData.changeStore = true
                    //app.globalData.storeInfo = res.data.Entity.StoreInfo
                    util.changeStore(res.data.Entity.StoreInfo)

                    //地标和选中地址
                    app.globalData.selectAddress = res.data.Entity.CustomerAddress.Placemarks
                    app.globalData.selectAddressSysNo = res.data.Entity.CustomerAddress.SysNo

                    wx.navigateBack()
                  }
                }
              })
            }

            return
          }
        }

      }
      
      return
    }

    //util.showToast('暂无可服务门店', -1)
    showToastView('暂无可服务门店', -1)
    if (isClearAddress)
    {
      clearAddress()
      isClearAddress = false
    }
    return
  }

  // util.showModel('提示', res.data.ResponseStatus.Message)
  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1)
  if (isClearAddress) {
    clearAddress()
    isClearAddress = false
  }
}

function checkAddressFail() {

}

function clearAddress()
{
  var confirmInfo = that.data.confirmInfo
  confirmInfo.Customer_Address = null
  that.setData({
    confirmInfo: confirmInfo,
  })
}

function showConfirmData(confirmInfo)
{

  // if (!that.data.isTempCustomer) {
  //   var scrollPaddingTop = 0
  //   if (confirmInfo.NewsTip != null && confirmInfo.NewsTip.length > 0) {
  //     scrollPaddingTop = scrollPaddingTopValue
  //   }
  // }

  //计算配送方式
  var selectShipTypeSysNo = 0
  if (confirmInfo.ListShipTypes) {
    for (var i = 0; i < confirmInfo.ListShipTypes.length;i++)
    {
      if (confirmInfo.ListShipTypes[i].IsSelected =='1')
      {
        selectShipTypeSysNo = confirmInfo.ListShipTypes[i].SysNo
        break
      }
    }

    // if (selectShipTypeSysNo == 0)
    // {
    //   selectShipTypeSysNo = confirmInfo.ListShipTypes[0].SysNo
    // }
  }

  //计算收货
  if (confirmInfo.Customer_Address != null)
  {
    selectAddressSysNo = confirmInfo.Customer_Address.SysNo
  }

  //计算配送节点
  /*
  var selectNodeTime = null
  if (confirmInfo.ListTimeNodes != null && confirmInfo.ListTimeNodes.length > 0)
  {
    selectNodeTime = confirmInfo.ListTimeNodes[0]
  }*/

  //计算配送节点
  var selectNodeTime = that.data.selectNodeTime //null
  if (confirmInfo.ListTimeNodes) {

    if (confirmInfo.LessTransport == 0) {
      if (confirmInfo.TimeNodeSysNo) {
        for (var i = 0; i < confirmInfo.ListTimeNodes.length; i++) {
          if (confirmInfo.ListTimeNodes[i].SysNo.toString() == confirmInfo.TimeNodeSysNo) {
            selectNodeTime = confirmInfo.ListTimeNodes[i]
            break;
          }
        }
      }
      // else {
      //   selectNodeTime = confirmInfo.ListTimeNodes[0]
      // }
    }
  }

  //计算收货电话
  var receivePhone = null
  if (confirmInfo.CustomerUsed != null
    && confirmInfo.CustomerUsed.ReceivePhone != null
    && confirmInfo.CustomerUsed.ReceivePhone.length > 0) {
    receivePhone = confirmInfo.CustomerUsed.ReceivePhone
  }

  if (receivePhone == null || receivePhone.length > 0)
  {
    receivePhone = app.globalData.customerInfo.Phone
  }

  //计算红包
  var couponCount = 0
  
  /*
  if (confirmInfo.CardCoupon != null)
  {
    //选中的红包
    if (confirmInfo.CardCoupon.SelectedCoupon != null)
    {
      selectCouponCode = confirmInfo.CardCoupon.SelectedCoupon.CouponCode
    }

    if (confirmInfo.CardCoupon.ListRedPaper != null && confirmInfo.CardCoupon.ListRedPaper.length > 0)
    {
      couponCount += confirmInfo.CardCoupon.ListRedPaper.length
    }

    if (confirmInfo.CardCoupon.ListCoupon != null && confirmInfo.CardCoupon.ListCoupon.length > 0) {
      couponCount += confirmInfo.CardCoupon.ListCoupon.length
    }
  }*/

  var scrollPaddingTop = 0
  if (showOpenVip == 1 && confirmInfo.VIPDiscountAmt && confirmInfo.VIPDiscountAmt > 0) {
    scrollPaddingTop = scrollPaddingTopValue
  }

  //选择自提门店
  if (that.data.selectShipTypeSysNo == homeDelivery && app.globalData.submitSelectStoreInfo != null) {
    //切换门店
    util.changeStore(app.globalData.submitSelectStoreInfo)
    storeSysNo = app.globalData.storeInfo.SysNo
    app.globalData.submitSelectStoreInfo = null
  }

  that.setData({
    scrollPaddingTop: scrollPaddingTop,
    confirmInfo: confirmInfo,
    selectShipTypeSysNo: selectShipTypeSysNo,
    selectNodeTime: selectNodeTime,
    receivePhone: receivePhone,
    couponCount: couponCount,
    storeInfo: app.globalData.storeInfo,
  })
}

// function getTranFee(addressInfo) {

// }

// function calOrderAmt(confirmInfo, couponAmt, transFee)
// {
//   confirmInfo.couponAmt = couponAmt
//   confirmInfo.TransFee = transFee


//   confirmInfo.totalAmt = confirmInfo.ProductTotalPrice

//   if (confirmInfo.couponAmt != null && confirmInfo.couponAmt > 0) {
//     confirmInfo.totalAmt -= confirmInfo.couponAmt
//     if (confirmInfo.totalAmt < 0)
//     {
//       confirmInfo.totalAmt = 0
//     }
//   }

//   if (confirmInfo.TransFee != null && confirmInfo.TransFee > 0)
//   {
//     confirmInfo.totalAmt += confirmInfo.TransFee
//   }
// }

function toSelectStore() {
  isSelectStore = true
  wx.navigateTo({
    url: '../store/selectdaddress?fromOrderSubmit=1'
  })
}

function toSelectAddress() {

  //清除路由地址
  app.globalData.deliveryAddressSysNo = 0
  isSelectAddress = true

  var url = '../group/selectaddress'
  if (that.data.confirmInfo.Customer_Address != null && that.data.confirmInfo.Customer_Address.SysNo > 0) {
    url = url + '?selectAddressSysNo=' + that.data.confirmInfo.Customer_Address.SysNo
  }

  wx.navigateTo({
    url: url
  })
}

function toSelectCoupon()
{

  //UsedList

  var couponInfo = that.data.confirmInfo.CardCouponV4
  if(couponInfo == null)
  {
    app.globalData.confirmCardCoupon = null
    return
  }

  app.globalData.confirmCardCoupon = couponInfo
  app.globalData.selectCouponInfo = null

  var url = '../people/couponlist?IsSelectAction=1'
  if(selectCouponCode != null && selectCouponCode.length > 0)
  {
    url = url +'&SelectCouponCode=' + selectCouponCode
  }

  isSelectCoupon = true

  wx.navigateTo({
    url: url
  })
}

//结算
function checkSubmit() {
  if (that.data.selectShipTypeSysNo <= 0) {
    util.showModel('提示', '请选择配送方式')
    return false
  }

  //送货上门
  if (that.data.selectShipTypeSysNo == expressDelivery)
  {
    if (selectAddressSysNo <= 0) {
      util.showModel('提示', '请选择您的收货地址')
      return false
    }

    if (that.data.selectNodeTime == null)
    {
      util.showModel('提示', '请选择预计送达时间')
      return false
    }
  }

  //到店自提
  if (that.data.selectShipTypeSysNo == homeDelivery) {
    if (that.data.receivePhone == null || that.data.receivePhone.length <= 0) {
      util.showModel('提示', '请输入您的联系电话')
      return false
    }

    if (that.data.receivePhone.substring(0, 1) == "1" && !util.checkPhone(that.data.receivePhone)) {
      util.showModel('提示', '联系电话错误，请输入正确的联系电话')
      return false
    }
  }

  if (that.data.selectNodeTime == null) {
    util.showModel('提示', '请选择自提时间')
    return false
  }

  return true
}

//结算
function submit() {

  if (that.data.soSysNo > 0) {
    getPayInfo(that.data.soSysNo)
    return
  }

  if (!checkSubmit()) {
    return
  }

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  data.StoreSysNo = storeSysNo
  data.InvStoreSysNo = invStoreSysNo
  data.ShopCartSysNos = shopCartSysNos
  data.ShipTypeSysno = that.data.selectShipTypeSysNo
  data.PayTypeSysno = selectPayTypeSysNo

  //联系电话
  if (that.data.receivePhone != null && that.data.receivePhone.length > 0) {
    data.ReceivePhone = that.data.receivePhone
  }

  //收货地址
  if (selectAddressSysNo > 0) {
    data.AreaSysNo = selectAddressSysNo
  }

  //优惠券
  if(selectCouponCode != null && selectCouponCode.length >0)
  {
    data.CouponCode = selectCouponCode
  }  
  
  //时间节点
  if (that.data.selectNodeTime != null) {
    data.TimeNodeSysNo = that.data.selectNodeTime.SysNo
  }

  if (that.data.memo != null && that.data.memo.length > 0) {
    data.Note = that.data.memo
  }

  //是否强制提交 配送方式
  data.ConfirmShipType = confirmShipType

  //是否强制提交 配送时间
  data.ConfirmDeliveryDate = confirmDeliveryDate

  if (formId != null && formId.length > 0) {
    data.WXFormId = formId
  }

  data.WXOpenId = app.globalData.userInfo.openId

  isSubimting = true
  util.requestPost('submitorderservice', data, submitSuccess, submitFail, null)
}

function submitSuccess(res) {
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))

  if (res.data != null && res.data.Entity != null) {
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

  //配送时间确认
  if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 301736) {
    wx.showModal({
      title: "订单确认",
      content: res.data.ResponseStatus.Message,
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          confirmDeliveryDate = 1
          submit()
        }
      }
    })
    return
  }
 
  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1)
}

function submitFail() {
  isSubimting = false
}

function submitComplete(orderData) {
  if (orderData == null || orderData.SOSysNo <= 0) {
    return
  }

  that.setData({
    soSysNo: orderData.SOSysNo,
    submitButtonName: '继续支付',
    inputDisabled: true,
  })

  if (orderData.OrderFromStatus == appenum.OrderStatus.WaitingPay.Value)
  {
    getPayInfo(that.data.soSysNo)
  }
  else
  {
    tosubmitComplete()
  }
}

function getPayInfo(soSysNo) {
  var data = {};
  data.OrderSysNo = soSysNo
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.WXOpenId = app.globalData.userInfo.openId

  util.requestGet(appconst.GetWXOpenPayParamsService, data, getPayDataSuccess, getPayDataFail, null)

}

function getPayDataSuccess(res) {
  if (res.data != null && res.data.Entity != null) {
    //util.showModel('111',JSON.stringify(res.data))
    wx.requestPayment({
      'timeStamp': res.data.Entity.timeStamp,
      'nonceStr': res.data.Entity.nonceStr,
      'package': res.data.Entity.packageValue,
      'signType': 'MD5',
      'paySign': res.data.Entity.sign,
      'success': function (res) {
        tosubmitComplete()
        util.showToast('支付成功')
      },
      'fail': function (res) {
        util.showToast('支付未完成', -1)
        //util.showModel('333',JSON.stringify(res))
      }
    })

    return
  }

  // if (res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 303309) {
  //   wx.showModal({
  //     title: '拼团失败',
  //     content: res.data.ResponseStatus.Message,
  //     showCancel: false,
  //     success: function (res) {
  //       if (res.confirm) {
  //         wx.navigateBack()
  //       }
  //     }
  //   })
  //   return
  // }

  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1)
}

function getPayDataFail() {

}

function tosubmitComplete() {
  // if (that.data.soSysNo > 0) {
  //   wx.redirectTo({
  //     url: '../order/gorderdetail?SOSysNo=' + that.data.soSysNo + '&isSubmit=1'
  //   })
  // }
  util.toOrderlist()
}


function checkSOSysNo() {
  if (that.data.soSysNo > 0) {
    //util.showToast('订单已生成，不能再更改', -1)
    showToastView('订单已生成，不能再更改', -1)
    return true
  }

  return false
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

