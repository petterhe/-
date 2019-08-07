// pages/people/addaddress.js
var app = getApp()
var that
var areaType = 0
var addressInfo = null
var saveType = 0 // 0 新增 1编辑
var addressEdit = 0 
var locationInfo = null
//var searchAddressFlag = 0

var cityName
//var confirmSave = "0"

const util = require('../../utils/util.js')

Page({
  data:{
    Contact:'',
    CellPhone:'',
    ProvinceName:'上海市',
    CityName:'上海市',
    Placemarks:'',
    Address:'',
    listProvince:null,
    listCity:null,
    Provinceindex:0,
    Cityindex:0,
    searchAddressFlag:0,
    searchText: null,
    addressList: null,
    windowHeight: 0,
    windowWidth: 0,
    namefocus: false,
    addressfocus:false,
    searchfocus: false,

    listGender:null,
    Gender:0,
    listAddressType:null,
    AddressType:0,
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    that = this

    if(options.straddress == undefined)
    {
       saveType = 0
       addressInfo = null
    }
    else
    {
        saveType = 1
        addressInfo = JSON.parse(options.straddress)
    }

    var listGenderConfig = util.getSysDataConfigList("Gender")

    var listAddressTypeConfig = util.getSysDataConfigList("AddressType")
  
    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      namefocus: true,
      addressfocus: false,
      searchfocus: false,
      listGender: listGenderConfig,
      listAddressType: listAddressTypeConfig,
    })


    areaType = 0
    addressEdit = 0
    locationInfo = null
    cityName = ''

    if(addressInfo != null)
    {
      
      var areaName = addressInfo.AreaName
      var provinceName = ''
      //var cityName = ''
      if(areaName != null && areaName.length > 0)
      {
          var areas = areaName.split(' ')
          if(areas.length >=2 )
          {
              provinceName = areas[0]
              cityName = areas[1]
          }
      }

      var gender = addressInfo.Gender
      var addressType = addressInfo.AddressType

      that.setData({
        Contact:addressInfo.Contact,
        CellPhone:addressInfo.CellPhone,
        ProvinceName:provinceName,
        CityName:cityName,
        Placemarks:addressInfo.Placemarks,
        Address:addressInfo.Address,
        Gender: gender,
        AddressType: addressType,
      })
    }
    else{
      if (app.globalData.customerInfo != null 
        && app.globalData.customerInfo.Phone != null
        && app.globalData.customerInfo.Phone.length > 0)
        {
          that.setData({
            CellPhone: app.globalData.customerInfo.Phone,
          })
        }
    }
    getAreas(null)

  },
  
  onShow:function(){
    // 页面显示
    if(saveType == 1) //编辑
    {
      wx.setNavigationBarTitle({
        title: '编辑收货地址',
        success: function(res) {
          // success
        }
      })
      return
    }

    if (app.globalData.scopeuserLocation) {
      chooseLocation()
      app.globalData.scopeuserLocation = false
      return
    }

    // if (searchAddressFlag == 1 && app.globalData.searchAddressInfo != null)
    // {
    //   setSearchAddress()
    //   searchAddressFlag = 0
    //   app.globalData.searchAddressInfo = null
    // }
  },
  // onHide:function()
  // {
  //   if (that.data.searchAddressFlag == 1)
  //   {
  //     return false
  //   }
  // },
  chooseLocation: function (e) {
    chooseLocationsetting()
  },
  searchAddress: function (e) {
    searchAddress()
  },
  closeSearchAddress:function(e)
  {
    that.setData({
      searchAddressFlag: 0,
      searchText: null,
      addressList: null,
    })
  },
  bindContactInput: function(e) {
    //addressInfo.Contact = e.detail.value
    that.setData({
      Contact: e.detail.value
    })
  },
  bindCellPhoneInput: function(e) {
    //addressInfo.CellPhone = e.detail.value
    that.setData({
      CellPhone: e.detail.value
    })
  },
  bindAddressPhoneInput: function(e) {
    //addressInfo.Address = e.detail.value
    that.setData({
      Address: e.detail.value
    })

    addressEdit = 1
  },
  bindProvinceChange: function(e) {
    var index = e.detail.value
    var provinceName = that.data.listProvince[index].ProvinceName
    //addressInfo.ProvinceName = provinceName
    that.setData({
      ProvinceName: provinceName
    })
  },
  bindCityChange: function(e) {
    var index = e.detail.value
    cityName = that.data.listCity[index].CityName
    //addressInfo.CityName = cityName
    that.setData({
      CityName: cityName
    })
  },
  saveAddress: function(e) {
    saveAddress("0")
  },
  submit: function (e) {
    //var formId = e.detail.formId.toString();
    saveAddress("0")
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
  selectGender:function (e) {
      var key = e.currentTarget.dataset.key
      that.setData({
        Gender:key,
      })
  },
  selectAddressType: function (e) {
    var key = e.currentTarget.dataset.key
    that.setData({
      AddressType: key,
    })
  },
})

