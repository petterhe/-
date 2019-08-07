//index.js
//获取应用实例
var app = getApp()
var that;
var storeSysNo
var selectECategoryType = ''
var selectEC1SysNo = ''
var selectTabIndex = 0
var animation = null

var uselocationFailStore = false

var firstShow = true //首次打开
var firstLocation = true

var fromApp = 0

var tabitemwidth = 60
const tabitemHeight = 40
const tablineheight = 2
const tabAnimationTime = 100
const tabAnimationPTTime = 0
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

const Sevice_EC1Click ='101012'
const listTopValue = 120

var listViewTop = listTopValue
var listViewMarginTop = listTopValue

var scrollTimer
var lastScrollTop = 0
var invitationCode

var tabcolnum = 7//1行显示6个
var scene

var isLoading = false
//var listFirstPage = null
var submitObject = new Object()

//const useFirstPage = 0

var listEC1 = null //本地记录数据

Page({
  data: {
    tabitemwidth: tabitemwidth,
    windowWidth:0,
    selectaddress:'',
    storename:'',
    ListEC1:null,
    ec1item:null,
    EC1_intoView:'',
    groupIndex:-1,
    selectTabIndex:0,
    ListBuoy:null,
    tabAnimationData:{},
    listHeight:1000,
    listViewTop: listViewTop,
    // scrollLeft:0,

    ec1view_margintop:0,
    // ec2view_margintop:0,
    listViewMarginTop: listViewMarginTop,

    XiaoShiType: 1,
    ShoppingCart:1,
    PT:2,
    SeeView:3,
    JingXuanType:5,

    indicatorDots: false,
    autoplay: false,
    swiperDuration:500,
    isIPhone: false,//解决IPhone屏幕高度包含底部状态栏问题

    InvitationNew:'1',
    HeadFreeCouponINew:'3',

    ExpressDelivery:1,
    HomeDelivery:2,

    StarImgUrl: appconst.StarImgUrl,

    canLaunchApp: util.canLaunchApp(),
    fromApp: fromApp,

  },
  onLoad: function (options) {
    console.log('onLoad')

    //设置分享
    util.showShareMenu()

    that = this
    listEC1 = null

    storeSysNo = 0
    animation = null

    selectECategoryType = ''
    selectEC1SysNo = ''

    uselocationFailStore = false

    firstShow = true
    firstLocation = true
    fromApp = 0

    isLoading = false
    //listFirstPage = null

    //listViewTop = 120//空白view
    var height = util.getScrollHeight(listViewTop)// - listViewTop
    var windowWidth = app.globalData.systemInfo.windowWidth

    if (windowWidth < 300) {
      tabcolnum = 6
    }

    if (windowWidth >= 350)
    {
      tabcolnum = 8
    }

    if (windowWidth >= 400) {
      tabcolnum = 9
    }

    tabitemwidth = (windowWidth - 20) / tabcolnum,

    that.setData({
      storename: '正在定位分店',
      listHeight: height,
      listViewTop: listViewTop,
      listViewMarginTop: listViewMarginTop,
      isIPhone: util.isIPhone(),
      XiaoShiType: appenum.GroupBuyType.XiaoShi.Value,
      ShoppingCart: appenum.BuyType.ShoppingCart.Value,
      PT: appenum.BuyType.PT.Value,
      SeeView: appenum.BuyType.SeeView.Value,
      tabitemwidth: tabitemwidth,
      windowWidth: windowWidth,
      tabcolnum: tabcolnum,
      tablinetop: tabitemHeight - tablineheight,
      tablineleft: 0,
      showReloadView:false,
      InvitationNew: appenum.PTScenarioType.InvitationNew.Value.toString(),
      HeadFreeCouponINew: appenum.PTScenarioType.HeadFreeCouponINew.Value.toString(),

      ExpressDelivery:appenum.ShipType.ExpressDelivery.Value,
      HomeDelivery:appenum.ShipType.HomeDelivery.Value,
    })

    
    //获取参数
    if (!(options.selectECategoryType == undefined))
    {
      selectECategoryType = options.selectECategoryType
    }

    if (!(options.SelectECategoryType == undefined))     {
      selectECategoryType = options.SelectECategoryType
    }

    if (!(options.selectEC1SysNo == undefined))
    {
      selectEC1SysNo = options.selectEC1SysNo
    }

    if (!(options.SelectEC1SysNo == undefined)) 
    {
      selectEC1SysNo = options.SelectEC1SysNo
    }

    //其他页面跳转过来分类
    if (app.globalData.changeHomeECType) {
      if (app.globalData.selectECategoryType != null && app.globalData.selectECategoryType.length > 0) {
        selectECategoryType = app.globalData.selectECategoryType
      }

      if (app.globalData.selectEC1SysNo != null && app.globalData.selectEC1SysNo.length > 0) {
        selectEC1SysNo = app.globalData.selectEC1SysNo
      }

      app.globalData.changeHomeECType = false
      app.globalData.selectECategoryType = null
      app.globalData.selectEC1SysNo = null
    }
  
    invitationCode = ""
    if (!(options.InvitationCode == undefined)) {
      invitationCode = options.InvitationCode
      // util.saveInvitationCode(invitationCode)
    }
    
    if (!(options.FromApp == undefined)) {
      fromApp = options.FromApp
    }

    that.setData({
      fromApp: fromApp
    })

    //scene 处理
    scene = ""
    if (!(options.scene == undefined)) {
        scene = options.scene
    }

    refreshHome()

    //延迟10秒显示重新加载
    //setTimeout(showReloadView, 10*1000)
  },
  onShow: function() {
    console.log('onShow')

    // if (app.globalData.refreshuserInfo) {
    //   app.globalData.refreshuserInfo = false
    //   return
    // }

    /*
    if (app.globalData.loginphonesuccess) {

      if (app.globalData.locationFailStoreInfo == null) {
        getLocation()
      }
      app.globalData.loginphonesuccess = false
      return
    }


    if (app.globalData.refreshuserLocation) {
      if (app.globalData.scopeuserLocation)
      {
        firstLocation = true
        getLocation()
      }
      else{
        getLocationStoreFail()
      }
      app.globalData.refreshuserLocation = false
      return
    }
    */

    if (!firstLocation && app.globalData.storeInfo == null) {
      getLocation()
      return
    }

    if (!firstShow && that.data.ListEC1 == null)
    {
      refreshHome()
      return
    }

    //非首次打开
    firstShow = false

    if(app.globalData.changeStore)
    {
      uselocationFailStore = false

      if (app.globalData.storeInfo != null && app.globalData.storeInfo.StockSaleType == 103) {
        addressMemo = ''
      }
      else
      {
        var addressMemo = '送至:' + app.globalData.selectAddress
        if (app.globalData.selectAddress == null || app.globalData.selectAddress.length == 0)
        {
          addressMemo = ''  
        }
      }

      that.setData({
        selectaddress: addressMemo,
        storename:app.globalData.storeInfo.StoreName
      })

      app.globalData.changeStore = false
      app.globalData.selectAddress= null

      if (app.globalData.storeInfo != null 
        && app.globalData.storeInfo.SysNo != storeSysNo)
      {
        clearHomeData()
        getHomeData()
      }

      return
    }

    //更新购物车红点
    util.showTabBarCartCount()

    //指向特价 当首页为拼团时 指向特价
    if (app.globalData.changeHomeSpecial && selectECategoryType == '6') {
      var index = getTabIndexByCategoryType('5')

      if (index >= 0) {
        that.setData({
          selectTabIndex: index,
        })
      }

      app.globalData.changeHomeSpecial = false
      return
    }


    if (app.globalData.changeHomeECType){

      if (app.globalData.selectECategoryType == null || app.globalData.selectECategoryType.length ==0){
        return
      }

      if (app.globalData.selectEC1SysNo == null || app.globalData.selectEC1SysNo.length == 0) {
        return
      }
      
      var index = getTabIndexByType(app.globalData.selectECategoryType
        , app.globalData.selectEC1SysNo)
      
      if(index >= 0)
      {
        // that.setData({
        //   selectTabIndex: index,
        // })
        EC1Change(index)
      }

    
      app.globalData.changeHomeECType = false
      app.globalData.selectECategoryType = null
      app.globalData.selectEC1SysNo = null
      return
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
    //var path = that.route
    var path = 'pages/home/index'
    setSelectECSysNo()

    if(selectECategoryType != '')
    {
      path = path + '?SelectECategoryType=' + selectECategoryType

      if (selectEC1SysNo != '') {
        path = path + '&SelectEC1SysNo=' + selectEC1SysNo
      }
    }

    //获取首个二级分类的分享术语
    var title = getEC2ShareTitle()

    if (title == null || title.length == 0) {
      //获取分享术语
      title = util.getShareTitle()
    }
    
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
        else {
          util.saveNoTicketShareInfo(path, appenum.WXOpenShareLogType.Share.Value)
        }
      },
      fail: function (res) {
      }
    }
  },
  ec1change:function(e)
  {
    var index = e.currentTarget.dataset.index
    
    
    if (isLoading) 
    {
      wx.showToast({
        title: '操作太快了,请先歇一歇吧^-^',
        icon: 'none',
        duration:500,
      })
      return
    }

    loadingProcess(true)

    EC1Change(index)
  },
  ec2change: function (e) {
    var index = e.currentTarget.dataset.index

    //var listEC1 = that.data.ListEC1
    var i = that.data.selectTabIndex

    if (listEC1[i].ListEC2 != null && listEC1[i].ListEC2.length > index)
    {

      /*
      listEC1[i].IntoView = 'EC2_' + listEC1[i].ListEC2[index].EC2SysNo
    }
    listEC1[i].selectEC2Index = index

    that.setData({
      ListEC1: listEC1,
    })
    */

      var intoView = 'ec1item.IntoView'
      var selectEC2Index = 'ec1item.selectEC2Index'

      that.setData({
        [intoView]: 'EC2_' + listEC1[i].ListEC2[index].EC2SysNo,
        [selectEC2Index]: index
      })
    }
  },
  toSelectAddress:function(e)
  {
     util.toselectAddress()
  },
  toSearch: function (e) {
    util.toSearch()
  },
  planDetail:function(e)
  {
    var planSysNo = e.currentTarget.dataset.plansysno
    util.toPTDetail(planSysNo)
  },
  productDetail: function (e) {
    var productSysNo = e.currentTarget.dataset.productsysno
    util.toProductdetail(productSysNo)
  },
  addCart: function (e) {
    var productSysNo = e.currentTarget.dataset.productsysno
    addCart(productSysNo)
  },
  BuoyClick: function(e) {
    var index = e.currentTarget.dataset.index
    showBuoyInfo(index)
  },
  fansClick: function (e) {
    util.toFansGroup()
  },
  swiperchange: function (e) {
    var index = e.detail.current

    // if (!util.checkReSubmit(submitObject,30*1000)) 
    // {
    //   return
    // }
    //if (e.detail.source == 'touch') {
      
      /*
       that.setData({
        selectTabIndex: index,
      })

      //动画
      changeAnimationProcess(tabAnimationTime)

      //显示数据
      showEC1Product()
      */
    //}
  },
  //下拉刷新
  onPullDownRefresh: function(){
    
    if (app.globalData.storeInfo == null)
    {
      return
    }

    clearHomeData()
    getHomeData()

     wx.stopPullDownRefresh()
  },
  refreshData:function(e)
  {
    refreshHome()
  },
  onScroll: function (e) {
    // Do something when page scroll
    //暂时不做悬浮隐藏
    /*
    if(scrollTimer)
    {
      clearTimeout(scrollTimer)
    }

    var marginTop = 0
    var listViewTop = listTopValue
    var scrollTop = e.detail.scrollTop
    if (scrollTop > 200)
    {
      marginTop = -1 * listTopValue
      listViewTop = 0;
    }
    
    if (marginTop != that.data.ec1view_margintop)
    {
      that.setData({
        ec1view_margintop: marginTop,
        listViewMarginTop: listViewTop
      })
    }

    scrollTimer = setTimeout(function () {
      that.setData({
        ec1view_margintop: 0,
        listViewMarginTop: listTopValue,
      })
    }, 600)
    */
    
  },
})

