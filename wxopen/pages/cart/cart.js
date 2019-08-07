//index.js
//获取应用实例
var app = getApp()
var that;
var windowWidth

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var scrollPaddingTopValue = appconst.scrollPaddingTopValue
var maxQty = appconst.maxQty
var showOpenVip = 0

Page({
  data: {
    cartInfo:null,
    windowWidth:0,
    haveInv:'0',

    isShowToast: false,
    toastMessage: '',

    startX: 0,
    startY: 0,
    tranFeeTips:null,
    cartTips:null,
    scrollPaddingTop:0,
    cartopenvipbg: appconst.CartOpenVipBg,
  },
  onLoad: function (options) {
    console.log('onLoad')

    that = this

    showOpenVip = 0
    var strShowOpenVip = util.getSysDataConfigValue('WXXCXShowOpenVIP')

    if (strShowOpenVip && strShowOpenVip == "1") {
      showOpenVip = 1
    }

    windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowWidth: windowWidth,
      haveInv: appenum.Invstatus.Have.Value.toString(),
    })
  },
  onShow: function () {
    console.log('onShow')
    getCartInfo()

  },
  toHome:function()
  {
    util.toHome()
  },
  showHomeBySpecial: function () {
    util.showHomeBySpecial()
  },
  toProductdetail: function (e) {
    var index = e.currentTarget.dataset.index

    if (!checkProducts(that.data.cartInfo)) {
      return
    }
    
    if (!checkProductsIndex(that.data.cartInfo.Products,index))
    {
      return
    }

    var product = that.data.cartInfo.Products[index]
    
    util.toProductdetail(product.ProductSysNo)
  },
  selectItem: function (e) {
    var index = e.currentTarget.dataset.index

    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    if (!checkProductsIndex(that.data.cartInfo.Products, index)) {
      return
    }

    var product = that.data.cartInfo.Products[index]
    
    selectItem(product, that.data.cartInfo.StoreSysNo)
  },
  subNum: function (e) {
    var index = e.currentTarget.dataset.index

    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    if (!checkProductsIndex(that.data.cartInfo.Products, index)) {
      return
    }

    var product = that.data.cartInfo.Products[index]
    
    subNum(product, that.data.cartInfo.StoreSysNo)
  },
  addNum: function (e) {
    var index = e.currentTarget.dataset.index

    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    if (!checkProductsIndex(that.data.cartInfo.Products, index)) {
      return
    }

    var product = that.data.cartInfo.Products[index]

    addNum(product, that.data.cartInfo.StoreSysNo)
  },
  selectAll: function (e) {
    //var index = e.currentTarget.dataset.index

    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    var cartInfo = that.data.cartInfo
    selectAll(cartInfo)
  },
  settlement: function (e) {
    if (util.isTempCustomer()) {
      util.confirmToLoginPhone(0)
      return
    }

    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    var cartInfo = that.data.cartInfo
    settlement(cartInfo)
  },
  toAboutAPP: function () {
    util.toAboutAPP()
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {

    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    //开始触摸时 重置所有删除
    that.data.cartInfo.Products.forEach(function (v, i)    {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })

    that.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      cartInfo: this.data.cartInfo
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    var index = e.currentTarget.dataset.index,//当前索引
    startX = that.data.startX,//开始X坐标
    startY = that.data.startY,//开始Y坐标
    touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
    touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标

    //获取滑动角度
    angle = that.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY });

    that.data.cartInfo.Products.forEach(function (v, i) 
    {
      v.isTouchMove = false

      //滑动超过30度角 return
      if (Math.abs(angle) > 30) 
      {
        return
      }

      if (i == index) {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })

    //更新数据
    that.setData({
      cartInfo: that.data.cartInfo
    })
  },

  /**
  * 计算滑动角度
  * @param {Object} start 起点坐标
  * @param {Object} end 终点坐标
  */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y

    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },

  //删除事件
  delitem: function (e) {

    var index = e.currentTarget.dataset.index
    if (!checkProducts(that.data.cartInfo)) {
      return
    }

    if (!checkProductsIndex(that.data.cartInfo.Products, index)) 
    {
      return
    }

    var product = that.data.cartInfo.Products[index]
    deleteProduct(product, that.data.cartInfo.StoreSysNo)
  },
})

