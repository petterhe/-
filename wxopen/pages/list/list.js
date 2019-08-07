// pages/group/ptlist.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var app = getApp()
var that

var scrollPaddingTopValue = appconst.scrollPaddingTopValue

var listType
var tips
var title

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ListPT:null,
    ListProduct:null,
    Tips:null,
    scrollPaddingTop:0,

    InvitationNew: '1',
    HeadFreeCouponINew: '3',

    ShoppingCartCount:0,

    StarImgUrl: appconst.StarImgUrl,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this
    listType = 0
    tips = null
    title = '商品列表'

    if (!(options.ListType == undefined)) {
      listType = options.ListType
    }

    if (!(options.Title == undefined)) {
      title = options.Title
    }

    if (!(options.Tips == undefined)) {
      tips = options.Tips
    }

    //暂无数据 返回
    if (listType != 1 && listType != 2)
    {
      wx.navigateBack()
      return
    }

    if (listType == 1) {
      if (app.globalData.showListPTInfo == null 
        || app.globalData.showListPTInfo.length == 0)
      {
        wx.navigateBack()
        return
      }

      var scrollPaddingTop = 0
      if (tips != null && tips.length > 0) {
        scrollPaddingTop = scrollPaddingTopValue
      }

      that.setData({
        ListPT: app.globalData.showListPTInfo,
        ListProduct:null,
        Tips: tips,
        scrollPaddingTop: scrollPaddingTop,
        InvitationNew: appenum.PTScenarioType.InvitationNew.Value.toString(),
        HeadFreeCouponINew: appenum.PTScenarioType.HeadFreeCouponINew.Value.toString()
      })

      app.globalData.showListPTInfo = null
    }

    if (listType == 2) {
      if (app.globalData.showListPTProductInfo == null
        || app.globalData.showListPTProductInfo.length == 0) {
        wx.navigateBack()
        return
      }

      var scrollPaddingTop = 0
      if (tips != null && tips.length > 0) {
        scrollPaddingTop = scrollPaddingTopValue
      }

      that.setData({
        ListPT:null,
        ListProduct: app.globalData.showListPTProductInfo,
        Tips: tips,
        scrollPaddingTop: scrollPaddingTop,
        ShoppingCartCount: app.globalData.ShoppingCartCount,
      })

      app.globalData.showListPTProductInfo = null
    }
  },
  onShow: function () {
    // 页面显示
    if (title != null && title.length > 0) //编辑
    {
      wx.setNavigationBarTitle({
        title: title,
        success: function (res) {
          // success
        }
      })
    }
  },
  planDetail: function (e) {
    var planSysNo = e.currentTarget.dataset.plansysno
    toPTDetail(planSysNo)
  },
  productDetail: function (e) {
    var productSysNo = e.currentTarget.dataset.productsysno
    util.toProductdetail(productSysNo)
  },
  addCart: function (e) {
    var productSysNo = e.currentTarget.dataset.productsysno
    addCart(productSysNo)
  },
  toCart: function () {
    util.toCart()
  },
})

function toPTDetail(planSysNo) {
  if (planSysNo != null && planSysNo.length > 0) {
    wx.redirectTo({
      url: '../group/ptdetail?PlanSysNo=' + planSysNo
    })
  }
}

function addCart(sysNo) {
  util.addCart(sysNo, addCartSuccess, addCartFail, null)
}

function addCartSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    app.globalData.ShoppingCartCount = res.data.Entity.ShoppingCartCount

    //util.showTabBarCartCount()

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