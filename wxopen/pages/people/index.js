// pages/people/index.js
var app = getApp()
var that

var imageHost

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

Page({
  data:{
    userInfo:null,
    listUserMenu:null,
    CouponCount:'',
    CouponKey:2,//优惠券编号
    isTempCustomer:true,
    customerID:'',
    canWebView: false,
    downloadUrl:null,
    avatarUrl:null,
    nickName:null,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    that = this

    imageHost = appconst.ImageHost

    initMenuData()

    //APP下载图片
    var downloadUrl = util.getSysDataConfigValueBykey('WXXCXAppDownloadImage', '2')

    that.setData({
      canWebView: util.canWebView(),
      downloadUrl: downloadUrl,
    })
  },
  onShow: function () {

    //更新购物车红点
    util.showTabBarCartCount()
    
    //获取红包通知
    getNotice()

    //切换用户
    checkTempUser()

    //绑定后重新结算
    if (app.globalData.loginphonesuccess) 
    {
        app.globalData.loginphonesuccess = false
    }
  },
  menuopen:function(e)
  {
    var index = e.currentTarget.dataset.index
    menuopen(index)
  },
  bindPhone:function()
  {
    if(util.isTempCustomer())
    {
      util.toLoginPhone()
    }
  },
  showQCode:function(e)
  {
    util.showQCode()
  },
  toAboutAPP: function (e) {
    util.toAboutAPP()
  },
  launchAppError: function (e) {
    // wx.showModal({
    //   title: '11',
    //   content: e.detail.errMsg,
    // })
  },
})

function checkTempUser()
{
  var customerid = null
  var avatarUrl = null
  var nickName = null
  var isTempCustomer = true;

  if (app.globalData.customerInfo) {
    isTempCustomer = util.isTempCustomer()

    if (!isTempCustomer)
    {
      customerid = app.globalData.customerInfo.CustomerID

      if (app.globalData.userInfo) {
        avatarUrl = app.globalData.userInfo.avatarUrl
        nickName = app.globalData.userInfo.nickName
      }

      if (!avatarUrl) {
        avatarUrl = app.globalData.customerInfo.AvatarUrl
      }

      if (!nickName) {
        nickName = app.globalData.customerInfo.nickname
      }
    }
  }

  that.setData({
    customerID: customerid,
    avatarUrl: avatarUrl,
    nickName: nickName,
    isTempCustomer: isTempCustomer,
  })
}

function initMenuData()
{
    var listUserMenu = new Array();
  
    var menu1 = new Object();
    menu1.MenuKey = 1
    menu1.MenuName = "我的订单"
    menu1.MenuIconUrl = imageHost + "AppIcon/AccountCenter/wodedingdan2.png"
    listUserMenu.push(menu1)

    var menu3 = new Object();
    menu3.MenuKey = 2
    menu3.MenuName = "红包卡券"
    menu3.MenuIconUrl = imageHost + "AppIcon/AccountCenter/hongbaokaquan2.png"
    listUserMenu.push(menu3)
    //优惠券编号
    that.setData({
      CouponKey: menu3.MenuKey
    })


    var menu2 = new Object();
    menu2.MenuKey = 6
    menu2.MenuName = "地址管理"
    menu2.MenuIconUrl = imageHost + "AppIcon/AccountCenter/dizhiguanli2.png"
    listUserMenu.push(menu2) 

    
    var menu3 = new Object();
    menu3.MenuKey = 3
    menu3.MenuName = "我的退款"
    menu3.MenuIconUrl = imageHost + "AppIcon/AccountCenter/wodeshensu2.png"
    listUserMenu.push(menu3) 
    
    
    var menu13 = new Object();
    menu13.MenuKey = 13
    menu13.MenuName = "发票申请"
    menu13.MenuIconUrl = imageHost + "AppIcon/AccountCenter/invoicerequest2.png"
    listUserMenu.push(menu13)
    

    var menu12 = new Object();
    menu12.MenuKey = 12
    menu12.MenuName = "联系我们"
    menu12.MenuIconUrl = imageHost + "AppIcon/AccountCenter/lianxiwomen2.png"
    listUserMenu.push(menu12) 

    var menu4 = new Object();
    menu4.MenuKey = 8
    menu4.MenuName = "关于我们"
    menu4.MenuIconUrl = imageHost + "AppIcon/AccountCenter/guanyuwomen2.png"
    listUserMenu.push(menu4) 

    var menu5 = new Object();
    menu5.MenuKey = 9
    menu5.MenuName = "帮助中心"
    menu5.MenuIconUrl = imageHost + "AppIcon/AccountCenter/bangzhuzhongxin2.png"
    listUserMenu.push(menu5) 

    that.setData({
      listUserMenu:listUserMenu
    })

  /*
  var menu99 = new Object();
  menu99.MenuKey = 99
  menu99.MenuName = "下载APP"
  menu99.MenuIconUrl = imageHost + "AppIcon/AccountCenter/yaoqingyouli2.png"
  listUserMenu.push(menu99)

  that.setData({
    listUserMenu: listUserMenu
  })
  */

}

