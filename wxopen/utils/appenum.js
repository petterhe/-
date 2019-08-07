
if(typeof OrderStatus == "undefined")
{
    var OrderStatus={
        PartlyReturn:{
            Value:-5,
            Name:'部分退货'
        },
         Return:{
            Value:-4,
            Name:'订单取消'
        },
         ManagerCancel:{
            Value:-3,
            Name:'主管作废'
        },
        CustomerCancel:{
            Value:-2,
            Name:'客户作废'
        },
        EmployeeCancel:{
            Value:-1,
            Name:'系统作废'
        },
        WaitingAudit:{
            Value:0,
            Name:'待审核'
        },
        WaitingOutStock:{
            Value:1,
            Name:'待打包'
        },
        WaitingPay:{
            Value:2,
            Name:'待支付'
        },
        WaitingManagerAudit:{
            Value:3,
            Name:'待主管审'
        },
        OutStock:{
            Value:4,
            Name:'待配送'
        },
        Weighing:{
            Value:5,
            Name:'待称重'
        },
        WaitingSelf:{
            Value:6,
            Name:'待自提'
        },
        Finished:{
            Value:7,
            Name:'配送完成'
        },
        WaitingReview:{
            Value:8,
            Name:'待评价'
        },
        Reviewed:{
            Value:9,
            Name:'已评价'
        },
        WaitMakeGroup:{
            Value:20,
            Name:'待成团'// 待成团（拼团中）：订单状态为待打包Status=1、挂起状态为挂起IsPending=1
        },
        WaitReceive:{
            Value:21,
            Name:'待收货'// 待收货：订单状态为待配送Status=4、配送状态为配送中DeliveryStatus=2
        },
    }　　　　　　　　　　　　 
}


if (typeof SOPTType == "undefined") {
  var SOPTType = {
    NotPT: {
      Value: 0,
      Name: '非拼团'
    },
    PT: {
      Value: 1,
      Name: '拼团'
    },
    PTRetail: {
      Value: 2,
      Name: '拼团原价单独购买'
    }
  }
}


if(typeof PTSettlementType == "undefined")
{    
    var PTSettlementType={
        Open:{
            Value:1,
            Name:'去开团'
        },
         Actor:{
            Value:2,
            Name:'去参团'
        },
         Retail:{
            Value:3,
            Name:'单独购买'
        }
    }　　　　　　　　　　　 
}

if(typeof GroupBuyType == "undefined")
{    
    var GroupBuyType={
        XiaoShi:{
            Value:1,
            Name:'小时团'
        },
         CiRi:{
            Value:2,
            Name:'次日团'
        },
    }　　　　　　　　　　　 
}

if(typeof PTGMDetailStatus == "undefined")
{    
    var PTGMDetailStatus={
        Invitation:{
            Value:1,
            Name:'邀请好友参团'
        },
        OneKeyActor:{
            Value:2,
            Name:'一键参团'
        },
        OneKeyOpen:{
            Value:3,
            Name:'一键开团'
        },
        Finished:{
            Value:4,
            Name:'已结束'
        },
        Succeed:{
            Value:5,
            Name:'已成团'
        },
        Failed:{
            Value:6,
            Name:'拼团失败'
        },
    }　　　　　　　　　　　 
}

if(typeof NoticType == "undefined")
{    
    var NoticType={
        WaitingPay:{
            Value:1,
            Name:'订单待支付'
        },
        WaitingReview:{
            Value:2,
            Name:'订单待评价'
        },
        CouponCount:{
            Value:3,
            Name:'可用红包数'
        },
        WaitRevGiftBagCount:{
            Value:4,
            Name:'待领取礼包数'
        },
        WaitMakeGroup:{
            Value:5,
            Name:'订单待成团'
        },
        WaitOutStock:{
            Value:6,
            Name:'订单待发货'
        },
        WaitReceive:{
            Value:7,
            Name:'订单待收货'
        },
    }　　　　　　　　　　　 
}

if (typeof WXOpenShareLogType == "undefined") {
  var WXOpenShareLogType = {
    Share: {
      Value: 1,
      Name: '分享'
    },
    Open: {
      Value: 2,
      Name: '打开'
    },
    Scene: {
      Value: 3,
      Name: '扫描二维码'
    },
    AppShareOpen: {
      Value: 4,
      Name: 'APP分享打开'
    },
    AppOpen: {
      Value: 5,
      Name: 'APP打开'
    }
  }
}

