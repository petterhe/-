// pages/people/searchaddress.js
var app = getApp()
var that
var cityName

const util = require('../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchText:null,
    addressList:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    
    that = this

    if (options.cityName == undefined) {
      cityName = app.globalData.storeInfo.CityInfo.AreaName
    }
    else
    {
      cityName = options.cityName
    }

    if (options.searchText == undefined) {
      getLocation() 
    }
    else {
      
      that.setData({
        searchText: options.searchText
      })

      searchAddressByKey()
    }
  },
  bindSearchTextInput: function (e) {
    that.setData({
      searchText: e.detail.value
    })

    searchAddressByKey()
  },
  selectAddress: function (e) {
    var index = e.currentTarget.dataset.index
    selectAddress(index);
  },
})

function getLocation() {
  util.getLocation(getLocationStoreSuccess, null, null)
}

function getLocationStoreSuccess(res) {
  //获取地理位置名称
  searchAddressByLocation(res)
}

function searchAddressByLocation(location) {
  if (location == null) {
    return
  }

  var data = {};
  data.Longitude = location.longitude
  data.latitude = location.latitude
  data.type = 1

  util.requestGet('SearchAddressByKeyService', data, searchAddressSuccess, searchAddressFail, null)
}

function searchAddressByKey() {
  if (that.data.searchText == null || that.data.searchText.length == 0) {
    return
  }

  var data = {};
  data.query = that.data.searchText
  data.region = cityName
  data.type = 1

  util.requestGet('SearchAddressByKeyService', data, searchAddressSuccess, searchAddressFail, null)
}

function searchAddressSuccess(res) {
  if (res.data != null && res.data.result && res.data.result.length > 0) {
    that.setData({
      addressList: res.data.result
    })
  }
}

function searchAddressFail() {

}

function selectAddress(index)
{
  var addressInfo = that.data.addressList[index]
  if (addressInfo != null)
  {
    app.globalData.searchAddressInfo = addressInfo
    wx.navigateBack()
  }
}