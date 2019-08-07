// pages/group/fansgroup.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')


Page({

  /**
   * 页面的初始数据
   */
  data: {
    backImage: appconst.ImageHost + '/WXMiniAPP/AppIcon/fansgroup_img.png',
    contactImage: appconst.ImageHost + '/WXMiniAPP/AppIcon/fansgroup_cntimg.png',
    showContact:false,
    groupContactNum:'1',
    listWelfare:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this

    var backImage = that.data.backImage
    var contactImage = that.data.contactImage
    var groupContactNum = that.data.groupContactNum

    var config = util.getSysDataConfig('WXXCXFansGroupPageImage')

    if (config)
    {
      if (config.Value) {
        backImage = config.Value
      }

      if (config.Memo) {
        contactImage = config.Memo
      }
    }

    var num = util.getSysDataConfigValue('WXXCXFansGroupContactNum')

    if(num)
    {
      groupContactNum = num
    }

    var listConfig = util.getSysDataConfigList('WXXCXFansGroupwelfare')

    that.setData({
      backImage: backImage,
      contactImage: contactImage,
      groupContactNum: groupContactNum,
      listWelfare: listConfig,
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  showContact: function () {
    that.setData({
      showContact:true,
    })
  },
  hideContact: function () {
    that.setData({
      showContact: false,
    })
  },
  toHome: function () {
    util.toHome()
  },
})