if (typeof ShipType == "undefined") {
  var ShipType = {
    ExpressDelivery: {
      Value: 1,
      Name: '送货上门'
    },
    HomeDelivery: {
      Value: 2,
      Name: '到店自提'
    },
  }
}

if (typeof BuyType == "undefined") {
  var BuyType = {
    ShoppingCart: {
      Value: 1,
      Name: '购物车'
    },
    PT: {
      Value: 2,
      Name: '拼团'
    },
    SeeView: {
      Value: 3,
      Name: '详情'
    },
  }
}

if (typeof PayType == "undefined") {
  var PayType = {
    weixin: {
      Value: 4,
      Name: '微信支付'
    },
  }
}

if (typeof RegType == "undefined") {
  var RegType = {
    Reg: {
      Value: 1,
      Name: '注册'
    },
    Forget: {
      Value: 2,
      Name: '忘记密码'
    },
    Bind: {
      Value: 3,
      Name: '绑定手机'
    },
    LoginCode: {
      Value: 4,
      Name: '登录验证'
    },
  }
}

if (typeof CustomerType == "undefined") {
  var CustomerType = {
    Temp: {
      Value: 0,
      Name: '临时客户'
    },
    Register: {
      Value: 1,
      Name: '注册客户'
    },
  }
}

//异常处理方式：0静默无响应  1弹窗显示 2弹窗强制确认后继续流程 3弹窗跳转
if (typeof ErrHandleType == "undefined") {
  var ErrHandleType = {
    BecomeSilent: {
      Value: 0,
      Name: '静默无响应'
    },
    PopupShow: {
      Value: 1,
      Name: '弹窗显示'
    },
    ConfrimNext: {
      Value: 2,
      Name: '弹窗强制确认后继续流程'
    },
    PopupSkipTurn: {
      Value: 3,
      Name: '弹窗跳转'
    },
  }
}

if (typeof CouponBuyType == "undefined") {
  var CouponBuyType = {
    ShopCart: {
      Value: 0,
      Name: '购物车'
    },
    PT: {
      Value: 1,
      Name: '拼团'
    },
    Universal: {
      Value: 2,
      Name: '通用'
    },
  }
}

if (typeof CouponKind == "undefined") {
  var CouponKind = {
    RedPaper: {
      Value: 0,
      Name: '红包'
    },
    Public: {
      Value: 1,
      Name: '公券'
    },
    PTFree: {
      Value: 2,
      Name: '拼团免单券'
    },
  }
}

if (typeof WXAqrCodeType == "undefined") {
  var WXAqrCodeType = {
    A: {
      Value: 1,
      Name: '接口A'
    },
    B: {
      Value: 2,
      Name: '接口B'
    },
    C: {
      Value: 3,
      Name: '接口C'
    },
  }
}

if (typeof Invstatus == "undefined") {
  var Invstatus = {
    Have: {
      Value: 0,
      Name: '有货'
    },
    None: {
      Value: 1,
      Name: '已售罄'
    },
    AddIn: {
      Value: 2,
      Name: '补货中'
    },
  }
}

if (typeof PTScenarioType == "undefined") {
  var PTScenarioType = {
    Normal: {
      Value: 0,
      Name: '普通团'
    },
    InvitationNew: {
      Value: 1,
      Name: '邀新团'
    },
    HeadFreeCoupon: {
      Value: 2,
      Name: '团长用券免单团'
    },
    HeadFreeCouponINew : {
      Value: 3,
      Name: '团长邀新免单团'
    },
  }
}

if (typeof CouponToUseType == "undefined") {
  var CouponToUseType = {
    Product: {
      Value: 1,
      Name: '商品详情'
    },
    ECategory2: {
      Value: 2,
      Name: '商品二级分类'
    },
    Home: {
      Value: 3,
      Name: '首页'
    },
    PT: {
      Value: 4,
      Name: '拼团详情'
    },
    PTFree: {
      Value: 5,
      Name: '拼团免单列表'
    },
  }
}

