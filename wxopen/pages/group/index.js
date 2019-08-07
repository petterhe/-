//index.js
//获取应用实例
var app = getApp()
var that;
var storeSysNo
var selectPTTypeNo = ''
var selectEC1SysNo = ''
var animation = null
var listPTType = null
var firstLocation

const tabAnimationTime = 300
const tabAnimationPTTime = 0
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')

Page({
  data: {
    tabitemwidth:72,
    selectaddress:'',
    storename:'',
    selectPTIndex:0,
    leftTabIndex:0,
    rightTabIndex:0,
    ListPTType:null,
    ListBuoy:null,
    tabAnimationData:{},
    listHeight:1000,
    scrollLeft:0,
    XiaoShiType: 1,
  },
  onLoad: function (options) {
    console.log('onLoad')

    //设置分享
    util.showShareMenu()

    that = this

    //获取参数
    if(options.selectPTTypeNo == undefined)
    {
      //util.showModel('11',options.selectPTTypeNo)
      selectPTTypeNo = ''
    }
    else
    {
      selectPTTypeNo = options.selectPTTypeNo
    }

    if(options.selectEC1SysNo == undefined)
    {
     //util.showModel('12',options.selectEC1SysNo)
      selectEC1SysNo = ''
    }
    else
    {
      selectEC1SysNo = options.selectEC1SysNo
    }

    //初始化数据
    storeSysNo = null
    animation = null
    listPTType = null
    firstLocation = true

    var height = util.getScrollHeight(116)
   
    that.setData({
        storename:'正在定位分店',
        listHeight:height,
        XiaoShiType: appenum.GroupBuyType.XiaoShi.Value
    })

    //获取定位
    //getLocation()
    //已定位到门店时无需重复定位
    if(app.globalData.storeInfo != null)
    {
      that.setData({
        storename:app.globalData.storeInfo.StoreName
      })
      getHomeData()
      //检索附件地址
      searchAddress()
    }
    else
    {
      if (firstLocation) {
        getLocation()
        firstLocation = false
      }
      else {
        getLocationStoreFail()
      }
    }

    initTabAnimation()

  },
  onShow: function() {

    if (app.globalData.refreshuserLocation) 
    {
      if (app.globalData.scopeuserLocation) 
      {
        firstLocation = true
        getLocation()
      }
      else{
        getLocationStoreFail()
      }

      app.globalData.scopeuserLocation = false
      return
    }

    console.log('onShow')
    if(app.globalData.changeStore)
    {
      that.setData({
        selectaddress:app.globalData.selectAddress,
        storename:app.globalData.storeInfo.StoreName
      })

      app.globalData.changeStore = false
      app.globalData.selectAddress= null

      if(app.globalData.storeInfo.SysNo != storeSysNo)
      {
        clearHomeData()
        getHomeData()
      }
    }
  },
  // onPullDownRefresh: function(){

  //   if(that.data.storename != null && that.data.storename.length > 0 )
  //   {
  //     clearHomeData()
  //     getHomeData()
  //   }

  //    wx.stopPullDownRefresh()
  // },
  //分享
  onShareAppMessage: function () {

    //selectEC1SysNo
    //var url = that.route
    var path = 'pages/group/index'
    setSelectTPECSysNo()

    if(selectPTTypeNo != '')
    {
      path = path + '?selectPTTypeNo=' + selectPTTypeNo
    }

    if(selectEC1SysNo != '')
    {
      path = path + '&selectEC1SysNo=' + selectEC1SysNo
    }

    //获取分享术语
    var title = util.getShareTitle()
    if (title == null || title.length == 0)
    {
      title = '花擦！这家的拼团好吃就算了，居然还能1小时送到！'
    }

    path = util.getSharePath(path)

    return {
      title: title,
      path:path,
      success: function (res) {
        if (res.shareTickets != null &&res.shareTickets.length > 0)
        {
          //获取分享信息及上报解密
          util.getShareInfo(res.shareTickets[0], path, appenum.WXOpenShareLogType.Share.Value)
        }
        else
        {
          util.saveNoTicketShareInfo(path, appenum.WXOpenShareLogType.Share.Value)
        }
      },
      fail: function (res) {
      }
    }
  },
  pttypechage:function(e)
  {
    var index = e.currentTarget.dataset.index
     that.setData({
      selectPTIndex:index,
    })

    //动画
    changeAnimationProcess(tabAnimationPTTime)
    
    //滚动到指定位置
    setscrollLeft()

    //显示数据
     showPTEC1PL()
  },
  ec1chage:function(e)
  {
    var index = e.currentTarget.dataset.index
    if(that.data.selectPTIndex  == 0)
    {
      that.setData({
        leftTabIndex:index,
      })
    }

    if(that.data.selectPTIndex  == 1)
    {
      that.setData({
        rightTabIndex:index,
      })
    }
    //动画
    changeAnimationProcess(tabAnimationTime)

    //显示数据
    showPTEC1PL()
  },
  toSelectAddress:function(e)
  {
     util.toselectAddress()
  },
  productdetail:function(e)
  {
    var index = e.currentTarget.dataset.index
    toProductDetail(index)
  },
  BuoyClick: function(e) {
    var index = e.currentTarget.dataset.index
    showBuoyInfo(index)
  },
  //下拉刷新
  onPullDownRefresh: function(){
    clearHomeData()
    getHomeData()

     wx.stopPullDownRefresh()
  },
})

