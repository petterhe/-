// pages/people/couponlist.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var scrollPaddingTopValue = appconst.scrollPaddingTopValue


var isSelectAction = 0
// var selectType = 0
// var selectPostion = 0
var selectCouponCode = null
var firstLocation

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardCouponInfo: null,
    scrollPaddingTop:0,
    windowHeight: 0,
    windowWidth: 0,
    isSelectAction: 0,
    // selectType: 0,
    // selectPostion: 0,
    selectCouponCode:null,
    showReloadView: false,

    dataEmpty:false,
    selectTabIndex:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad')

    isSelectAction = 0
    selectCouponCode = null

    if (!(options.IsSelectAction == undefined)) {
      isSelectAction = options.IsSelectAction
    }
   
    // if (!(options.SelectType == undefined)) {
    //   selectType = options.SelectType;
    // }

    // if (!(options.SelectPostion == undefined)) {
    //   selectPostion = SelectPostion;
    // }

    if (!(options.SelectCouponCode == undefined)) {
      selectCouponCode = options.SelectCouponCode;
    }

    that = this
    firstLocation = true

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      isSelectAction: isSelectAction,
      selectCouponCode: selectCouponCode,
    })
    
    if (isSelectAction == 0)
    {
      refreshPageData()
    }
    else
    {
      if (app.globalData.confirmCardCoupon == null)
      {
        wx.navigateBack({
          delta: 1,
        })

        return
      }

      var couponInfo = app.globalData.confirmCardCoupon
      var scrollPaddingTop = 0
      if (couponInfo.NewsTip != null && couponInfo.length > 0) {
        scrollPaddingTop = scrollPaddingTopValue
      }

      that.setData({
        cardCouponInfo: couponInfo,
        scrollPaddingTop: scrollPaddingTop,
      })
      return

    }
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

    if (!firstLocation && app.globalData.storeInfo == null) {
      getLocationStoreFail()
    }
    */

    if (!firstLocation
      && app.globalData.storeInfo == null) {
      getLocation()
      return
    }

    if (app.globalData.loginphonesuccess) {
      // hideReloadView()
      // getCouponInfo()
      refreshPageData()
      app.globalData.loginphonesuccess = false
      return
    }
  },
  tabchange:function(e)
  {
    var index = e.currentTarget.dataset.index
    that.setData({
      selectTabIndex:index,
    })
  },
  selectCoupon:function(e)
  {
    if (isSelectAction == 0)
    {
      return
    }
    
    var couponType = e.currentTarget.dataset.type
    var index = e.currentTarget.dataset.index
    selectCoupon(couponType,index)
  },
  tousecoupon:function(e)
  {
    var couponcode = e.currentTarget.dataset.couponcode
    //var index = e.currentTarget.dataset.index
    useCoupon(couponcode)
  },
  refreshData: function (e) {
    if (app.globalData.customerInfo == null) {
      return
    }

    if (util.isTempCustomer()) {
      util.confirmToLoginPhone()
      return
    }

    getCouponInfo()
  },
})

