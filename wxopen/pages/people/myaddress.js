// pages/people/myaddress.js
var app = getApp()
var that
var selectAddressIndex = -1;
	
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
    
    getAddressList()

  },
  onShow: function() {
    //编辑地址后，刷新页面地址
    if(app.globalData.isEditAddress)
    {
       app.globalData.isEditAddress = false
       getAddressList()
    }
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
  }
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
    util.showToast('删除失败',-1)
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