if (typeof InvoiceTitleType == "undefined") {
  var InvoiceTitleType = {
    Personal: {
      Value: 1,
      Name: '个人'
    },
    Company: {
      Value: 2,
      Name: '公司'
    },
  }
}

if (typeof OrderAppealStatus == "undefined") {
  var OrderAppealStatus = {
    CanNotAppeal: {
      Value: 0,
      Name: '不可申诉'
    },
    CanAppeal: {
      Value: 1,
      Name: '可申诉'
    },
    InAppeal: {
      Value: 2,
      Name: '已申诉'
    },
  }
}

if (typeof AppealType == "undefined") {
  var AppealType = {
    Other: {
      Value: 0,
      Name: '其他'
    },
    ReSend: {
      Value: 1,
      Name: '补货'
    },
    ReturnMoney: {
      Value: 2,
      Name: '退款'
    },
    Coupon: {
      Value: 3,
      Name: '补红包'
    },
    Balance: {
      Value: 4,
      Name: '返余额'
    },
  }
}

//图片上传类型
if(typeof WXOpenUploadFileType == "undefined") {
  var WXOpenUploadFileType = {
    Image: {
      Value: 1,
      Name: '图片'
    },
    PDF: {
      Value: 2,
      Name: 'PDF'
    },
    Txt: {
      Value: 3,
      Name: 'TXT'
    },
  }
}

//图片上传文件页面
if (typeof WXOpenUploadSourcePage == "undefined") {
  var WXOpenUploadSourcePage = {
    Appeal: {
      Value: 1,
      Name: '申诉'
    },
  }
}

//活动类型
if (typeof ActiveType == "undefined") {
  var ActiveType = {
    FruitsBar: {
      Value: 3,
      Name: '果吧'
    },
    Product: {
      Value: 4,
      Name: '商品'
    },
    GiveHelp: {
      Value: 15,
      Name: '助力红包'
    },
  }
}

//活动类型
if (typeof ActStatus == "undefined") {
  var ActStatus = {
    Complete: {
      Value: 1,
      Name: '已达成未领取'
    },
    Received: {
      Value: 2,
      Name: '已达成已领取'
    },
    NoComplete: {
      Value: 3,
      Name: '未达成'
    },
    Stoped: {
      Value: 4,
      Name: '已结束'
    }
  }
}

//助力类型
if (typeof HelpStatus == "undefined") {
  var HelpStatus = {
    UnHelp: {
      Value: 0,
      Name: '未助力'
    },
    Helped: {
      Value: 1,
      Name: '已助力'
    },
    Self: {
      Value: 2,
      Name: '发起者自己'
    }
  }
}

if (typeof SaleType == "undefined") {
  var SaleType = {
    NormalSO: {
      Value: 0,
      Name: '正常订单'
    },
    PreSaleSO: {
      Value: 3,
      Name: '预售订单'
    },
    FillUpSO: {
      Value: 4,
      Name: '补单'
    },
    VirtualProduct: {
      Value: 5,
      Name: '虚拟订单'
    }
  }
}

module.exports = {
  OrderStatus:OrderStatus,
  SOPTType: SOPTType,
  PTSettlementType:PTSettlementType,
  GroupBuyType:GroupBuyType,
  PTGMDetailStatus:PTGMDetailStatus,
  NoticType:NoticType,
  WXOpenShareLogType: WXOpenShareLogType,
  ShipType: ShipType,
  BuyType: BuyType,
  PayType: PayType,
  RegType: RegType,
  CustomerType: CustomerType,
  ErrHandleType: ErrHandleType,
  WXAqrCodeType: WXAqrCodeType,
  Invstatus: Invstatus,
  PTScenarioType: PTScenarioType,
  CouponToUseType: CouponToUseType,
  InvoiceTitleType: InvoiceTitleType,
  OrderAppealStatus: OrderAppealStatus,
  AppealType: AppealType,
  WXOpenUploadFileType:WXOpenUploadFileType,
  WXOpenUploadSourcePage:WXOpenUploadSourcePage,
  ActiveType: ActiveType,
  ActStatus:ActStatus,
  HelpStatus: HelpStatus,
  SaleType: SaleType,
}