function refreshPageData()
{
  if (app.globalData.userloginflag == 0)
  {
    setTimeout(refreshPageData, 2 * 1000)
    return
  }

  if (util.isTempCustomer()) {
    util.confirmToLoginPhone()
    return
  }

  /*
  if (app.globalData.storeInfo == null) {
    if(firstLocation)
    {
      firstLocation = false
      getLocation()
    }
    else
    {
      getLocationStoreFail()
    }
    return
  }
  */

  if (app.globalData.storeInfo == null) {
    getLocation()
    firstLocation = false
    return
  }

  getCouponInfo()
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

function getCouponInfo()
{
  if (app.globalData.customerInfo == null)
  {
    return
  }

  var data = {};
    
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  if (app.globalData.storeInfo) {
    data.StoreSysNo = app.globalData.storeInfo.SysNo
  }

  data.ResourceFlag = 1//个人中心
  
  util.requestGet('GetCardCouponServiceV4', data, getCouponInfoSuccess, getCouponInfoFail, null)
}

function getCouponInfoSuccess(res) 
{
  if (res.data != null && res.data.Entity != null) 
  {

    /*
    var scrollPaddingTop = 0
    if (res.data.Entity.NewsTip != null && res.data.Entity.NewsTip.length > 0) {
      scrollPaddingTop = scrollPaddingTopValue
    }*/

    if (res.data.Entity.UnUsedList || res.data.Entity.UsedList || res.data.Entity.ExpiredList)
    {
      that.setData({
        cardCouponInfo: res.data.Entity,
        //scrollPaddingTop: scrollPaddingTop,
      })

      return
    }
   
    that.setData({
      dataEmpty: true,
    })
    return
    
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function getCouponInfoFail() {

}

function selectCoupon(couponType, index)
{
  var selectCouponInfo = null

  if (couponType == '0')
  {
    if (that.data.cardCouponInfo.UnUsedList == null 
      || that.data.cardCouponInfo.UnUsedList.length <= index
      || that.data.cardCouponInfo.UnUsedList[index].CanNotUsed == 1)
    {
      return
    }

    selectCouponInfo = that.data.cardCouponInfo.UnUsedList[index]
  }

  /*
  if (couponType == '1' && that.data.cardCouponInfo.ListRedPaper != null && that.data.cardCouponInfo.ListRedPaper.length > index)
  {
    selectCouponInfo = that.data.cardCouponInfo.ListRedPaper[index]
  }

  if (couponType == '2' && that.data.cardCouponInfo.ListPTFree != null && that.data.cardCouponInfo.ListPTFree.length > index) {
    selectCouponInfo = that.data.cardCouponInfo.ListPTFree[index]
  }*/

  app.globalData.selectCouponInfo = selectCouponInfo
  //返回
  wx.navigateBack()
}

function initUseData()
{
  app.globalData.changeHomeECType = false
  app.globalData.selectECategoryType = null
  app.globalData.selectEC1SysNo = null
  app.globalData.showListPTInfo = null
}

function useCoupon(couponcode)
{
  initUseData()

  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.CouponCode = couponcode
  if (app.globalData.storeInfo == null)
  {
    return
  }
  data.StoreSysNo = app.globalData.storeInfo.SysNo

  util.requestGet('CouponToUseService', data, useCouponSuccess, useCouponFail, null)
}

function useCouponSuccess(res) {
  if (res.data != null && res.data.Entity != null) {
    
    couponToUseProcess(res.data.Entity)
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function couponToUseProcess(couponToUseInfo)
{
  if (couponToUseInfo.UseType == appenum.CouponToUseType.Product.Value.toString()) {

    util.toProductdetail(couponToUseInfo.UsePNo)
    return
  }

  if (couponToUseInfo.UseType == appenum.CouponToUseType.ECategory2.Value.toString()) {

    //没有商品列表，则跳转到首页
    if (couponToUseInfo.ListProduct == null || couponToUseInfo.ListProduct.length <= 0) {
      util.showHomeByType(couponToUseInfo.ECategoryType, couponToUseInfo.EC1SysNo)
      return
    }

    //全局记录列表
    app.globalData.showListPTProductInfo = couponToUseInfo.ListProduct
    util.redirectToList(2, couponToUseInfo.Title,'')
    return
  }

  if (couponToUseInfo.UseType == appenum.CouponToUseType.Home.Value.toString()) {
    util.toHome()
    return
  }

  if (couponToUseInfo.UseType == appenum.CouponToUseType.PT.Value.toString()) {
    util.redirectToPTDetail(couponToUseInfo.UsePNo)
    return
  }

  if (couponToUseInfo.UseType == appenum.CouponToUseType.PTFree.Value.toString()) {
    if (couponToUseInfo.ListPT == null || couponToUseInfo.ListPT.length <= 0)
    {
      return
    }

    //全局记录列表
    app.globalData.showListPTInfo= couponToUseInfo.ListPT 
    util.redirectToList(1, null,couponToUseInfo.Title)
    return
  }

}

function useCouponFail() {

}

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
    util.setCityInfo()

    getCouponInfo()
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
    getCouponInfo()
  }
}