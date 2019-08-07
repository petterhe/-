// components/active/imagebtnview.js
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   * 用于组件自定义设置
   */
  properties: {
    // 图片
    imageUrl: {            // 属性名
      type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: ''     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    //是否显示图片按钮
    showImageBtn: {
      type: Number,
      value: 1
    },
    // 按钮图片 与文字二选一
    btnImageUrl: {
      type: String,
      value: ''
    },
    // 按钮文字 与图片二选一
    buttonText: {
      type: String,
      value: ''
    },
    //标题
    title: {
      type: String,
      value: ''
    },
    //说明
    memo: {
      type: String,
      value: ''
    },
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    //按钮事件
    _buttonClick() {
      //触发取消回调
      this.triggerEvent("buttonClick")
    },
  }
})
