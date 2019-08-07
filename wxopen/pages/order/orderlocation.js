// pages/order/orderlocation.js
// pages/order/deliveryinfo.js
var app = getApp()
var that

const util = require('../../utils/util.js')

var soSysNo

Page({
  data: {
    Height: 0,
    scale: 15,
    latitude: "",
    longitude: "",
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

     if(soSysNo > 0)
     {
       getOrderLocationInfo()
     }
  },
})

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

     var height = app.globalData.systemInfo.windowHeight

    var scale = 13;
    if (soLocation.Distinct < 3000) {
        scale = 14;
    }

    if (soLocation.Distinct < 1000) {
        scale = 15;
    }

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

  util.showToast(res.data.ResponseStatus.Message,-1)
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