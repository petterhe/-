// pages/order/orderfeed.js
var app = getApp()
var that

const util = require('../../utils/util.js')

var soSysNo

Page({
  data:{},
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    if(options.SOSysNo == undefined)
    {
      soSysNo = 0;
    }
    else
    {
      soSysNo = e.SOSysNo
    }

    that = this
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