//*****************动画**************//

function initTabAnimation()
{
   //初始化
  animation = wx.createAnimation({
      duration:1000,
      timingFunction: 'ease-in',
  })

  animation.translate(0,0).step()

  that.setData({
    tabAnimationData:animation.export()
  })
}

function changeAnimationProcess(time)
{
  if(that.data.selectPTIndex  == 0)
  {
    // util.showModel('111',that.data.leftTabIndex.toString())
    tabAnimationProcess(that.data.leftTabIndex,time)
  }

  if(that.data.selectPTIndex  == 1)
  {
    tabAnimationProcess(that.data.rightTabIndex,time)
  }
}

function tabAnimationProcess(index,time)
{

  var distance = index * that.data.tabitemwidth
  //util.showModel('111',distance.toString())
  //移动
  animation.translate(distance, 0).step({ duration: time })
  that.setData({
    tabAnimationData:animation.export()
  })
}

function setscrollLeft()
{
  var index = 0
  if(that.data.selectPTIndex  == 0)
  {
    index = that.data.leftTabIndex
  }

  if(that.data.selectPTIndex  == 1)
  {
    index = that.data.rightTabIndex
  }

  var scrollLeft = index * that.data.tabitemwidth
  that.setData({
    scrollLeft:scrollLeft
  })
}

//*****************动画**************//

//***************定位及获取门店****************//

function getLocation()
{
  util.getLocation(getLocationStoreSuccess, getLocationStoreFail,null)
}

function getLocationStoreSuccess(res)
{
  //util.showToast(JSON.stringify(res))
  app.globalData.locationInfo = res

  //获取可配送门店
  util.getGisStore(getGisStoreSuccess,getGisStoreFail,null)

  //util.showToast('nnnn')

  //获取地理位置名称
  searchAddress()
}

//定位失败等，使用默认门店
function getLocationStoreFail(){

  if (app.globalData.locationFailStoreInfo != null)
  {
    app.globalData.storeInfo = app.globalData.locationFailStoreInfo
    that.setData({
      storename: app.globalData.storeInfo.StoreName
    })

    getHomeData()
  }
}

function searchAddress()
{
  var location =  app.globalData.locationInfo
  if(location == null)
  {
    return
  }

  //var data = util.getRequestData()
  var data = {};
  data.Longitude = location.longitude
  data.latitude = location.latitude
  data.type = 1

  util.requestGet('SearchAddressByKeyService',data,searchAddressSuccess,searchAddressFail,null)
}

function searchAddressSuccess(res)
{
  //util.showModel('dd',JSON.stringify(res))
  if(res.data != null && res.data.result && res.data.result.length > 0)
  {
      app.globalData.selectaddress = res.data.result[0].name
      that.setData({
      selectaddress:' 送至:' + app.globalData.selectaddress
    })             
  }
}

function searchAddressFail()
{

}

