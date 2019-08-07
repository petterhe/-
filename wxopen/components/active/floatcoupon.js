// components/active/floatcoupon.js
const appenum = require('../../utils/appenum.js')

Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    //活动金额
    ActAmt: {            // 属性名
      type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: ''     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    //所需次数
    ActNeedTimes: {
      type: String,
      value: ''
    },
    //参加次数
    ActJoinTimes: {
      type: String,
      value: ''
    },
    //状态
    ActStatus: {
      type: String,
      value: ''
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 弹窗显示控制
    Complete: appenum.ActStatus.Complete.Value,
    Received: appenum.ActStatus.Received.Value,
    NoComplete: appenum.ActStatus.NoComplete.Value,
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */
    // showDialog() {
    //   this.setData({
    //     isShow: !this.data.isShow
    //   })
    // },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _clickEvent() {
      //触发点击事件
      this.triggerEvent("clickEvent")
    },
  }
})
