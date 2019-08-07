// pages/about/contactus.js
var app = getApp()
var that
var fromShare

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')

Page({
  data: {
    wxPublicNo:'',
    wxReturnNo: '',
    wxBusinessNo:'',
    contactPhone: '',
    customerServiceWorkTime: '',

    canAccount:wx.canIUse('official-account'),
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数

    that = this

    //设置分享
    util.showShareMenu()

    initData()
  },
  callcontactPhone: function () {

    var contactPhone = that.data.contactPhone
    if (contactPhone == null
      || contactPhone.length == 0) {
        return
    }

    util.callPhone(contactPhone)
  },
  copyPublicNo:function()
  {
    util.setClipboardData(that.data.wxPublicNo)
  },
  copyReturnNo: function () {
    util.setClipboardData(that.data.wxReturnNo)
  },
  copyBusinessNo: function () {
    util.setClipboardData(that.data.wxBusinessNo)
  },
  onShareAppMessage: function () {

    var path = that.route

    // //获取分享术语
    // var title = shareTitle
    // if (title == null || title.length == 0) {
    //   title = '花擦！这家的拼团好吃就算了，居然还能1小时送到！'
    // }

    // path = util.getSharePath(path)

    return {
      //title: title,
      path: path,
    }
  },
})

function initData()
{
  if (app.globalData.sysDataConfig == null || app.globalData.sysDataConfig.length == 0) 
  {
    setTimeout(initData, 2 * 1000)
    return
  }

  var wxPublicNo = util.getSysDataConfigValue('WXPublicNo')
  var contactPhone = util.getSysDataConfigValue('ContactPhone')
  var customerServiceWorkTime = util.getSysDataConfigValue('CustomerServiceWorkTime')
  var wxBusinessNo = util.getSysDataConfigValue('BusinessCooperationWXNo')
  

  that.setData({
    wxPublicNo: wxPublicNo,
    wxReturnNo: app.globalData.returnWxNo,
    wxBusinessNo: wxBusinessNo,
    contactPhone: contactPhone,
    customerServiceWorkTime: customerServiceWorkTime,
  })

}