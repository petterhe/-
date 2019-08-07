// pages/people/about.js
var app = getApp()
var that
var fromShare

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var shareTitle

Page({
  data:{
    listStore: null,
    fromShare:0,
    imageHost: appconst.ImageHost,
    ContactPhone:null,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数

    //设置分享
    util.showShareMenu()

    that = this

    if(options.fromShare == undefined)
    {
      fromShare = 0;
    }
    else
    {
      fromShare = options.fromShare
    }

    //客服电话
    var contactPhone = util.getSysDataConfigValue('ContactPhone')

    that.setData({
      fromShare:fromShare,
      ContactPhone: contactPhone
    })
    
    shareTitle = util.getShareTitle()

    getStores()
  },
  toHome:function()
  {
    //wx.showShareMenu()
    util.toHome()
  },
  onShareAppMessage: function () {

    var path = 'pages/about/about?fromShare=1';
   
    //获取分享术语
    var title = shareTitle
    if (title == null || title.length == 0) {
      title = '花擦！这家的拼团好吃就算了，居然还能1小时送到！'
    }

    path = util.getSharePath(path)

    return {
      title: title,
      path: path,
      success: function (res) {
        if (res.shareTickets != null && res.shareTickets.length > 0) {
          //获取分享信息及上报解密
          util.getShareInfo(res.shareTickets[0], path, appenum.WXOpenShareLogType.Share.Value)
        }
        else {
          util.saveNoTicketShareInfo(path, appenum.WXOpenShareLogType.Share.Value)
        }
      },
      fail: function (res) {
      }
    }
  },

})

function getStores()
{

  var data = {};
  util.requestGet('DistrictStoresService',data,getStoresSuccess,getStoresFail,null)
}

function getStoresSuccess(res)
{
  if(res.data != null && res.data.Entity != null
  && res.data.Entity.length > 0)
  {

    var listStore = res.data.Entity
    that.setData({
      listStore: listStore,
    })
    /*
    var listStoreA = new Array()
    var listStoreB = new Array()
    var listStoreC = new Array()

    for(var i = 0;i < res.data.Entity.length; i++)
    {
      var store = res.data.Entity[i]
      if(store.StockSaleType == "2")
      {
        listStoreB.push(store)
      }
      else if(store.StockSaleType == "3"){
        listStoreC.push(store)
      }
      else{
        listStoreA.push(store)
      }
    }

    that.setData({
      listStoreA: listStoreA,
      listStoreB: listStoreB,
      listStoreC: listStoreC,
    })
    return
    */
  }
}

function getStoresFail()
{

}