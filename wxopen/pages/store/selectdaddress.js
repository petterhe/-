// pages/store/selectaddress.js
//获取应用实例
var app = getApp()
var that
var selectAddressIndex
var chooseLocationName
var fromOrderSubmit = '0'
var isLoad = true
	
const util = require('../../utils/util.js')

Page({
  data:{
    listAddress:null
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    that = this


    selectAddressIndex = -1
    chooseLocationName = null
    isLoad = true

    fromOrderSubmit = '0'

    if (!(options.fromOrderSubmit == undefined)) {
      fromOrderSubmit = options.fromOrderSubmit
    }

    getAddressList()

  },
  onShow: function() {
    // wx.setNavigationBarTitle({
    //   title: '选择收货地址',
    //   success: function(res) {
    //     // success
    //   }
    // })
    //编辑地址后，刷新页面地址
    if(app.globalData.isEditAddress)
    {
      app.globalData.isEditAddress =false
      getAddressList()
      return
    }

    if (!isLoad && app.globalData.scopeuserLocation)
    {
      searchAddress()
      app.globalData.scopeuserLocation = false
      return
    }

    isLoad = true
  },
  selectaddress:function(e)
  {
    var index = e.currentTarget.dataset.index
    selectaddress(index)
  },
  editaddress:function(e)
  {
    var index = e.currentTarget.dataset.index
    editAddress(index)
  },
  deladdress:function(e)
  {
    wx.showModal({
      title: "删除确认",
      content:  "您确定需要删除此地址？",
      showCancel:true,
      success: function(res) {
        if (res.confirm) {
            var index = e.currentTarget.dataset.index
            deleteAddress(index)
          }
        }
      })
  },
  addaddress:function(e)
  {
    addAddress()
  },
  searchAddress:function(e)
  {
    searchAddressSetting()
  },
  selectShop:function(e)
  {
    selectShop()
  },
})

function getAddressList()
{

  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  util.requestGet('GetCustomerAddressService',data,getAddressListSuccess,getAddressListFail,null)
}

function getAddressListSuccess(res)
{
  if(res.data != null && res.data.Entity != null)
  {
    //util.shwoModel('11','请输入您需要搜索的内容');
    //showProductList(res.data.Entity)
    that.setData({
      listAddress: res.data.Entity
    })
    return
  }

  //util.showToast(res.data.ResponseStatus.Message)
}

function getAddressListFail()
{

}

function selectaddress(index)
{
  selectAddressIndex = index
  
  var latitude = that.data.listAddress[selectAddressIndex].Latitude
  var longitude = that.data.listAddress[selectAddressIndex].Longitude

  getSelectAddressStore(latitude,longitude)
}

function searchAddressSetting()
{
  if (util.useNewAuth()) {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              // 用户已经同意小程序使用功能，后续调用 接口不会弹窗询问
              searchAddress()
            },
            fail() {
              var message = "您好，请允许我们获取您的地理位置，更好的为您提供服务"
              util.toSettting(message)
            }
          })
        }
        else {
          searchAddress()
        }
      }
    })
  }
  else {
    searchAddress()
  }
}

function searchAddress()
{
  wx.chooseLocation({
    success: function(res){
      // success
      var latitude = res.latitude
      var longitude =  res.longitude

      selectAddressIndex= -1
      chooseLocationName = res.name
      getSelectAddressStore(latitude,longitude)
      
    },
    fail: function(e) {
      if (wx.getSetting) {
        wx.getSetting({
          success: function (res) {
            if (!res.authSetting["scope.userLocation"]) {
              util.chooseLocationFail(searchAddress, null)
            }
          },
          fail: function (e) {
            util.chooseLocationFail(searchAddress, null)
          }
        })
      }
      else {
        if (e.errMsg.indexOf("fail auth deny") >= 0) {
          util.chooseLocationFail(searchAddress, null)
        }
      }

      // if (e.errMsg.indexOf("fail auth deny") < 0) 
      // {
      //   return 
      // }     

      // util.chooseLocationFail(searchAddress, null)
    },
    complete: function() {
      // complete
    }
  })
}

// function chooseLocationFail() {
//   wx.showModal({
//     title: '提示',
//     content: '您拒绝了位置信息授权，请重新选择授权',
//     showCancel: false,
//     success: function (res) {
//       if (res.confirm) {
//         openUserLocationSetting()
//       }
//     }
//   })
// }

// function openUserLocationSetting() {
//   if (wx.openSetting) {
//     wx.openSetting({
//       success: function (res) {
//         if (res.authSetting["scope.userLocation"]) {
//           //这里是授权成功之后 填写你重新获取数据的js
//           searchAddress()
//         }
//       },
//     })
//   }
// }

function getSelectAddressStore(latitude,longitude)
{
  var data = {};
  data.Latitude = latitude
  data.Longitude = longitude

  util.requestGet('NewGisStoresService',data, getSelectAddressStoreSuccess,getSelectAddressStoreFail,null)
}

function getSelectAddressStoreSuccess(res)
{
  if(res.data != null && res.data.Entity != null 
  && res.data.Entity.length > 0)
  {
    
    if (fromOrderSubmit == '1') {
      app.globalData.submitSelectStoreInfo = res.data.Entity[0]
    }
    else 
    {
      util.changeStore(res.data.Entity[0])

      if(selectAddressIndex >= 0)
      {
        var selectAddressInfo = that.data.listAddress[selectAddressIndex]

        app.globalData.selectAddressSysNo = selectAddressInfo.SysNo
        app.globalData.selectAddress = selectAddressInfo.Placemarks
      }
      else
      {
        app.globalData.selectAddress = chooseLocationName
      }
    }

    wx.navigateBack()
    return
  }

  util.showToast('此区域目前无可服务的门店，您可以进入选择门店')
}

function getSelectAddressStoreFail()
{

}

function deleteAddress(index)
{
  selectAddressIndex = index

  var data = {};
  data.SysNo = that.data.listAddress[selectAddressIndex].SysNo

  util.requestPost('DeleteCustomerAddressService',data, deleteAddressSuccess, deleteAddressFail,null)
    
}

function deleteAddressSuccess(res)
{
  if(res.data != null && res.data.Entity != null &&  res.data.Entity.IsDelete)
  {
     var listAddress = that.data.listAddress
     listAddress.splice(selectAddressIndex,1)
     that.setData({
      listAddress: listAddress
    })

    util.showToast('删除地址成功')
  }
  else
  {
    util.showToast('删除失败')
  }
}

function deleteAddressFail()
{

}

function editAddress(index)
{
   var addressInfo = that.data.listAddress[index]
   wx.navigateTo({  
      url: '../people/addaddress?straddress='+JSON.stringify(addressInfo)  
    }) 

    app.globalData.isEditAddress = true
}

function addAddress()
{
   wx.navigateTo({  
      url: '../people/addaddress'  
    }) 

    app.globalData.isEditAddress = true
}

function selectShop()
{
  var url = '../store/selectshop'
  if(fromOrderSubmit == '1')
  {
    url = url + "?fromOrderSubmit=1"
  }

  wx.navigateTo({
    url: url
  })
}