function getAreas(provinceSysNo)
{
  var data = {};
  if(provinceSysNo != null)
  {
    areaType = 1
    data.ProvinceSysNo = provinceSysNo
  }
  util.requestGet('AreaService',data,getAreasSuccess,getAreasFail,null)
}

function getAreasSuccess(res)
{
  if(res.data != null && res.data.Entity != null
  && res.data.Entity.length > 0)
  {
    //util.shwoModel('11','请输入您需要搜索的内容');
    if(areaType == 0)
    {
      that.setData({
          listProvince:res.data.Entity
      })
      
      var provinceSysNo = res.data.Entity[0].SysNo
      getAreas(provinceSysNo)
      return
    }

    if(areaType == 1)
    {
      var listCity = new Array();
            
      for(var i = 0; i < res.data.Entity.length;i++)
      {
        var areaInfo = res.data.Entity[i]
        if (areaInfo.DistrictName == null
				  || areaInfo.DistrictName == "")
          {
				      listCity.push(areaInfo);
			    }
      }

      that.setData({
          listCity:listCity
      })
    }
    return
  }

  util.showToast(res.data.ResponseStatus.Message,-1)
}

function getAreasFail()
{

}

/*
function searchAddress()
{

  var url = '../people/searchaddress'
  
  if (that.data.CityName != null && that.data.CityName.length > 0)
  {
    url = url + '?cityName=' + that.data.CityName
  }

  if (that.data.Placemarks != null && that.data.Placemarks.length > 0) {
    if(url.indexOf('?') > 0)
    {
      url = url + '&'
    }
    else
    {
      url = url + '?'
    }
    
    url = url + 'searchText=' + that.data.Placemarks

  }

  //标记
  searchAddressFlag = 1

  wx.navigateTo({
    url:url
  })
}
*/



function setSearchAddress(searchAddressInfo)
{
  // var searchAddressInfo = app.globalData.searchAddressInfo

  var placemarks = searchAddressInfo.name
  var address = replaceAddress(searchAddressInfo.district)

  if (placemarks == null || placemarks.length == 0) {
    placemarks = address
  }

  that.setData({
    Placemarks: placemarks,
  })

  if (addressEdit == 0
    || that.data.Address == null
    || that.data.Address == "") {
    that.setData({
      Address: address,
      namefocus: false,
      addressfocus: true,
      searchfocus: false,
    })
  }

  if (searchAddressInfo.location != null)
  {
    locationInfo = new Object()
    locationInfo.latitude = searchAddressInfo.location.lat
    locationInfo.longitude = searchAddressInfo.location.lng
  }
}

function chooseLocationsetting()
{
  if (util.useNewAuth()) {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意小程序使用功能，后续调用 接口不会弹窗询问
              chooseLocation()
            },
            fail() {
              var message = "您好，请允许我们获取您的地理位置，更好的为您提供服务"
              util.toSettting(message)
            }
          })
        }
        else {
          chooseLocation()
        }
      }
    })
  }
  else {
    chooseLocation()
  }
}


function chooseLocation() {
  wx.chooseLocation({
    success: function (res) {

      var placemarks = res.name
      var strAddress = res.address

      //setProvinceCity(strAddress)

      var address = replaceAddress(strAddress)
      if (placemarks == null || placemarks.length == 0) {
        placemarks = address
      }

      that.setData({
        Placemarks: placemarks
      })

      if (addressEdit == 0
        || that.data.Address == null
        || that.data.Address == "") {
        that.setData({
          Address: address,
          namefocus: false,
          addressfocus: true,
          searchfocus: false,
        })
      }

      locationInfo = new Object()
      locationInfo.latitude = res.latitude
      locationInfo.longitude = res.longitude
      
    },
    fail: function (e) {
      // fail
      if (wx.getSetting) {
        wx.getSetting({
          success: function (res) {
            if (!res.authSetting["scope.userLocation"]) {
              util.chooseLocationFail(chooseLocation, null)
            }
          },
          fail: function (e) {
            util.chooseLocationFail(chooseLocation, null)
          }
        })
      }
      else {
      if (e.errMsg.indexOf("fail auth deny") >= 0) {
          util.chooseLocationFail(chooseLocation, null)
        }
      }
    },
    complete: function () {
      // complete
    }
  })
}

function setProvinceCity(strAddress)
{
  var pName = strAddress.substring(0, strAddress.indexOf('省') + 1)
  var cName = strAddress.substring(0, strAddress.indexOf('市') + 1)

  if (pName == null || pName.length == 0) {
    pName = cName
  }
  else {
    if (cName != null && cName.length > 0) {
      cName = cName.replace(pName, '');
    }
  }

  if (cName != null && cName.length > 0) {
    that.setData({
      ProvinceName: pName,
      CityName: cName
    })
  }
}

