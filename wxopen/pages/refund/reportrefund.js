// pages/refund/reportrefund.js
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')
const Base64 = require('../../utils/base64.js')

var scrollPaddingTopValue = appconst.scrollPaddingTopValue

const imageCount = 3

var app = getApp()

var that
var soSysNo

var formId = null
var isSubimting
var uploadIndex
//var listImageData

Page({

  /**
   * 页面的初始数据
   */
  data: {
    listImage: null,
    item:null,
    imageCount:imageCount,

    reasonValue: null,

    CanAppeal: appenum.OrderAppealStatus.CanAppeal.Value,
    InAppeal: appenum.OrderAppealStatus.InAppeal.Value,

    windowHeight: 0,
    windowWidth: 0,

    isShowToast: false,
    toastMessage: '',

    listRefundAmtType: null,
    listRefundReasonType: null,

    selectRefundAmtTypeIndex: -1,
    selectRefundReasonTypeIndex: -1,

    RefundOtherReasonType:3,//其他原因
    selectRefundReasonType:0,

    refundAmt:0,
    refundPoint:0,//返还积分数
    deductPoint:0,//扣除赠送积分数
    reasonFocus:false,

    reportAppealMemo: '',
    scrollPaddingTop: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this

    if (options.soSysNo == undefined) {
      soSysNo = 0;
    }
    else {
      soSysNo = options.soSysNo
    }

    formId = null
    isSubimting = false
    uploadIndex = 0
    
    var item = app.globalData.ReportAppealItem
    app.globalData.ReportAppealItem = null

    if (soSysNo <= 0 || item == null)
    {
      wx.navigateBack()
    }

    var listRefundAmtType = util.getSysDataConfigList('RefundAmtType')
    var listRefundReasonType = util.getSysDataConfigList('RefundReasonType')

    var windowHeight = app.globalData.systemInfo.windowHeight
    var windowWidth = app.globalData.systemInfo.windowWidth

    that.setData({
      listImage:new Array(),
      item: item,
      
      windowHeight: windowHeight,
      windowWidth: windowWidth,

      listRefundAmtType: listRefundAmtType,
      listRefundReasonType: listRefundReasonType,
      selectRefundAmtTypeIndex: -1,
    })

    setReportAppealMemo()
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
  clickRefundAmtType: function (e) 
  {
    var index = e.currentTarget.dataset.index
    that.setData({
      selectRefundAmtTypeIndex: index,
    })

    calRefundAmt()
  },
  clickRefundReasonType: function (e) {
    var index = e.currentTarget.dataset.index
    that.setData({
      selectRefundReasonTypeIndex: index,
    })

    calReasonType()
  },
  addImage: function (e) {
    chooseImage()
  },
  removeImage: function (e) {

    var index = e.currentTarget.dataset.index
    removeImage(index)
  },
  bindReasonInput: function (e) {
    this.setData({
      reasonValue: e.detail.value
    })
  },
  submit: function (e) {
    // //校验重复提交
    // if (!util.checkReSubmit(submitTimeObject)) {
    //   return
    // }
    if (isSubimting) {
      util.showModel('提示', '正在为您处理，请稍候')
      return
    }

    formId = e.detail.formId.toString();
    submit()
  },
})

function setReportAppealMemo() {
  var reportAppealMemo = util.getSysDataConfigValue('ReportAppealMemo')

  var scrollPaddingTop = 0
  if (reportAppealMemo) {
    scrollPaddingTop = scrollPaddingTopValue
  }

  that.setData({
    reportAppealMemo: reportAppealMemo,
    scrollPaddingTop: scrollPaddingTop,
  })
}

function calRefundAmt()
{
  var index = that.data.selectRefundAmtTypeIndex
  if (that.data.listRefundAmtType == null || index >= that.data.listRefundAmtType.length)
  {
    return
  }
  var refundAmtInfo = that.data.listRefundAmtType[index]
  var refundAmt = Math.round(Number(refundAmtInfo.Value) * that.data.item.Amt)

  if (refundAmt > that.data.item.Amt)
  {
    refundAmt = that.data.item.Amt
  }

  var refundPoint = Math.round(Number(refundAmtInfo.Value) * that.data.item.ItemPointPay)

  if (refundPoint > that.data.item.ItemPointPay) {
    refundPoint = that.data.item.ItemPointPay
  }

  var deductPoint = Math.round(Number(refundAmtInfo.Value) * that.data.item.Point)

  if (deductPoint > that.data.item.Point)
  {
    deductPoint = that.data.item.Point
  }

  that.setData({
    refundAmt: refundAmt,
    refundPoint: refundPoint,
    deductPoint: deductPoint,
  })
}

function calReasonType() {
  var index = that.data.selectRefundReasonTypeIndex
  if (that.data.listRefundReasonType == null || index >= that.data.listRefundReasonType.length) {
    return
  }
 
  var selectRefundReasonType = that.data.listRefundReasonType[index].Key
  that.setData({
    selectRefundReasonType: selectRefundReasonType,
    reasonFocus: selectRefundReasonType == that.data.RefundOtherReasonType,
  })
}

function checkSubmit()
{
  if (that.data.refundAmt == null || that.data.refundAmt <= 0) {
    util.showModel('提示', '退款金额必须大于0，请选择您的退款金额')
    return false
  }

  if (that.data.selectRefundReasonType == null || that.data.selectRefundReasonType <= 0) {
    util.showModel('提示', '您尚未选择退款原因，请先选择退款原因')
    return false
  }

  if (that.data.selectRefundReasonType == null || that.data.selectRefundReasonType < 0) {
    util.showModel('提示', '您尚未选择退款原因，请先选择退款原因')
    return false
  }

  if (that.data.selectRefundReasonType == that.data.RefundOtherReasonType && (that.data.reasonValue == null || that.data.reasonValue.length <= 0)) {
    util.showModel('提示', '您选择了其他原因，请输入您的退款原因')
    return false
  }

  
  if (that.data.listImage == null || that.data.listImage.length == 0) {
    util.showModel('提示', '您尚未上传图片，请先上传图片')
    return false
  }

  return true
}


function submit()
{
  if (!checkSubmit()) {
    return
  }

  /*
  if(that.data.listImage.length > 0)
  {
    isSubimting = true
    uploadImage(0)
  }
  else{
    isSubimting = true
    reportAppeal()
  }
  */

  isSubimting = true
  uploadImage(0)
}


function reportAppeal()
{
  var data = {};

  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.SOSysNo = soSysNo

  data.ProductSysNo = that.data.item.ProductSysNo
  data.AppealType = appenum.AppealType.ReturnMoney.Value
  data.RefundAmt = that.data.refundAmt

  data.RefundPoint = that.data.refundPoint //返还积分
  data.DeductPoint = that.data.deductPoint //扣除积分

  var index = that.data.selectRefundAmtTypeIndex
  if (that.data.listRefundAmtType != null && index < that.data.listRefundAmtType.length) {
    data.RefundAmtType = that.data.listRefundAmtType[index].Memo
    data.RefundRate = that.data.listRefundAmtType[index].Value
  }

  data.AppealReasonType = that.data.selectRefundReasonType
  //其他时 上报原因
  if (that.data.selectRefundReasonType == that.data.RefundOtherReasonType)
  {
    data.AppealReason = that.data.reasonValue
  }

  data.WXImageCount = that.data.listImage.length

  if (formId != null && formId.length > 0) {
    data.WXFormId = formId
  }

  isSubimting = true
  util.requestPost('ReportSOAppealService', data, submitSuccess, submitFail, null)
}

function submitSuccess(res) {
  // util.showModel('11',JSON.stringify(app.globalData.customerInfo))

  if (res.data != null && res.data.Entity != null) {
    //var orderData = res.data.Entity
    
    isSubimting = false
    wx.showModal({
      title: '提示',
      content: '提交成功',
      showCancel:false,
      success: function(res) {
        wx.navigateBack()
      },
    })

    return
  }

  isSubimting = false
  //util.showToast(res.data.ResponseStatus.Message, -1)
  showToastView(res.data.ResponseStatus.Message, -1)
}

function submitFail() {
  wx.showModal({
    title: '提示',
    content: '提交失败',
  })
  isSubimting = false
}


function chooseImage() {
  var count = imageCount - that.data.listImage.length

  wx.chooseImage({
    count: count, // 图片数
    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
    success: function (res) {
      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
      //var tempFilePaths = res.tempFilePaths
      if (res.tempFilePaths != null && res.tempFilePaths.length > 0) {
        var listImage = that.data.listImage

        for (var i = 0; i < res.tempFilePaths.length; i++) {

          listImage.push(res.tempFilePaths[i])

          //var imageData = Base64.CusBASE64.encoder(res.tempFilePaths[i]);
          //listImageData.push(imageData)

          that.setData({
            listImage: listImage,
          })
        }
      }
    }
  })
}

function removeImage(index) {
  wx.showModal({
    title: '删除确认',
    content: '您确定需要删除这张图片？',
    showCancel: true,
    success: function (res) {
      if (res.confirm) {
        var listImage = that.data.listImage

        listImage.splice(index, 1)
        //listImageData.splice(index, 1)
        //listImage.remove(listImage[index])

        that.setData({
          listImage: listImage,
        })
      }
    },
  })
}

function uploadImage(index) {
  
  var tempFile = that.data.listImage[index]
  var data = {};
  var i = index + 1

  data.FileName = soSysNo + '_' + that.data.item.ProductSysNo + '_' + i + '.jpg'
 
  data.SourcePage = appenum.WXOpenUploadSourcePage.Appeal.Value
  data.FileType = appenum.WXOpenUploadFileType.Image.Value
  data.BusinessNo = soSysNo

  uploadIndex = index

  util.uploadFile(data, tempFile, uploadFileSuccess, uploadFileFali, null)

}

function uploadFileSuccess(res) {
  if (res.data != null) {
    var data = JSON.parse(res.data)
    if (data.Entity != null && data.Entity.Result) {
      //上传下一张
      if (that.data.listImage.length > uploadIndex + 1)
      {
        uploadImage(uploadIndex + 1)
        return
      }

      //上报申诉内容
      if (that.data.listImage.length == uploadIndex + 1)
      {
        isSubimting = false
        reportAppeal()
        return
      }
      
      isSubimting = false
      return
    }

    if (res.data.ResponseStatus && res.data.ResponseStatus.Message)
    {
      showToastView(res.data.ResponseStatus.Message, -1);
    }
    isSubimting = false
  }
  
}

function uploadFileFali() {
  wx.showModal({
    title: '提示',
    content: '提交失败',
  })

  isSubimting = false
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