function getGisStoreSuccess(res)
{
  //console.log(JSON.stringify(res))
  //util.showModel('11','gesg')

  //util.hideLoading()

  if(res.data != null && res.data.Entity != null)
  {
    app.globalData.storeInfo = res.data.Entity
    that.setData({
      storename:app.globalData.storeInfo.StoreName
    })

    getHomeData()
  }
  else
  {
    getLocationStoreFail()
  }
}

function getGisStoreFail()
{
  getLocationStoreFail()
    // that.setData({
    //   storename:'请选择为您服务的门店',
    // })
}

//***************定位及获取门店****************//

//***************获取首页数据****************//

function getHomeData()
{
    //测试
    if(util.isDevelopTest())
    {
      app.globalData.storeInfo.SysNo = 9
    }

    storeSysNo = app.globalData.storeInfo.SysNo
    
    //util.showLoading()
    getPTECT()
}

//获取分类信息
function getPTECT()
{
  var data = {}
  data.StoreSysNo = storeSysNo
  if(app.globalData.customerInfo != null)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }
  
  if(selectPTTypeNo != '')
  {
     data.PTTypeNo = selectPTTypeNo
  }

  if(selectEC1SysNo != '')
  {
    data.EC1SysNo = selectEC1SysNo
  }

  //util.showModel('dd',JSON.stringify(data))
  util.requestGet('GetPTECTService',data,getPTECTSuccess,getPTECTFail,null)
}

function getPTECTSuccess(res)
{
  //util.hideLoading()
  if(res.data != null && res.data.Entity != null)
  {
    if(res.data.Entity.ListPTType != null && res.data.Entity.ListPTType.length  > 0)
    {
      selectPTTypeNo = res.data.Entity.PTTypeNo
      selectEC1SysNo = res.data.Entity.EC1SysNo

      //设置index
      var selectPTIndex = getPTIndex(res.data.Entity.ListPTType)
      var leftTabIndex = getTabIndex(res.data.Entity.ListPTType,0)
      var rightTabIndex = getTabIndex(res.data.Entity.ListPTType,1)
      
      //赋值
      that.setData({
        selectPTIndex:selectPTIndex,
        leftTabIndex:leftTabIndex,
        rightTabIndex:rightTabIndex,
        ListPTType:res.data.Entity.ListPTType
      })

      //动画
      changeAnimationProcess(tabAnimationPTTime)

      //获取商品列表
      showPTEC1PL()
    }
    
    that.setData({
      ListBuoy:res.data.Entity.ListBuoy,
    })
    

    //测试
    //toProductDetail(0)

    //本地数据
    //listPTType = res.data.Entity.ListPTType
    return
  }

  util.showToast('暂无数据',-1)
}

function getPTECTFail()
{
  //util.hideLoading()
}

function getPTIndex(listPTType)
{
  if(listPTType != null && listPTType.length > 0)
  {
    for(var i = 0; i< listPTType.length; i++)
    {
      if(listPTType[i].IsSelected == "1")
      {
        return i
      }
    }
  }

  return 0
}

function getTabIndex(listPTType,index)
{
    if(listPTType != null 
     && listPTType.length > index
     && listPTType[index].ListEC1 != null && listPTType[index].ListEC1.length > 0)
     {
        for(var i = 0; i< listPTType[index].ListEC1.length; i++)
        {
          if(listPTType[index].ListEC1[i].IsSelected == "1")
          {
            return i
          }
        }
     }

     return 0
}

function setSelectTPECSysNo()
{
  if(that.data.selectPTIndex  == 0)
  {
    selectPTTypeNo = that.data.ListPTType[0].PTTypeNo
    selectEC1SysNo = that.data.ListPTType[0].ListEC1[that.data.leftTabIndex].EC1SysNo
  }

  if(that.data.selectPTIndex  == 1)
  {
    selectPTTypeNo = that.data.ListPTType[1].PTTypeNo
    selectEC1SysNo = that.data.ListPTType[1].ListEC1[that.data.rightTabIndex].EC1SysNo
  }
}

function showPTEC1PL()
{
  setSelectTPECSysNo()

  if(that.data.selectPTIndex  == 0)
  {
    var listP = that.data.ListPTType[0].ListEC1[that.data.leftTabIndex].ListProduct
    if(listP != null && listP.length> 0)
    {
      return
    }
  }

  if(that.data.selectPTIndex  == 1)
  {
    var listP = that.data.ListPTType[1].ListEC1[that.data.rightTabIndex].ListProduct
    if(listP != null && listP.length> 0)
    {
      return
    }
  }

  getPTEC1PL()
}

