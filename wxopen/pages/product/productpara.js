var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var sysNo;

// pages/product/productpara.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productAttribute: null,
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    console.log('onLoad')

    if (options.SysNo == undefined) {
      sysNo = 0;
    }
    else {
      sysNo = options.SysNo
    }

    that = this

    getProductAttribute()
  },
})

function getProductAttribute() {
  var data = {};
  data.ProductSysNo = sysNo

  util.requestGet('ProductAttributeService', data, getProductAttributeSuccess, getProductAttributeFail, null)
}

function getProductAttributeSuccess(res) {
  if (res.data != null && res.data.Entity != null) {
    that.setData({
      productAttribute: res.data.Entity,
    })
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function getProductAttributeFail() {

}