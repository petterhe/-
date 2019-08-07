// pages/store/selectshop.js
var app = getApp()
var that

var fromOrderSubmit = '0'

const util = require('../../utils/util.js')

Page({
  data:{
    locationMessage:'正在为您定位可服务的门店，请稍候',
    listGisStore:null,
    listHisStore:null,
    listAllStore:null,
    storeCount:0
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    that = this

    fromOrderSubmit = '0'

    if (!(options.fromOrderSubmit == undefined)) {
      fromOrderSubmit = options.fromOrderSubmit
    }

    //获取定位
    getLocation()

    //获取历史门店
    getHisStore()

    //获取所有门店
    getAllStore()

  },
  selectshop:function(e)
  {
    var index = e.currentTarget.dataset.index
    var selecttype = e.currentTarget.dataset.type
    selectshop(selecttype,index);
  }

})

function getLocation()
{
  util.getLocation(locationProcess,locationFail,null)
}

function locationProcess(res)
{
  app.globalData.locationInfo = res
  //获取可配送门店
  getGisStore(res)
}

function locationFail()
{
  that.setData({
      locationMessage:'获取定位失败'
     });
}

//获取gis门店
function getGisStore(res)
{
    var data = {}
    data.Longitude = res.longitude
    data.latitude = res.latitude
  
    //util.showModel('dd',JSON.stringify(data))
    util.requestGet('NewGisStoresService',data,getGisStoreSuccess,getGisStoreFail,null)

}

function getGisStoreSuccess(res)
{
  //console.log(JSON.stringify(res))
  //util.showModel('11','gesg')

  if(res.data != null && res.data.Entity != null
  && res.data.Entity.length > 0)
  {
     that.setData({
      listGisStore:res.data.Entity,
      locationMessage:''
     });
   
    return;
  }

  that.setData({
      locationMessage:'此区域暂无可服务的门店，敬请期待！'
  });

}

function getGisStoreFail()
{

}
//***************定位及获取门店****************//

//*************获取历史门店******************//
function getHisStore()
{
    var data = {}
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
    data.AreaID = app.globalData.areaID
  
    //util.showModel('dd',JSON.stringify(data))
    util.requestGet('GetHistoryStoresService',data,getHisStoreSuccess,getHisStoreFail,null)

}

function getHisStoreSuccess(res)
{
  //console.log(JSON.stringify(res))
  //util.showModel('11','gesg')

  if(res.data != null && res.data.Entity != null
  && res.data.Entity.HisStores != null && res.data.Entity.HisStores.length > 0)
  {
    that.setData({
      listHisStore:res.data.Entity.HisStores,
      storeCount:res.data.Entity.AllCount
     });
    return;
  }

}

function getHisStoreFail()
{
  
}
//*************获取历史门店******************//

//*************获取全部门店******************//
function getAllStore()
{
    var data = {}
    data.AreaID = app.globalData.areaID
  
    //util.showModel('dd',JSON.stringify(data))
    util.requestGet('StoresService',data,getAllStoreSuccess,getAllStoreFail,null)

}

function getAllStoreSuccess(res)
{
  //console.log(JSON.stringify(res))
  //util.showModel('11','gesg')

  if(res.data != null && res.data.Entity != null
  && res.data.Entity.length > 0)
  {
    that.setData({
      listAllStore:res.data.Entity
     });
    return;
  }

}

function getAllStoreFail()
{
  
}
//*************获取全部门店******************//

function selectshop(selecttype,index)
{

  var selectStore = null;
  if(selecttype == "1")
  {
    selectStore = that.data.listGisStore[index]
  }

  if(selecttype == "2")
  {
    selectStore = that.data.listHisStore[index]
  }

  if(selecttype == "3")
  {
    selectStore = that.data.listAllStore[index]
  }

  if(selectStore != null)
  {
    if (fromOrderSubmit == '1')
    {
      app.globalData.submitSelectStoreInfo = selectStore
    }
    else
    {
      util.changeStore(selectStore)
      app.globalData.selectAddress = ''
    }

    wx.navigateBack({
      delta: 2
    })
  }
}