// pages/product/productreview.js

var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var windowHeight
var windowWidth

var sysNo
const pageSize = 10

var currentPage
var bmore = true
var bmoretoast = true

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listReview:null,
    StarImgUrl: appconst.StarImgUrl,
    windowWidth:0,
    windowHeight:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.SysNo == undefined) {
      sysNo = 0;
    }
    else {
      sysNo = options.SysNo
    }

    that = this

    windowHeight = app.globalData.systemInfo.windowHeight
    windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
    })

    currentPage = 1
    bmore = true
    bmoretoast = true

    getProductReview()
  },

  

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!bmore) {
      if (bmoretoast) {
        util.showToast('已经是最后一页', -1);
        bmoretoast = false
      }
      return
    }
    loadmore()
  },
})

function getProductReview()
{
  var data = {};
  
  data.ProductSysNo = sysNo
  data.PageSize = pageSize
  data.CurrentPage = currentPage

  util.requestGet('GetProductReviewService', data, getProductReviewSuccess, getProductReviewFail, null)
}

function getProductReviewSuccess(res)
{
  if (res.data != null && res.data.Entity != null) {

    if (res.data.Entity.ReviewInfo != null && res.data.Entity.ReviewInfo.length > 0) {
      
      var listReview = that.data.listReview

      if (listReview == null || currentPage == 1) {
        listReview = new Array()
      }

      for (var i = 0; i < res.data.Entity.ReviewInfo.length; i++) 　{
        var info = res.data.Entity.ReviewInfo[i]
        info.strRowCreateDate = util.convertTime(info.CreateDate).substr(0, 10)
        listReview.push(info)
      　}

      if (res.data.Entity.ReviewInfo.length < pageSize) {
        bmore = false;
      }

      that.setData({
        listReview: listReview
      })

      return
    }
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function getProductReviewFail()
{

}

function loadmore() {
  currentPage++
  getProductReview()
}