function getCartInfo()
{

  if (util.isTempCustomer()) {
    //未授权，去登录
    util.confirmToLoginPhone()
    return
  }

  var data = {};
  // if (app.globalData.customerInfo == null ||
  //   app.globalData.customerInfo.CustomerSysNo == 0) {
  //   return
  // }

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  
  // util.requestGet('GetShopCartService', data, getCartInfoSuccess, getCartInfoFail, null)

  util.requestGet('GetShopCartServiceV4', data, getCartInfoSuccess, getCartInfoFail, null)
}

function getCartInfoSuccess(res) {
  //util.showToast(JSON.stringify(res))
  if (res.data != null && res.data.ResponseStatus.ErrorCode == "0") {
    showCartInfo(res.data.Entity)
    return
  }
  
  //util.showToast(res.data.ResponseStatus.Message, -1)
  if (res.data.ResponseStatus.Message)
  {
    showToastView(res.data.ResponseStatus.Message, -1)
  }
}

function showCartInfo(entity)
{
  //var cartInfo = null

  /*
  if (entity != null && entity.ListShopCartInfo != null && entity.ListShopCartInfo.length > 0 && entity.ListShopCartInfo[0].StoreType == '1') {
    cartInfo = entity.ListShopCartInfo[0]
    //计算全选
    calSelectAll(cartInfo)
    //设置滑动标记
    setTouchMove()

    app.globalData.ShoppingCartCount = entity.ProductCount//cartInfo.Products.length
  }
  else{
    app.globalData.ShoppingCartCount = 0 
  }

  util.showTabBarCartCount()

  that.setData({
    cartInfo: cartInfo
  })
  */

  if (entity != null) 
  {
    var cartInfo = entity;
    cartInfo.Products = new Array()

    if (entity.OnSaleList)
    {
      for (var i = 0; i < entity.OnSaleList.length;i++)
      {
        cartInfo.Products.push(entity.OnSaleList[i])   
      }
    }

    if (entity.SaleOutList) {
      for (var i = 0; i < entity.SaleOutList.length; i++) {
        cartInfo.Products.push(entity.SaleOutList[i])
      }
    }

    cartInfo.OnSaleList = null
    cartInfo.SaleOutList = null
    cartInfo.HuanGouList = null

    var cartTips = null;
    var scrollPaddingTop = 0
    if (showOpenVip == 1 && cartInfo.CartVIPInfo && cartInfo.CartVIPInfo.CartVIPTipsCStr)
    {
      cartTips = cartInfo.CartVIPInfo.CartVIPTipsCStr
      scrollPaddingTop = scrollPaddingTopValue
    }

    var tranFeeTips = null
    if (cartInfo.TransFeeStatus == 1)
    {
      tranFeeTips='已包邮'
    }
    else if (cartInfo.TransFeeStatus == 2)
    {
      tranFeeTips = cartInfo.TransFeeDesc+'，您还差'+ cartInfo.TransFeeLeftAmt + '元'
    } else if (cartInfo.TransFeeStatus == 3) {
      tranFeeTips = '未登录'
    }

    //计算全选
    calSelectAll(cartInfo)
    //设置滑动标记
    setTouchMove()

    app.globalData.ShoppingCartCount = entity.ProductCount//cartInfo.Products.length

    //cartInfo = entity
    //计算全选
    calSelectAll(cartInfo)
    //设置滑动标记
    setTouchMove()

    app.globalData.ShoppingCartCount = entity.ShoppingCartCount//cartInfo.Products.length
  }
  else {
    app.globalData.ShoppingCartCount = 0
  }

  util.showTabBarCartCount()

  that.setData({
    cartInfo: cartInfo,
    cartTips: cartTips,
    scrollPaddingTop: scrollPaddingTop,
    tranFeeTips: tranFeeTips,
  })
}

function getCartInfoFail() {

}

function setTouchMove(cartInfo) {
  if (!checkProducts(cartInfo)) {
    return
  }

  for (var i = 0; i < cartInfo.Products.length; i++) {
    cartInfo.Products[i].isTouchMove = true
  }
}

