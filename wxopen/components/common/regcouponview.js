// components/active/imagebtnview.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var app = getApp()

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
  },
  /**
   * 组件的初始数据
   */
  data: {
    RegCouponImageUrl:null,
    RegCouponBtnUrl:null,
    windowHeight:0,
    windowWidth:0,
  },
  /**
  * 组件的onLoad事件
  */
  ready(){

    var regCouponImageUrl = null
    var regCouponbtnUrl = null

    var config = util.getSysDataConfig('WXMiniRegCouponImg')

    if (config)
    {
      regCouponImageUrl = config.Value
      regCouponbtnUrl = config.Memo
    }

    if (!regCouponImageUrl) {
      regCouponImageUrl = appconst.RegCouponImageUrl
    }

    if (!regCouponbtnUrl) {
      regCouponbtnUrl = appconst.RegCouponBtnUrl
    }

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    this.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,
      RegCouponImageUrl: regCouponImageUrl,
      RegCouponBtnUrl: regCouponbtnUrl
    })
  },
  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _closeView() {
      //触发取消回调
      this.triggerEvent("closeView")
    },
    //按钮事件
    _buttonClick() {
      //触发取消回调
      this.triggerEvent("buttonClick")
    },
  }
})