function EC1Change(index)
{

  that.setData({
    selectTabIndex: index,
    EC1_intoView: 'EC1_' + index,
  })

  //动画
  changeAnimationProcess(tabAnimationTime)

  //显示数据
  showEC1Product()
}

function refreshHome()
{
  // if (app.globalData.customerInfo == null)
  // {
  //   //延迟3秒刷新数据
  //   setTimeout(refreshHome, 3 * 1000)
  //   return
  // }

  try {
    if (scene != null && scene.length > 0) {
      if (!getSceneInfo()) {
        return
      }
    }

    if (!invitationCodeProcess())
    {
      return
    }
  }
  catch (e) {
    console.log(e)
  }

  /*
  if (app.globalData.storeInfo == null) {
    if (firstLocation) {
      getLocation()
      firstLocation = false
    }
    else {
      getLocationStoreFail()
    }
    return
  }*/

  if (app.globalData.storeInfo == null) {
    getLocation()
    firstLocation = false
    return
  }

  that.setData({
    storename: app.globalData.storeInfo.StoreName
  })

  getHomeData()
  //检索附件地址
  searchAddress()

  initTabAnimation()
}

function showReloadView() {
  that.setData({
    showReloadView: true
  })
}

function hideReloadView() {
  that.setData({
    showReloadView: false
  })
}
//*****************动画**************//

