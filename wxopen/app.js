//app.js
var that
// var logincode
// var userinfo
// var failCount = 0

const util = require('/utils/util.js')
const applogin = require('/utils/applogin.js')
const appenum = require('/utils/appenum.js')
const appconst = require('/utils/appconst.js')

// var userInfo_key = appconst.userInfo_key
// var sysDataConfig_key = appconst.sysDataConfig_key

// var appUserSysNo
// var wxOpenUserSysNo
// var fromApp
// var launchshareTicket
// var launchpath

App({
  onLaunch: function (options) {

    /*
    wx.navigateToMiniProgram({
      appId: 'wx3f786e322cdde149',
      path: 'pages/home/index',
      extraData: {
        foo: 'bar'
      },
      envVersion: 'release',
      success(res) {
        // 打开成功
      }
    })
    */

    

    that = this

    // appUserSysNo= null
    // wxOpenUserSysNo = null
    // fromApp = null
    // launchshareTicket = null
    // launchpath = null

    //记录启动项
    that.globalData.launchOptions = options

    //初始化app
    initApp()

    //util.testPromise(6).then(testuccess, testFail);
  },
  globalData:{
    launchOptions:null,
    logincode:null,

    userInfo:null,
    customerInfo:null,
    locationInfo: null,
    storeInfo:null,
    systemInfo:null,
    networkType:null,
    ShoppingCartCount:0,
    changeStore:false,
    selectAddressSysNo:0,
    selectAddress:null,
    searchAddressInfo:null,
    deliveryAddressSysNo:0,
    isEditAddress:false,
    isEditSelectAddress: false,
    shareTitleList:null,
    fromShareTicket:null,//来源分享标签
    fromOpenGId:null,//来源群
    fromUserSysNo:null,//来源用户
    confirmCardCoupon:null,//结算页红包列表
    selectCouponInfo:null,//选中红包
    locationFailStoreInfo:null,//定位失败门店    
    loginphonesuccess:false,
    showRegCouponView: false,
    invitationCode:null,//邀请码 记录客户扫描
    areaID: 2622,//用于显示城市
    areaName: '上海市',//用于显示城市

    //红包去使用需要用到
    changeHomeECType: false,//首页切换分类，目前红包去使用需要用到
    selectECategoryType:null,
    selectEC1SysNo:null,
    changeHomeSpecial: false,//首页切换分类,指向特价
    showListPTInfo:null,//list页数据，目前红包去使用需要用到
    showListPTProductInfo: null,//list页Product数据，目前红包去使用需要用到

    ReportAppealItem:null,//提交申诉用到
    AppealDetailInfo:null,//申诉详情用到

    returnWxNo:'mshapple',
    sysDataConfig:null,

    isAddInvoice:false,//新增开票申请

    submitSelectStoreInfo:null,//提交订单时自提选择门店
    submitSelectStore: false,//提交订单时自提选择门店
    webviewUrl:null,//网页版地址

    isIpx:false,

    SDKVersion:0,//基带版本库
    
    userloginflag: 0,//用户登录标记 -1 失败 0 未执行 1 成功
    refreshuserInfo:false,
    scopeuserInfo: false,
    refreshuserLocation:false,
    scopeuserLocation: false,
    refresinvoiceTitle:false,
    scopeinvoiceTitle: false,
    //tt:null

    notBindUserToApp:false,//拒绝绑定用户到APP用户
  }
})

function initApp() {
  
  //初始化
  util.initApp(that)

  if (wx.getSetting) {
    wx.getSetting({
      success: function (res) {
        if (res.authSetting["scope.userInfo"]) {
          that.globalData.scopeuserInfo = true
        }

        if (res.authSetting["scope.userLocation"]) {
          that.globalData.scopeuserLocation = true
        }

        if (res.authSetting["scope.invoiceTitle"]) {
          that.globalData.scopeinvoiceTitle = true
        }

      },
    })
  }


  //读取邀请码
  util.getInvitationCode()


  applogin.initApp(that)

  //获取系统信息
  applogin.getSystemInfo()

  //初始化网络
  applogin.getNetworkType()

  applogin.getShareInfo()

  //登录
  applogin.login()

  //获取默认门店
  applogin.getDefualStore()

  //获取系统配置
  applogin.getSysDataConfig()

}

/*
function testuccess(res) {
  console.log(res);
}

function testFail(err) {
  console.log(err);
}*/