function  menuopen(index)
{
  var menuInfo = that.data.listUserMenu[index]
  switch(menuInfo.MenuKey)
  {
    case 1:
      if (util.isTempCustomer()) {
        util.confirmToLoginPhone()
        return
      }

      myOrder()
      break
    case 2:
      if (util.isTempCustomer())
      {
        util.confirmToLoginPhone()
        return
      }

      toCouponList()
      break
    case 3:
      if (util.isTempCustomer()) {
        util.confirmToLoginPhone()
        return
      }

      toMyRefund()
      break
    case 6:
      if (util.isTempCustomer()) {
        util.confirmToLoginPhone()
        return
      }
      myAddress()
      break
    case 8:
      about()
      //chooseInvoiceTitle()
      break
    case 9:
      help()
      break;
    case 10:
      setting()
      //wx.showShareMenu()
      break

    case 12:
      contactus()
      break  
    case 13:
      /*
      if (util.isTempCustomer()) {
        util.confirmToLoginPhone()
        return
      }*/

      if (util.isTempCustomer()) {
        util.confirmToLoginPhone()
        return
      }
      toMyInvoice()
      break
    case 99:
      util.toAboutAPP()
      break;

  }
}

function myOrder()
{
   //TabBar切换
   wx.switchTab({  
      url: '../order/orderlist'  
    })
}

function myAddress()
{
  wx.navigateTo({  
    url: '../people/myaddress'  
  })

  /*
  wx.chooseAddress({
  success: function (res) {

    util.showToast(JSON.stringify(res))
    console.log(res.userName)
    console.log(res.postalCode)
    console.log(res.provinceName)
    console.log(res.cityName)
    console.log(res.countyName)
    console.log(res.detailInfo)
    console.log(res.nationalCode)
    console.log(res.telNumber)
    }
  })*/
}

function toMyRefund() {
  wx.navigateTo({
    url: '../refund/myrefund'
  })
}

function toCouponList()
{
  wx.navigateTo({
    url: '../people/couponlist'
  })
}

function toMyInvoice() {
  wx.navigateTo({
    url: '../invoice/myinvoice'
  })
}

function about()
{
  wx.navigateTo({  
      url: '../about/about'  
    })
  // //关于我们 直接打开网页
  // var url = util.getWebUrl("Home/AboutUs?fromapp=1");
  // util.toWebView(url)
}

function help()
{
  wx.navigateTo({  
      url: '../about/help'  
    })
}

function contactus() {
  wx.navigateTo({
    url: '../about/contactus'
  })
}

function setting()
{
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        
      },
    })
  }
  
}

function getNotice() {
  var data = {};

  if (app.globalData.customerInfo == null)
  {
    return
  }

  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo

  util.requestGet('GetNoticeService', data, getNoticeSuccess, getNoticeFail, null, false)
}

function getNoticeSuccess(res) {
  that.setData({
    CouponCount: '',
  })

  if (res.data != null && res.data.Entity != null
    && res.data.Entity.length > 0) {
    for (var i = 0; i < res.data.Entity.length; i++) {
      var noticeInfo = res.data.Entity[i]
      //待支付
      if (noticeInfo.Type == appenum.NoticType.CouponCount.Value && noticeInfo.Count > 0) {
        that.setData({
          CouponCount: noticeInfo.Count.toString()
        })
      }
    }

    return
  }
  //util.showToast(res.data.ResponseStatus.Message,-1)
}

function getNoticeFail() {

}