function initTabAnimation()
{
  
   //初始化
  animation = wx.createAnimation({
      duration:300,
      timingFunction: 'ease-in',
  })

  animation.translate(0,0).step()

  that.setData({
    tabAnimationData:animation.export()
  })
  
}

function changeAnimationProcess(time)
{
  tabAnimationProcess(that.data.selectTabIndex,time)
}

function tabAnimationProcess(index,time)
{
  var colX = index
  var rowY = 1
  // if (colX >= tabcolnum) {
  //   colX = index - tabcolnum
  //   rowY = 2
  // }

  var tablinetop = tabitemHeight * rowY - tablineheight
  var tablineleft = colX * that.data.tabitemwidth

  that.setData({
    tablinetop: tablinetop,
    tablineleft: tablineleft,
  })

  /*
  var moveX = index
  var moveY = 0
  if (moveX >= tabcolnum)
  {
    moveX = index - tabcolnum
    moveY = tabitemHeight
  }
  var distanceX = moveX * that.data.tabitemwidth
  //util.showModel('111',distance.toString())
  //移动
  // animation.translateY(moveY).step()
  // animation.translateX(distanceX).step({ duration: time })
  animation.translate(distanceX, moveY).step({ duration: time })
  that.setData({
    tabAnimationData:animation.export()
  })
  */
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
}