//获取1级分类商品列表
function getPTEC1PL()
{
  //util.showLoading()

  var data = {}
  data.StoreSysNo = storeSysNo
  if(app.globalData.customerInfo != null)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }

  if(that.data.selectPTIndex  == 0)
  {
    data.PTTypeNo = that.data.ListPTType[0].PTTypeNo
    data.EC1SysNo = that.data.ListPTType[0].ListEC1[that.data.leftTabIndex].EC1SysNo
  }

  if(that.data.selectPTIndex  == 1)
  {
    data.PTTypeNo = that.data.ListPTType[1].PTTypeNo
    data.EC1SysNo = that.data.ListPTType[1].ListEC1[that.data.leftTabIndex].EC1SysNo
  }

  //util.showModel('dd',JSON.stringify(data))
  util.requestGet('GetPTEC1PLService',data,getPTEC1PLSuccess,getPTEC1PLFail,null)
}

function getPTEC1PLSuccess(res)
{
  //util.hideLoading()
  if(res.data != null && res.data.Entity != null)
  {
    //selectPTTypeNo = res.data.Entity.PTTypeNo
    setListProduct(res.data.Entity.ListProduct)
    return;
  }

  util.showToast('暂无数据',-1)

}

function getPTEC1PLFail()
{
  //util.hideLoading()
}

function setListProduct(listProduct)
{

  if(that.data.selectPTIndex  == 0)
  {
    var listPTType = that.data.ListPTType
    listPTType[0].ListEC1[that.data.leftTabIndex].ListProduct = listProduct
  
  }

  if(that.data.selectPTIndex  == 1)
  {
    var listPTType = that.data.ListPTType
    listPTType[1].ListEC1[that.data.rightTabIndex].ListProduct = listProduct
  }

  that.setData({
    ListPTType:listPTType
  }) 
}



function clearHomeData()
{
  that.setData({
    ListPTType:null,
    ListBuoy:null
  })
}
//***************获取首页数据****************//

//***************页面跳转****************//

function toProductDetail(index)
{
  var planSysNo = null
  if(that.data.selectPTIndex  == 0)
  {
    planSysNo = that.data.ListPTType[0].ListEC1[that.data.leftTabIndex].ListProduct[index].PlanSysNo
  }

  if(that.data.selectPTIndex  == 1)
  {
    planSysNo = that.data.ListPTType[1].ListEC1[that.data.rightTabIndex].ListProduct[index].PlanSysNo
  }

  if(planSysNo != null)
  {
    wx.navigateTo({
      url: '../group/ptdetail?PlanSysNo=' + planSysNo
    })
  }
}

function showBuoyInfo(index)
{
  if(that.data.ListBuoy == null || that.data.ListBuoy.length < index)
  {
    return
  }

  var buoyInfo = that.data.ListBuoy[index]

  if(buoyInfo == null 
    || buoyInfo.BuoyType == null || buoyInfo.BuoyType.length == 0
			|| buoyInfo.BusinessNo == null || buoyInfo.BusinessNo.length  == 0)
		{
			return;
		}
		
		if(buoyInfo.BuoyType == "1")
		{
			showDeliveryInfo(buoyInfo.BusinessNo)
    }
}

function showDeliveryInfo(soSysNo)
{
  wx.navigateTo({
    url: '../order/orderprocess?soSysNo=' + soSysNo
  })
}

//***************页面跳转****************//

function testimage()
{
  /*
  //选择图片
  wx.chooseImage({
    success: function (res) {

      //util.showModel('11',JSON.stringify(res))
      //获取图片
      wx.getImageInfo({
        src: res.tempFilePaths[0],
        success: function (res) {
          console.log(res.width)
          console.log(res.height)

          util.showModel('22',JSON.stringify(res))
        }
      })

    }
  })
  */
}


  /*
       //本地存储
        wx.setStorage({
          key: 'locationInfo',
          data: res
        })

        wx.getStorage({
          key:'locationInfo',
          success: function(res){
            // success
            //app.showToast('123')
            //app.showToast('3')
            app.showToast(res.data.address)
          }
        })
        */