function calSelectAll(cartInfo)
{
  if (!checkProducts(cartInfo))
  {
    return
  }

  var isSelectAll = true

  for (var i = 0; i < cartInfo.Products.length; i++) 
  {
    var product = cartInfo.Products[i]
    if (product != null && product.ShoppingCartTypeId != 1)
    {
      isSelectAll = false
      break;
    }
  }

  cartInfo.IsSelectAll = isSelectAll
}

function checkProducts(cartInfo)
{
  if (cartInfo == null || cartInfo.Products == null || cartInfo.Products.length == 0) {
    return false
  }

  return true
}

function checkProductsIndex(products,index) {
  if (products.length <= index || products[index] == null) {
    return false
  }

  return true
}

function selectAll(cartInfo)
{
  var data = {};
  
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.InvStoreSysNo = cartInfo.StoreSysNo
  
  data.ShoppingCartTypeId = cartInfo.IsSelectAll?0:1

  //util.requestPost('UpdateAllCheckNewService', data, getCartInfoSuccess, getCartInfoFail, null)

  util.requestPost('CheckAllCartServiceV4', data, getCartInfoSuccess, getCartInfoFail, null)
  
}

function selectItem(product, invStoreSysNo) {
  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.InvStoreSysNo = invStoreSysNo
  data.SysNo = product.SysNo
  data.Num = product.Num

  data.ShoppingCartTypeId = product.ShoppingCartTypeId == 1 ? 0 : 1

  // util.requestPost('UpdateCheckCartNewService', data, getCartInfoSuccess, getCartInfoFail, null)
  util.requestPost('CheckCartServiceV4', data, getCartInfoSuccess, getCartInfoFail, null)

}

function subNum(product, invStoreSysNo) {

  var num = product.Num - product.IncrementQty
  if(num <= 0){
    /*
    wx.showModal({
      title: '删除确认',
      content: '您确认需要删除该商品？',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          changeNum(product, 0, invStoreSysNo)
        }
      }
    })*/

    deleteProduct(product, invStoreSysNo)
  }
  else{
    changeNum(product, num, invStoreSysNo)
  }
}

function addNum(product, invStoreSysNo) {
  var num = product.Num + product.IncrementQty
  if (num > maxQty)
  {
    //util.showToast('超过最大限购数' + maxQty, -1)
    showToastView('超过最大限购数' + maxQty, -1)
    return
  }

  changeNum(product, num, invStoreSysNo)
}

function deleteProduct(product, invStoreSysNo)
{
  wx.showModal({
    title: '删除确认',
    content: '您确认需要删除该商品？',
    showCancel: true,
    success: function (res) {
      if (res.confirm) {
        changeNum(product, 0, invStoreSysNo)
      }
    }
  })
}

function changeNum(product, num, invStoreSysNo) {
  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.InvStoreSysNo = invStoreSysNo
  data.SysNo = product.SysNo
  data.ProductSysNo = product.ProductSysNo
  data.Num = num

  // util.requestPost('UpdateShopCartService', data, getCartInfoSuccess, getCartInfoFail, null)

  util.requestPost('UpdateShopCartServiceV4', data, getCartInfoSuccess, getCartInfoFail, null)

}

function settlement(cartInfo)
{
  var shopCartSysNos = getSelectSysNo(cartInfo)
  if (shopCartSysNos == null || shopCartSysNos.length <= 0)
  {
    //util.showToast('请选择购物车商品',-1)
    showToastView('请选择购物车商品', -1)
    return
  }

  var url = '../cart/orderconfirm?ShopCartSysNos=' + shopCartSysNos + '&InvStoreSysNo=' + cartInfo.StoreSysNo

  wx.navigateTo({
    url: url,
  })
}


function getSelectSysNo(cartInfo) {
  var shopCartSysNos = ''

  for (var i = 0; i < cartInfo.Products.length; i++) {
    var product = cartInfo.Products[i]
    if (product != null && product.ShoppingCartTypeId == 1) {
      shopCartSysNos += product.SysNo + ','
    }
  }

  if (shopCartSysNos.length > 1)
  {
    shopCartSysNos = shopCartSysNos.substring(0, shopCartSysNos.length -1)
  }
  return shopCartSysNos
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