function replaceAddress(strAddress)
{
  if (strAddress == null || strAddress.length <= 0)
  {
    return strAddress
  }
  
  var address = strAddress.replace(that.data.ProvinceName,"")
    .replace(that.data.CityName,"")
  return address
}

function saveAddress(confirmSave)
{
  if(that.data.Contact == null || 
  that.data.Contact=="")
  {
    util.showModel("提示","请输入收货人姓名")
    return;
  }

  if (that.data.Gender == 0) {
    util.showModel("提示", "请选择性别")
    return;
  }

  if(that.data.CellPhone == null || 
  that.data.CellPhone=="")
  {
    util.showModel("提示","请输入联系电话")
    return
  }

  if (that.data.CellPhone.substring(0,1) == "1"  && !util.checkPhone(that.data.CellPhone)) {
    util.showModel("提示","请输入正确的联系电话")
      return
  }

  if(that.data.ProvinceName == null || 
  that.data.ProvinceName =="" ||
  that.data.CityName == null || 
  that.data.CityName =="" )
  {
    util.showModel("提示","请选择省市")
    return
  }

  if(that.data.Placemarks == null || 
  that.data.Placemarks =="")
  {
    wx.showModal({
      title: "提示",
      content: "请选择街道小区",
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          searchAddress()
        }
      }
    })
    
    return
  }
  
  if(that.data.Address == null || 
  that.data.Address =="")
  {
    util.showModel("提示","请输入详细地址")
    return
  }

  if (that.data.AddressType == 0) {
    util.showModel("提示", "请选择地址类型")
    return;
  }

  var data = {};

  if(saveType == 0)
  {
    data.CustomerSysNo = data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
    data.AreaSysNo = 0
  }
  data.Contact = that.data.Contact
  data.CellPhone = that.data.CellPhone
 
  var areaName = that.data.ProvinceName + ' ' + that.data.CityName
  data.AreaName = areaName

  if(saveType == 1 && addressInfo != null)
  {
    data.SysNo = addressInfo.SysNo
    data.AreaSysNo = addressInfo.AreaSysNo
    data.Latitude = addressInfo.Latitude
    data.Longitude = addressInfo.Longitude
  }

  data.Placemarks = that.data.Placemarks

  data.Address = that.data.Address
  if(locationInfo != null)
  {
    data.Latitude = locationInfo.latitude
    data.Longitude = locationInfo.longitude
  }

  data.Gender = that.data.Gender
  data.AddressType = that.data.AddressType 

  data.IsDefault = 0
  data.ConfirmSave = confirmSave

  var serviceName = "addcustomeraddressservice"
  if(saveType == 1)
  {
    serviceName = "updatecaddressservice"
  }

  util.requestPost(serviceName,data,saveAddressSuccess,saveAddressFail,null)
}

function saveAddressSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    app.globalData.isEditAddress = true
    //保存成功 返回
    wx.navigateBack()
    return
  }

  if(res.data != null && res.data.ResponseStatus != null && res.data.ResponseStatus.ErrorCode == 301613)
   {
     wx.showModal({
      title: "地址确认",
      content:  res.data.ResponseStatus.Message,
      showCancel:true,
      success: function(res) {
        if (res.confirm) {
            saveAddress("1")
          }
        }
      })
    return
   }

  //util.showModel('1',JSON.stringify(res))
  util.showToast(res.data.ResponseStatus.Message,-1)
}

function saveAddressFail()
{

}


function searchAddress() {

  that.setData({
    searchText: null,
    addressList: null,
    namefocus: false,
    addressfocus: false,
    searchfocus: true,
  })

  if (that.data.CityName != null && that.data.CityName.length > 0) {
    cityName = that.data.CityName
  }
  else
  {
    cityName = app.globalData.storeInfo.CityInfo.AreaName
  }

  if (that.data.Placemarks != null && that.data.Placemarks.length > 0) {
    that.setData({
      searchAddressFlag: 1,
      searchText: that.data.Placemarks
    })

    searchAddressByKey()
  }
  else {
    getLocation()
  }
}

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
      addressList: res.data.result,
      searchAddressFlag: 1,
    })
  }
}

function searchAddressFail() {

}

function selectAddress(index) {
  var addressInfo = that.data.addressList[index]
  if (addressInfo != null) {
    //app.globalData.searchAddressInfo = addressInfo
    //wx.navigateBack()

    setSearchAddress(addressInfo)

    that.setData({
      searchAddressFlag: 0,
      searchText: null,
      addressList: null,
    })


    //   searchAddressFlag = 0
    //   app.globalData.searchAddressInfo = null
  }
}