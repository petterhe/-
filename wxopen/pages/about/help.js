// pages/people/help.js

var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')

Page({
  data:{
    returnWxNo:'',
    ContactPhone:''
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数

    that = this

    var contactPhone = util.getSysDataConfigValue('ContactPhone')

    that.setData({
      returnWxNo: app.globalData.returnWxNo,
      ContactPhone: contactPhone
    })
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})