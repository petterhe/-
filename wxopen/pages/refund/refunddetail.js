// pages/refund/refunddetail.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var app = getApp()

var that

var appealSysNo

Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:null,

    CanAppeal: appenum.OrderAppealStatus.CanAppeal.Value,
    InAppeal: appenum.OrderAppealStatus.InAppeal.Value,

    windowHeight: 0,
    windowWidth: 0,

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this

    if (options.appealSysNo == undefined) {
      appealSysNo = 0;
    }
    else {
      appealSysNo = options.appealSysNo
    }

    var appealDetailInfo = app.globalData.AppealDetailInfo
    app.globalData.AppealDetailInfo = null

    var windowHeight = app.globalData.systemInfo.windowHeight
    var windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,

      item: appealDetailInfo,
    })

    if (appealDetailInfo == null)
    {
        if(appealSysNo == 0)
        {
          wx.navigateBack()
        }
        else
        {
          getAppealDetailInfo()
        }

    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },
  showImage(e) {
    var index = e.currentTarget.dataset.index
    showMaxmage(index)
  },
})

function getAppealDetailInfo()
{

  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.AppealSysNo = appealSysNo
  data.PageSize = 1
  data.CurrentPage = 1

  util.requestGet('GetSOAppealListService', data, getAppealDetailInfoSuccess, getAppealDetailInfoFail, null)
}

function getAppealDetailInfoSuccess(res) {
  if (res.data != null && res.data.Entity != null && res.data.Entity.length > 0) {
    var appealDetailInfo = res.data.Entity[0]

    that.setData({
      item: appealDetailInfo
    })

    return
  }

  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1);
}

function getAppealDetailInfoFail() {

}

function showMaxmage(index)
{
  var urls = new Array();

  var appealDetailInfo = that.data.item

  if (appealDetailInfo.imageUrl1 != null && appealDetailInfo.imageUrl1.length > 0)
  {
    urls.push(appealDetailInfo.imageUrl1)
  }
  if (appealDetailInfo.imageUrl2 != null && appealDetailInfo.imageUrl2.length > 0)
  {
    urls.push(appealDetailInfo.imageUrl2)
  }
  if (appealDetailInfo.imageUrl3 != null && appealDetailInfo.imageUrl3.length > 0) 
  {
    urls.push(appealDetailInfo.imageUrl3)
  }
  
  if (urls == null || urls.length < 0)
  {
    return
  }

  index = index - 1;
  if (index >= urls.length)
  {
    index = 0;   
  }
  var imgUrl = urls[index]

  util.previewImage(imgUrl,urls)
}

//*************** 显示Toast ************//
function showToastView(toastMessage, showType = 1) {
  that.setData({
    isShowToast: true,
    toastMessage: toastMessage,

  })

  setTimeout(hideToastView, 2000);
}

function hideToastView() {
  that.setData({
    isShowToast: false,
    toastMessage: '',
  })
}
//*************** 显示Toast ************//