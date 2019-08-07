// pages/order/deliveryinfo.js
var app = getApp()
var that

const util = require('../../utils/util.js')

var soSysNo

Page({
  data: {
    focus: true,
    searchValue: null,

    Height: 0,
    scale: 15,
    latitude: "",
    longitude: "",
    soProcessInfo:null,
    soLocation:null,
    markers: [],
  },
  onLoad: function (options) {
    that = this

    if(options.soSysNo == undefined)
    {
      soSysNo = 0;
    }
    else
    {
      soSysNo = options.soSysNo
    }

    refreshData()
  },
  calldeliveryphone:function()
  {
    var deliveryUserInfo = that.data.soLocation
    if(deliveryUserInfo != null
    && deliveryUserInfo.FreightUserPhone != null 
    && deliveryUserInfo.FreightUserPhone.length > 0)
    {
      var phone = deliveryUserInfo.FreightUserPhone
      util.callPhone(phone)
    }
  },
  orderLocatinInfo:function()
  {
    toOrderLocatinInfo()
  },
  bindKeyInput: function (e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  search: function (e) {

    if (that.data.searchValue == null || that.data.searchValue.length <= 0)
    {
      return
    }

    soSysNo = getSoSysNo(that.data.searchValue)

    getSOProcess()
  },
  clear: function (e) {
    this.setData({
      searchValue: null
    })
  },
})

function refreshData() {
  if (app.globalData.customerInfo == null) {
    setTimeout(refreshData, 3 * 1000)
    return
  }

  if (soSysNo > 0) {
    that.setData({
      searchValue: soSysNo,
    })

    getSOProcess()
  }
}

function getSoSysNo(value)
{
  if (value.length == 10 && value.substring(0, 1) == '1') {
    value = value.substring(1, 10)
  }

  return value.replace(/\b(0+)/gi, "")
}

function getSOProcess()
{
  var data = {};
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.SOSysNo = soSysNo

  util.requestGet('SOProcessService',data,getSOProcessSuccess,getSOProcessFail,null)
}

function getSOProcessSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    var soProcessInfo = res.data.Entity
    that.setData({
      soProcessInfo:soProcessInfo
    })

    //打包完成订单 获取配送员位置
    if(soProcessInfo.StatusName != null
    && soProcessInfo.StatusName =="配送中")
    {
      getOrderLocationInfo()
    }
    return
  }

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getSOProcessFail()
{

}

function getOrderLocationInfo()
{
  var data = {};
  data.CustomerSysno = app.globalData.customerInfo.CustomerSysNo
  data.SOSysNo = soSysNo

  util.requestGet('GetSODeliveryLocationService',data,getOrderLocationInfoSuccess,getOrderLocationInfoFail,null)
}

function getOrderLocationInfoSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    var soLocation = res.data.Entity

     var height = app.globalData.systemInfo.windowWidth

    var scale = 13;
    if (soLocation.Distinct < 3000) {
        scale = 14;
    }

    if (soLocation.Distinct < 1000) {
        scale = 15;
    }

    // if (soLocation.Distinct < 500) {
    //     scale = 15;
    // }

    if (soLocation.Distinct < 200) {
        scale = 16;
    }

    that.setData({
      soLocation:soLocation,
      Height:height,
      scale:scale,
      latitude: soLocation.SOLatitude,
      longitude: soLocation.SOLongitude,
      markers: [{
        id: "1",
        latitude: soLocation.SOLatitude,
        longitude:soLocation.SOLongitude,
        width: 48,
        height: 31,
        iconPath: "/image/markerpoint3.png",
        title: "您的位置"
      },
      {
        id: "2",
        latitude:soLocation.DLatitude,
        longitude: soLocation.DLongitude,
        width: 64,
        height:41,
        iconPath: "/image/deliverypoint.png",
        title: "配送员位置"
      }]
    })

    return
  }

  //util.showToast(res.data.ResponseStatus.Message,-1)
}

function getOrderLocationInfoFail()
{

}


function location()
{
  wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [{
            id: "1",
            latitude: res.latitude,
            longitude: res.longitude,
            width: 48,
            height: 31,
            iconPath: "/image/markerpoint3.png",
            title: "您的位置"
          },
          {
            id: "2",
            latitude: res.latitude + 0.001,
            longitude: res.longitude + 0.001,
            width: 64,
            height:41,
            iconPath: "/image/deliverypoint.png",
            title: "配送员位置"
          }
          ]
        })
      }
    })
}

function toOrderLocatinInfo()
{
  wx.navigateTo({
    url: '../order/orderlocation?soSysNo=' + soSysNo
  })
}