//定位失败等，使用默认门店
function getLocationStoreFail(){

  if (app.globalData.locationFailStoreInfo != null)
  {
    app.globalData.storeInfo = app.globalData.locationFailStoreInfo
    
    uselocationFailStore = true

    that.setData({
      storename: app.globalData.storeInfo.StoreName,
      selectaddress:'',
    })

    getHomeData()
  }
  else{
    util.toselectAddress()
  }
}

function searchAddress()
{
  //自提店不显示送至
  if (app.globalData.storeInfo != null && app.globalData.storeInfo.StockSaleType == 103)
  {
    return
  }

  var location =  app.globalData.locationInfo
  if(location == null)
  {
    return
  }

  uselocationFailStore = false

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
      if (!uselocationFailStore)
      {
        that.setData({
        selectaddress:' 送至:' + app.globalData.selectaddress
        })  
      }           
  }
}

function searchAddressFail()
{

}

function getGisStoreSuccess(res)
{
  //console.log(JSON.stringify(res))
  //util.showModel('11', JSON.stringify(res))
  //util.hideLoading()

  if(res.data != null && res.data.Entity != null)
  {
    app.globalData.storeInfo = res.data.Entity
    
    that.setData({
      storename:app.globalData.storeInfo.StoreName
    })

    //获取地理位置名称
    searchAddress()

    getHomeData()

    util.setCityInfo()
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
    // //测试
    // if(util.isDevelopTest())
    // {
    //   //app.globalData.storeInfo.SysNo = 9
     
    // }

  storeSysNo = app.globalData.storeInfo.SysNo

  loadingProcess(true)
  getECList()
}

//获取分类信息
function getECList()
{
  var data = {}
  data.StoreSysNo = storeSysNo
  if(app.globalData.customerInfo != null)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }
  
  if(selectECategoryType != '')
  {
    data.ECategoryType = selectECategoryType
  }

  if(selectEC1SysNo !='')
  {
    data.EC1SysNo = selectEC1SysNo
  }

  //util.showModel('dd',JSON.stringify(data))
  util.requestGet('GetECListService', data, getECListSuccess,getECListFail,null)
}

