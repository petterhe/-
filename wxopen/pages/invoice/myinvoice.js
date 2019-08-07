// pages/invoice/myinvoice.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var app = getApp()
var that
var fromPage = 0

const pageSize = 10
var currentPage
var bmore = true
var bmoretoast = true
var listinvoice

var isSubimting = false
var fromApp = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 0,
    windowWidth: 0,

    listinvoice:null,

    isShowAdd:true,
    showReloadView: false,

    fromApp: fromApp,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //test()

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    that = this

    fromPage = 0
    currentPage = 1
    bmore = true
    bmoretoast = true
    isSubimting = false

    //获取参数
    if (!(options.FromPage == undefined)) {
      fromPage = 1
    }

    if (!(options.FromApp == undefined)) {
      fromApp = options.FromApp
    }

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      isShowAdd:true,
      fromApp: fromApp,
      canLaunchApp: util.canLaunchApp(),
    })
    
    refreshPageData()

    // if (app.globalData.customerInfo == null)
    // {
    //   //延迟3秒重新刷新页面
    //   setTimeout(refreshPageData, 3 * 1000)
    //   // //延迟6秒显示重新加载
    //   // setTimeout(showReloadView, 6 * 1000)
    //   return
    // }

    // refreshInvoiceList()

    // if(checkCustomerType())
    // {
    //   setIsShowAdd(true)
    //   refreshInvoiceList()
    // }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

    if (app.globalData.loginphonesuccess)
    {
      hideReloadView()

      setIsShowAdd(true)
      refreshInvoiceList()

      app.globalData.loginphonesuccess = false
      return
    }
    
    if (app.globalData.isAddInvoice)
    {
      app.globalData.isAddInvoice = false
      refreshInvoiceList()
      return
    }
  },
  addinvoice: function (e) {
    toaddinvoice()
  },
  refreshData: function (e) {
    if (app.globalData.customerInfo == null) {
      return
    }

    //hideReloadView()
    refreshInvoiceList()

    /*
    if(checkCustomerType())
    {
      hideReloadView()

      setIsShowAdd(true)
      refreshInvoiceList()
    }
    */
  },
  //下拉按钮
  onReachBottom: function (e) {
    if (!bmore) {
      if (bmoretoast) {
        util.showToast('已经是最后一页', -1);
        bmoretoast = false
      }
      return
    }
    loadmore()
  },
  toHome: function () {
    //wx.showShareMenu()
    util.toHome()
  },
  launchAppError: function (e) {
    /*
    wx.showModal({
      title: '11',
      content: e.detail.errMsg,
    })*/
    console.log(e)
  },
})

function clearData() {
  currentPage = 1
  bmore = true
  bmoretoast = true

  listinvoice = null
  that.setData({
    listinvoice: listinvoice
  })

}

function refreshPageData()
{
  //等待授权
  if (app.globalData.userloginflag == 0) 
  {
    setTimeout(refreshPageData, 2 * 1000)
    return
  }

  if (util.isTempCustomer()) {
    //未授权，去登录
    util.confirmToLoginPhone()
    return
  }

  refreshInvoiceList()
}

function refreshInvoiceList()
{
  clearData()
  getInvoiceList()
}

function loadmore() {
  currentPage++
  getInvoiceList()
}

function getInvoiceList() {
  var data = {};

  if (!app.globalData.customerInfo) {
    return
  }

  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  
  data.PageSize = pageSize
  data.CurrentPage = currentPage

  util.requestGet('GetMyInvoiceReqListService', data, getInvoiceListSuccess, getInvoiceListFail, null)
}

function getInvoiceListSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    if (res.data.Entity.ListInvoiceReq != null && res.data.Entity.ListInvoiceReq.length > 0) {
      showInvoiceList(res.data.Entity.ListInvoiceReq)
      return
    }

    if (currentPage == 1) {
      util.showToast('暂无发票申请记录', -1)
    }
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function showInvoiceList(list) {
  if (listinvoice == null || currentPage == 1) {
    listinvoice = new Array()
    //orderlist = list
  }

  for (var i = 0; i < list.length; i++) 　{
    list[i].strRowCreateDate = util.convertTime(list[i].CreateTime)

    listinvoice.push(list[i])
  　}

  if (list.length < pageSize) {
    bmore = false;
  }

  that.setData({
    listinvoice: listinvoice
  })
}

function getInvoiceListFail() {

}

function toaddinvoice()
{
  wx.navigateTo({
    url: '../invoice/addinvoice'
  })
}

function toinvoicedetail() {
  wx.navigateTo({
    url: '../invoice/invoicedetail'
  })
}

function checkCustomerType() {
  if (app.globalData.customerInfo != null
    && app.globalData.customerInfo.CustomerType != null
    && app.globalData.customerInfo.CustomerType == appenum.CustomerType.Temp.Value.toString()) {
    wx.showModal({
      title: '提示',
      content: '您尚未登录哦~',
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          util.toLoginPhone()
        }
      }
    })

    return false
  }

  return true
}

function setIsShowAdd(isShow)
{
  that.setData({
    isShowAdd: isShow,
  })
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