function getECListSuccess(res)
{
  //util.hideLoading()
  if(res.data != null && res.data.Entity != null)
  {
    if (res.data.Entity.ListEC1 != null && res.data.Entity.ListEC1.length  > 0)
    {
      selectECategoryType = res.data.Entity.CurrentECType
      selectEC1SysNo = res.data.Entity.CurrentEC1No

      listEC1 = res.data.Entity.ListEC1
      selectTabIndex = getTabIndex(listEC1)

      var groupIndex = getGroupIndex(listEC1)

      //设置首屏拉取标志
      //initListFirstPage(res.data.Entity.ListEC1.length)

      //listViewTop = 80
      // if (listEC1.length <= 6)
      // {
      //   listViewTop = 40
      // }
      //var height = util.getScrollHeight(0)
      
      //赋值
      that.setData({ 
        ListEC1: listEC1,
        EC1_intoView: 'EC1_' + selectTabIndex,
        //listHeight: height,
        //listViewTop: listViewTop,
        selectTabIndex: selectTabIndex,
        // scrollLeft: selectTabIndex * tabitemwidth,
        groupIndex: groupIndex,
      })

      //动画
      changeAnimationProcess(tabAnimationPTTime)

      //获取商品列表
      showEC1Product()

      //隐藏重新加载
      hideReloadView()
    }
    
    //显示购物车数量
    app.globalData.ShoppingCartCount = res.data.Entity.ShopCartCount
    util.showTabBarCartCount()
    
    that.setData({
      ListBuoy:res.data.Entity.ListBuoy,
    })
    
    loadingProcess(false)
    return
  }

  loadingProcess(false)
  util.showToast('暂无数据',-1)
}

function getECListFail()
{
  //util.hideLoading()
  loadingProcess(false)
}

function getTabIndex(listEC1) {
  if (listEC1 != null
    && listEC1.length > 0) {
    for (var i = 0; i < listEC1.length; i++) {
      if (listEC1[i].IsSelected == "1") {
        return i
      }
    }
  }

  return 0
}

function getGroupIndex(listEC1) {
  if (listEC1 != null
    && listEC1.length > 0) {
    for (var i = 0; i < listEC1.length; i++) {
      if (listEC1[i].ECategoryType == "6") {
        return i
      }
    }
  }

  return 0
}

function getTabIndexByType(eCategoryType, eC1SysNo)
{

  var listEC1 = that.data.ListEC1
  if (listEC1 != null && listEC1.length > 0)
  {
    for (var i = 0; i < listEC1.length; i++)
    {
      if (listEC1[i].ECategoryType == eCategoryType && that.data.ListEC1[i].EC1SysNo == eC1SysNo)
      {
            return i
      }
    }
  }

  return -1
}

function getTabIndexByCategoryType(eCategoryType) {

  var listEC1 = that.data.ListEC1
  if (listEC1 != null && listEC1.length > 0) {
    for (var i = 0; i < listEC1.length; i++) {
      if (listEC1[i].ECategoryType == eCategoryType) {
        return i
      }
    }
  }

  return -1
}

function setSelectECSysNo() {
  var i = that.data.selectTabIndex
  selectECategoryType = that.data.ListEC1[i].ECategoryType
  selectEC1SysNo = that.data.ListEC1[i].EC1SysNo
}

function showEC1Product()
{
  setSelectECSysNo()

  //上报日志
  reportClick()
  
  that.setData({
    EC1_intoView: 'EC1_' + that.data.selectTabIndex,
  })

  var listEC2 = listEC1[that.data.selectTabIndex].ListEC2
  if (listEC2 != null && listEC2.length> 0)
  {
    setListProduct(listEC1[that.data.selectTabIndex])
    loadingProcess(false)
    return
  }

  getEC1Product()
}

//获取1级分类商品列表
function getEC1Product()
{
  //util.showLoading()

  var data = {}
  data.StoreSysNo = storeSysNo
  if(app.globalData.customerInfo != null)
  {
    data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  }

  
  data.ECategoryType = selectECategoryType
  data.EC1SysNo = selectEC1SysNo

  /*
  if (useFirstPage == 1)
  {
    if (listFirstPage != null && listFirstPage.length > that.data.selectTabIndex)
    {
      //是否首屏
      data.FirstPage = listFirstPage[that.data.selectTabIndex]
    }
  }*/
  

  //util.showModel('dd',JSON.stringify(data))
  // var myDate = new Date().getTime();
  // console.log(myDate)

  util.requestGet('GetECProductService', data, getEC1ProductSuccess, getEC1ProductFail, null)
  //util.requestGet('GetECProductNewService',data,getEC1ProductSuccess,getEC1ProductFail,null)
}

function getEC1ProductSuccess(res)
{
  // var myDate = new Date().getTime();
  // console.log(myDate)
  
  if (res.data != null && res.data.Entity != null) {
    //selectECategoryType = res.data.Entity.PTTypeNo
      
    var isAllData = 1
    if(res.data.Entity.IsAllData != undefined)
    {
      isAllData = res.data.Entity.IsAllData
    }

    setListProduct(res.data.Entity)

    /*
    if (useFirstPage ==1 && listFirstPage != null && listFirstPage.length > that.data.selectTabIndex)
    {
      //获取完首屏 继续获取全部数据
      if (listFirstPage[that.data.selectTabIndex] == 1)
      {
        listFirstPage[that.data.selectTabIndex] = 0
        //接口数据非全部数据 获取后续数据
        if (isAllData != 1) {
          getEC1Product()
        }
      }
    }*/

    loadingProcess(false)
    return;
  }

  util.showToast('暂无数据', -1)
  loadingProcess(false)
  return

  /*
  if (res.data != null && res.data.Entity != null && res.data.Entity.ECPZip != null && res.data.Entity.ECPZip.length > 0)
  {
    //selectECategoryType = res.data.Entity.PTTypeNo
    var dto = JSON.parse(util.unzip(res.data.Entity.ECPZip))
    myDate = new Date().getTime();
    console.log(myDate)
    if(dto != null)
    {
      setListProduct(dto)
      return;
    }
  }

  util.showToast('暂无数据',-1)
  */
}

function getEC1ProductFail()
{
  //util.hideLoading()
  loadingProcess(false)
}

/*
function initListFirstPage(length)
{
  listFirstPage = new Array()
  for (var i = 0; i < length; i++) {
    listFirstPage[i] = 1
  }
}*/


function reportClick() {
  var businessNo = selectEC1SysNo
  //拼团 6
  if (selectECategoryType == '6') {
    businessNo = -1
  }

  //特价 5
  if (selectECategoryType == '5') {
    businessNo = -2
  }

  //日志上报
  util.reportClick(Sevice_EC1Click, businessNo, null, null)
}

function setListProduct(ec1Product)
{
  if (listEC1 == null || listEC1.length == 0)
  {
    return
  }

  var selectTabIndex = that.data.selectTabIndex
  var selectEC1 = listEC1[selectTabIndex]
  if (selectEC1 == null || ec1Product.ListEC2 == null 
    || ec1Product.ListEC2.length == 0)
  {
    return
  }

  var k = selectTabIndex 
  listEC1[k].ListEC2 = ec1Product.ListEC2

  /*
  //校验当前页是否中
  if (selectEC1.EC1SysNo == ec1Product.EC1SysNo)
  {
    var i = selectTabIndex;
    
    listEC1[i].ListEC2 = ec1Product.ListEC2
  }
  else
  {
    //轮询获取刷新数据
    for (var i = 0; i < listEC1.length;i++)
    {
      selectEC1 = listEC1[i]
      if (selectEC1.EC1SysNo == ec1Product.EC1SysNo)        {
        selectTabIndex = i
        listEC1[i].ListEC2 = ec1Product.ListEC2
        break;
      }
    }
  }
  */
  
  var k = selectTabIndex 
  //计算二级分类名称宽度 及 scroll-view 宽度
  listEC1[k].EC2GroupLength = 5
  if (listEC1[k].ListEC2 != null && listEC1[k].ListEC2.length > 0) 
  {
    listEC1[k].IntoView = 'EC2_' + listEC1[k].ListEC2[0].EC2SysNo

    listEC1[k].selectEC2Index = 0

    for (var j = 0; j < listEC1[k].ListEC2.length; j++) {
      var len = GetEC2Length(listEC1[k].ListEC2[j].EC2Name)
      listEC1[k].ListEC2[j].EC2NameLength = len
      listEC1[k].EC2GroupLength += len + 10
    }
  }
  
  // that.setData({
  //   ListEC1: listEC1
  // }) 
  // return

  /*
  if (listFirstPage[k] == 1)
  {
    var selectEC1 = 'ListEC1[' + k + ']'
    that.setData({
      [selectEC1]: listEC1[k]
    })
  }
  else
  {
    for (var idx in listEC1[k].ListEC2) {
      
      if (idx == 0 && listFirstPage[k] == 0)
      {
        continue;
      }
      var selectEC2 = 'ListEC1[' + k + '].ListEC2[' + idx + ']'

      that.setData({
        [selectEC2]: listEC1[k].ListEC2[idx]
      });
    }
  }*/

  var ec1item = that.data.ListEC1[k]
  ec1item.selectEC2Index = 0

  that.setData({
    ec1item: ec1item
  });

  for (var idx in listEC1[k].ListEC2) {

    /*
    if (useFirstPage && idx == 0 && listFirstPage[k] == 0) {
      continue;
    }*/
    var selectEC2 = 'ec1item.ListEC2[' + idx + ']'

    that.setData({
      [selectEC2]: listEC1[k].ListEC2[idx],
    });
  }

  /*
  for (var idx in listEC1[k].ListEC2) {
    var selectEC2 = 'ListEC1[' + k + '].ListEC2[' + idx + ']'

    that.setData({
      [selectEC2]: listEC1[k].ListEC2[idx]
    });
  }
  */
}


function getEC2ShareTitle()
{
  var i = that.data.selectTabIndex
  var ec1Data = listEC1[i]
  if (ec1Data != null && ec1Data.ListEC2 != null && ec1Data.ListEC2.length > 0)
  {
    return ec1Data.ListEC2[0].ShareTitle
  }

  return null
}

function clearHomeData()
{
  that.setData({
    ListEC1:null,
    ec1item:null,
    ListBuoy:null
  })
}

function GetEC2Length(str)
{
  return util.GetStrLen(str) *7 + 10;
}
//***************获取首页数据****************//

//***************页面跳转****************//

// function toPTDetail(planSysNo)
// {
//   if (planSysNo != null && planSysNo.length > 0)
//   {
//     wx.navigateTo({
//       url: '../group/ptdetail?PlanSysNo=' + planSysNo
//     })
//   }
// }

function toPTGMDetail(planSysNo, gmsysNo) {
  var url = '../group/ptgmdetail?PlanSysNo=' + planSysNo + "&GMSysNo=" + gmsysNo + '&SelectType=1'
  wx.navigateTo({
    url: url
  })
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

//***************加入购物车**************//
function addCart(sysNo) {
  util.addCart(sysNo, addCartSuccess, addCartFail, null)
}

function addCartSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    app.globalData.ShoppingCartCount = res.data.Entity.ShoppingCartCount

    util.showTabBarCartCount()
    
    that.setData({
      ShoppingCartCount: app.globalData.ShoppingCartCount
    })

    util.showToast('加入购物车成功')
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function addCartFail() {

}
//***************加入购物车**************//

//***************解析scene**************//
function getSceneInfo()
{
  // scene = T:0, AN:00022 //首页 地址台卡
  // scene = T:0, IC:00022 //首页 邀请码
  //scene = T:0, ET:2:EC1: 4 //首页-分享 ET:ECategoryType EC1:SelectEC1SysNo
  // scene = T:1, PN:1032 //团详情
  // scene = T:2, PN:1032, GN:1362 //团单详情
  // scene = T:3, PN:860 //商品详情
  // scene = T:4, IC:00022 //绑定手机
  // scene = T:5//开票
  // scene = T:6,AN:269,BN:591,SN:1900 //领取红包 A活动号 B批次号 S订单号
  // scene = T:7,SN:844//果吧
  // scene = T:8//退款

  try
  {
    // if (app.globalData.customerInfo == null) {
    //   //延迟3秒刷新数据
    //   setTimeout(getSceneInfo, 3 * 1000)
    //   return
    // }

    var openType = 0
    var dScene = ''

    //包含特殊符号时，需解码
    if(scene.indexOf("%"))
    {
      dScene = decodeURIComponent(scene)
    }
    else
    {
      dScene = scene
    }

    scene = ""//此时可以清空了

    util.saveNoTicketShareInfo(dScene, appenum.WXOpenShareLogType.Scene.Value)

    var strScenes = dScene.split(",")
    if (strScenes != null && strScenes.length > 0) {
      openType = getSceneObject(strScenes, "T")

      if (openType == null) {
        openType = 0
      }

      //首页
      if (openType == 0) {

        //邀请码
        invitationCode = getSceneObject(strScenes, "IC")
        if(!invitationCodeProcess())
        {
          return false
        }

        //地址台卡
        // var addressNo = getSceneObject(strScenes, "AN")
        // if (addressNo != null && addressNo.length > 0) {
        //   util.saveInvitationCode(addressNo)
        //   return true
        // }
        
        //分类
        selectECategoryType = getSceneObject(strScenes, "ET")
        selectEC1SysNo = getSceneObject(strScenes, "EC1")
        return true
      }

      //团详情
      if (openType == 1) {

        var planSysNo = getSceneObject(strScenes, "PN")
        if (planSysNo != null && planSysNo.length > 0) {
          util.toPTDetail(planSysNo)
          return false
        }
        return true
      }

      //团单详情
      if (openType == 2) {

        var planSysNo = getSceneObject(strScenes, "PN")
        var gmSysNo = getSceneObject(strScenes, "GN")

        if (planSysNo != null && planSysNo.length > 0
          && gmSysNo != null && gmSysNo.length > 0) {
          toPTGMDetail(planSysNo, gmSysNo)
          return false
        }
        return true
      }

      //商品详情
      if (openType == 3) {

        var pSysNo = getSceneObject(strScenes, "PN")
        if (pSysNo != null && pSysNo.length > 0) {
          util.toProductdetail(pSysNo)
          return false
        }

        return true
      }

      //绑定手机
      if (openType == 4) {

        //邀请码
        invitationCode = getSceneObject(strScenes, "IC")
        return invitationCodeProcess()
      }

      //开票
      if (openType == 5) {
        wx.navigateTo({
          url: '../invoice/myinvoice'
        })
        return false
      }

      //领红包
      if (openType == 6) {
        
        var ActiveSysNo = getSceneObject(strScenes, "AN")
        var BatchNo = getSceneObject(strScenes, "BN")
        var SOSysNo = getSceneObject(strScenes, "SN")
        if (ActiveSysNo != null && ActiveSysNo.length > 0) {

          var url = '../people/couponreceive?ActiveSysNo=' + ActiveSysNo

          if (BatchNo != null && BatchNo.length > 0)         
          {
            url = url + '&BatchNo=' + BatchNo
          }

          if (SOSysNo != null && SOSysNo.length > 0) {
            url = url + '&SOSysNo=' + SOSysNo
          }

          wx.navigateTo({
            url: url
          })
          return false
        }

        return true
      }

      //果吧
      if (openType == 7) {
        var pSysNo = getSceneObject(strScenes, "SN")
        if (pSysNo != null && pSysNo.length > 0) {
          util.toBarDetail(pSysNo)
          return false
        }

        return true
      }

      //退款
      if (openType == 8) {
        wx.navigateTo({
          url: '../refund/index'
        })
        return false
      }

      //收银打开
      if (openType == 9) {

        //收银机编号
        //var pNo = getSceneObject(strScenes, "PN")
        //return shouYinProcess(pNo)
      }

      //助力
      if (openType == 10) {
        var aSysNo = getSceneObject(strScenes, "AN")
        if (aSysNo) {
          util.toGiveHelp(aSysNo)
          return false
        }
      }
    }
  }
  catch(e)
  {
    console.log(e)
    return false
  }
}

function invitationCodeProcess()
{
  if (invitationCode != null && invitationCode.length > 0) {

    //保存邀请码并打开邀请页面
    var code = invitationCode
    invitationCode = null

    util.saveInvitationCode(code)

    /*
    if (util.isTempCustomer()) {
      util.saveInvitationCode(code)
      util.openShareApp(code)
      return false
    }*/
  }
  return true
}

function getSceneObject(strScenes,key)
{
  for (var i = 0; i < strScenes.length; i++) {
    var obj = strScenes[i]
    var objs = obj.split(':')

    if (objs != null && objs.length > 1) {

      for (var j = 0; j < objs.length; j= j+2)
      {
        if (objs[j] == key) {
          return objs[j + 1]
        }
      }
    }
  }
  return null
}
//***************解析scene**************//

//***************收银Open**************//
function shouYinProcess(pNo) {
  if (pNo != null && pNo.length > 0) {
    //绑定手机 登录收银
    if (util.isTempCustomer()) {

      wx.navigateTo({
        url: '../people/loginphone?FromPage=1&FromShouYin=1&PNo=' + pNo,
      })
      return false
    }
    else
    {
      //上报收银服务
      util.ReportShouYinLogin(pNo)
    }
  }
  return true
}
//***************收银Open**************//


//*********** 处理中 **************//

function loadingProcess(isShow)
{
  
  if (isShow)
  {
    isLoading = true
    wx.showLoading({
      title:'请稍候...'
    })
  }
  else
  {
    setTimeout(function(){
      isLoading = false
    },2000)
    wx.hideLoading()
  }
}

//*********** 处理中 **************//

function test() {
  wx.navigateTo({
    url: '../invoice/myinvoice'
  })
}

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