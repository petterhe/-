// pages/invoice/addinvoice.js
var app = getApp()
var that

const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

var formId = null
var isSubimting = false
var soSysnos = ""

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: 0,
    windowWidth: 0,
    isIPhone: false,
    
    waitInvoiceInfo:null,
    selectInvoiceAmt:0,
    selectIndex: 0,
    selectInvType: 1,

    invoicePersonalNameFoucus: true,
    invoiceCompanyNameFoucus:false,
    
    invTypePersonal:1,
    invTypeCompany:2,

    isGovernmen:false,

    canGetWXTitle:false,//是否能获取微信title

    showInvoiceDescView:false,

    submitType :0,
    addSoID:"",
    addSoAmt:"",
    addSoIDfocus:false,

    isShowToast: false,
    toastMessage: '',

    isIpx: app.globalData.isIpx ? true : false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    that = this

    var windowHeight = app.globalData.systemInfo.windowHeight + 60
    var windowWidth = app.globalData.systemInfo.windowWidth

    formId = null
    soSysnos = ""
    isSubimting = false

    var submitType  = 0

    if (util.isTempCustomer())
    {
      submitType  = 1 //临时用户，根据单号和金额开票
    }

    that.setData({
      windowHeight: windowHeight,
      windowWidth: windowWidth,

      invoicePersonalNameFoucus: true,
      invoiceCompanyNameFoucus: false,
      
      invTypePersonal: appenum.InvoiceTitleType.Personal.Value,
      invTypeCompany: appenum.InvoiceTitleType.Company.Value,

      isGovernmen: false,

      canGetWXTitle: canChooseInvoiceTitle(),//是否可以获取微信发票抬头
      submitType : submitType ,
      addSoIDfocus: submitType ==1,
    })

    getWaitInvoiceSO()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {


    //重新登录
    if (app.globalData.loginphonesuccess)
    {
      app.globalData.loginphonesuccess = false

      that.setData({
        submitType : 0,
        selectInvoiceAmt: 0,
      })

      getWaitInvoiceSO()
      return
    }
    
    if (app.globalData.refresinvoiceTitle)
    {
      if (app.globalData.scopeinvoiceTitle)
      {
        getInvoiceTitle()
        app.globalData.refresinvoiceTitle = false
      }
      return
    }

  },
  getInvoiceTitle: function (e)
  {
    invoiceTitleSetting()
  },
  selectMyInvType: function (e) {
    var index = e.currentTarget.dataset.index
    if (index == that.data.selectIndex)
    {
      return
    }

    var selectInvType = that.data.waitInvoiceInfo.InvoiceTitles[index].TitleType

    that.setData({
      selectIndex:index,
      selectInvType: selectInvType,
      invoicePersonalNameFoucus: selectInvType == appenum.InvoiceTitleType.Company.Value,
      invoiceCompanyNameFoucus: selectInvType == appenum.InvoiceTitleType.Personal.Value,
    })
  },
  bindInvoiceNameInput: function (e) {
    //addressInfo.Contact = e.detail.value
    var waitInvoiceInfo = that.data.waitInvoiceInfo
    waitInvoiceInfo.InvoiceTitles[that.data.selectIndex].InvoiceName = e.detail.value.trim()

    that.setData({
      waitInvoiceInfo: waitInvoiceInfo
    })
  },
  bindTaxNameInput: function (e) {
    var waitInvoiceInfo = that.data.waitInvoiceInfo
    waitInvoiceInfo.InvoiceTitles[that.data.selectIndex].TaxNum = e.detail.value.trim()

    that.setData({
      waitInvoiceInfo: waitInvoiceInfo
    })
  },
  bindCompanyPhoneInput: function (e) {
    //addressInfo.Contact = e.detail.value
    var waitInvoiceInfo = that.data.waitInvoiceInfo
    waitInvoiceInfo.InvoiceTitles[that.data.selectIndex].CompanyPhone = e.detail.value.trim()

    that.setData({
      waitInvoiceInfo: waitInvoiceInfo
    })
  },
  bindEmailInput: function (e) {
    //addressInfo.Contact = e.detail.value
    var waitInvoiceInfo = that.data.waitInvoiceInfo
    waitInvoiceInfo.InvoiceTitles[that.data.selectIndex].Email = util.ToCDB(e.detail.value.trim().toLowerCase())

    that.setData({
      waitInvoiceInfo: waitInvoiceInfo
    })
  },
  selectItem: function (e) {
    var index = e.currentTarget.dataset.index
    selectOrderItem(index)

  },
  submitTypeChange: function(e) {
    var index = e.currentTarget.dataset.index

    if(index == 0)
    {
      if (util.isTempCustomer()) {
        wx.showModal({
          title: '提示',
          content: '登录后可自动筛选出可开票订单哦~',
          success: function (res) {
            if (res.confirm) {
              util.toLoginPhone()
            }
          }
        })
        return
      }

      callSelectInvoiceAmt()
    }

    
    that.setData({
      submitType : index,
      addSoIDfocus: index == 1,
    })

    if (that.data.submitType == 0)
    {
      callSelectInvoiceAmt()
    }
    
    if (that.data.submitType == 1)
    {
      var addSoAmt = that.data.addSoAmt
      that.setData({
        selectInvoiceAmt: addSoAmt * 100
      })
    }
  },
  bindAddSoIDInput: function (e) {

    that.setData({
      addSoID: e.detail.value.trim()
    })
  },
  bindAddSoAmtInput:function(e)
  {
    var addSoAmt = e.detail.value.trim()
    that.setData({
      addSoAmt: addSoAmt,
      selectInvoiceAmt: addSoAmt* 100,
    })
  },
  showInvoiceDescView: function (e) {
    that.setData({
      showInvoiceDescView:true,
    })
  },
  hideInvoiceDescView: function (e) {
    that.setData({
      showInvoiceDescView: false,
    })
  },
  submit: function (e) {
    // //校验重复提交
    // if (!util.checkReSubmit(submitTimeObject)) {
    //   return
    // }
    if (isSubimting) {
      return
    }

    formId = e.detail.formId.toString();
    submit()
  },
  showTaxMemo:function(e)
  {
    wx.showModal({
      title: '说明',
      content: '应国家税务总局要求，自2017年7月1日起，开具增值税普通发票，须同时提供企业抬头及税号，否则无法用于企业报销',
      showCancel:false,
    })
  },
  governmenChange:function(e)
  {
    var isGovernmen = !that.data.isGovernmen
    that.setData({
      isGovernmen: isGovernmen,
    })
  }
})

function getSelectInvoiceTitle()
{
  return that.data.waitInvoiceInfo.InvoiceTitles[that.data.selectIndex]
}

function getWaitInvoiceSO()
{
  soSysnos = ""

  var data = {};
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo

  util.requestGet('GetWaitInvoiceSOService', data, getWaitInvoiceSOSuccess, getWaitInvoiceSOFail, null)
}

function getWaitInvoiceSOSuccess(res) {
  if (res.data != null && res.data.Entity != null) {
    
    setSelectInvType(res.data.Entity)

    that.setData({
      waitInvoiceInfo: res.data.Entity
    })
    return
  }

  //util.showToast(res.data.ResponseStatus.Message,-1)
  showToastView(res.data.ResponseStatus.Message, -1)
}

function getWaitInvoiceSOFail() {

}

function setSelectInvType(waitInvoiceInfo)
{
  if (waitInvoiceInfo.InvoiceTitles != null && waitInvoiceInfo.InvoiceTitles.length >0)
  {
     var selectIndex = 0
     var selectInvType = waitInvoiceInfo.InvoiceTitles[0].TitleType

    for (var i = 0; i < waitInvoiceInfo.InvoiceTitles.length; i ++){
      if (waitInvoiceInfo.InvoiceTitles[i] != null && waitInvoiceInfo.InvoiceTitles[i].IsSelect == "1" && i<2)
      {
        selectIndex = i
        selectInvType = waitInvoiceInfo.InvoiceTitles[i].TitleType
        break;
      }
    }

    that.setData({
      selectIndex: selectIndex,
      selectInvType: selectInvType,
      invoicePersonalNameFoucus: selectInvType == appenum.InvoiceTitleType.Company.Value,
      invoiceCompanyNameFoucus: selectInvType == appenum.InvoiceTitleType.Personal.Value,
    })
  }
}

function selectOrderItem(index)
{
  var waitInvoiceInfo = that.data.waitInvoiceInfo
  if (waitInvoiceInfo.ListSOBriefs == null || waitInvoiceInfo.ListSOBriefs.length <= index)
  {
    return
  }

  var orderItem = waitInvoiceInfo.ListSOBriefs[index]
  if (orderItem.IsSelect == null || orderItem.IsSelect.length == 0 || orderItem.IsSelect == 0)
  {
    orderItem.IsSelect = 1
  }
  else
  {
    orderItem.IsSelect = 0
  }

  waitInvoiceInfo.ListSOBriefs[index] = orderItem

  that.setData({
    waitInvoiceInfo: waitInvoiceInfo
  })
    
  callSelectInvoiceAmt()
}

function callSelectInvoiceAmt()
{
  soSysnos = ""
  var selectInvoiceAmt = 0
  var waitInvoiceInfo = that.data.waitInvoiceInfo
  if (waitInvoiceInfo.ListSOBriefs == null) {

    that.setData({
      selectInvoiceAmt: selectInvoiceAmt,
    })
    return
  }

  for (var i = 0; i < waitInvoiceInfo.ListSOBriefs.length; i ++)
  {
    if (waitInvoiceInfo.ListSOBriefs[i].IsSelect != null && waitInvoiceInfo.ListSOBriefs[i].IsSelect == 1)
    {
      var amt = waitInvoiceInfo.ListSOBriefs[i].TotalAmt
      selectInvoiceAmt = selectInvoiceAmt + amt

      soSysnos += waitInvoiceInfo.ListSOBriefs[i].SOSysNo + ","
    }
  }

  that.setData({
      selectInvoiceAmt: selectInvoiceAmt,
    })

  if (soSysnos.length > 0)
  {
    soSysnos = soSysnos.substring(0, soSysnos.length - 1)
  }
}

function submit()
{

  var titleInfo = that.data.waitInvoiceInfo.InvoiceTitles[that.data.selectIndex]

  if (!checkInvoiceTitle(titleInfo))
  {
    return
  }

  if(that.data.submitType  == 0)
  {
    if (soSysnos.length <= 0) {
      util.showModel('提示', '请选择需要开票的订单')
      return
    }
  }
  
  if (that.data.submitType  == 1) {
    if (!checkInvoiceInput()) {
      return
    }

    soSysnos = that.data.addSoID
  }
  

  if (that.data.selectInvoiceAmt < that.data.waitInvoiceInfo.MinInvoiceAmt)
  {
    util.showModel('提示', '您选择的开票金额低于最低可开票金额')
    return
  }

  var data = {}
  data.CustomerSysNo = app.globalData.customerInfo.CustomerSysNo
  data.SubmitType = that.data.submitType 
  data.SOSysNos = soSysnos
  data.InvoiceAmt = that.data.selectInvoiceAmt.toFixed(0)
 
  data.TitleType = titleInfo.TitleType
  data.InvoiceName = titleInfo.InvoiceName
  
  //政府部门标记
  if (that.data.isGovernmen)
  {
    data.IsInstitutions = '1'
  }
  else
  {
    if (titleInfo.TaxNum != null && titleInfo.TaxNum.length > 0) {
      data.TaxNum = titleInfo.TaxNum
    }
  }

  data.CompanyPhone = titleInfo.CompanyPhone
  data.Email = titleInfo.Email

  if (formId != null && formId.length > 0) {
    data.WXFormId = formId
  }

  if (that.data.isGovernmen) {
    wx.showModal({
      title: '纳税号确认',
      content: '您确认您的单位属于政府部门、事业单位等，否则无纳税号的发票将属于无效发票！',
      success: function (res) {
        if (res.confirm) {
          util.requestPost('SubmitInvoiceReqService', data, SubmitInvoiceSuccess, SubmitInvoiceFail, null)
        }
        else
        {
          return
        }
      }
    })
    return
  }

  util.requestPost('SubmitInvoiceReqService', data, SubmitInvoiceSuccess, SubmitInvoiceFail, null)
}

function SubmitInvoiceSuccess(res) {

  isSubimting = false

  if (res.data != null && res.data.Entity != null) {
    app.globalData.isAddInvoice = true

    var message ="开票处理中，若1个工作日内未收到电子发票，请与我们客服联系，谢谢！"
    if (res.data.Entity.Message != undefined 
      && res.data.Entity.Message != null
      && res.data.Entity.Message.length > 0)
    {

      //有开票退款提示时，展示提示
      message = res.data.Entity.Message
      /*
      wx.showModal({
        title: '提示',
        content: message,
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            //保存成功 返回
            wx.navigateBack()
          }
        }
      })
      return
      */
    }

    wx.showModal({
      title: '提示',
      content: message,
      showCancel: false,
      success: function (res) {
        if (res.confirm) {
          //保存成功 返回
          wx.navigateBack()
        }
      }
    })

    return
    /*
    //保存成功 返回
    wx.navigateBack()
    return
    */
  }

  var message = "提交失败，请重试"
  if (res.data != null && res.data.ResponseStatus != null
    && res.data.ResponseStatus.Message != null && res.data.ResponseStatus.Message.length > 0)
  {
    message = res.data.ResponseStatus.Message
  }

  util.showModel('提示',message)
}

function SubmitInvoiceFail() {
  isSubimting = false
}

/*
function getSelectSOSysNos()
{
  var soSysnos = ""
  var waitInvoiceInfo = that.data.waitInvoiceInfo
  if (waitInvoiceInfo.ListSOBriefs == null) {
    return
  }

  for (var i = 0; i < waitInvoiceInfo.ListSOBriefs.length; i++) {
    if (waitInvoiceInfo.ListSOBriefs[i].IsSelect != null && waitInvoiceInfo.ListSOBriefs[i].IsSelect == 1) {
      var soSysnos = soSysnos + "," + waitInvoiceInfo.ListSOBriefs[i].SOSysNo
    }
  }

}
*/

function checkInvoiceTitle(titleInfo)
{
  //校验个人姓名
  if (titleInfo.TitleType == appenum.InvoiceTitleType.Personal.Value.toString())
  {
    if (titleInfo.InvoiceName == null || titleInfo.InvoiceName.length <= 0)
    {
      //util.showToast('请输入开票人姓名',-1)
      util.showModel('提示', '请输入开票人姓名')
      return false
    }
  }

  //校验单位
  if (titleInfo.TitleType == appenum.InvoiceTitleType.Company.Value.toString()) {
    if (titleInfo.InvoiceName == null || titleInfo.InvoiceName.length <= 0) {
      //util.showToast('请输入单位名称', -1)
      util.showModel('提示', '请输入单位名称')
      return false
    }

    //政府部门不校验纳税号
    var isGovernmen = that.data.isGovernmen
    if (!isGovernmen && (titleInfo.TaxNum == null || titleInfo.TaxNum.length <= 0)) {
      //util.showToast('请输入纳税号', -1)
      util.showModel('提示', '请输入纳税号')
      return false
    }
  }

  if (titleInfo.CompanyPhone == null || titleInfo.CompanyPhone.length <= 0) {
    //util.showToast('请输入联系电话', -1)
    util.showModel('提示', '请输入手机号')
    return false
  }

  if (!util.checkPhone(titleInfo.CompanyPhone)) {
    //util.showToast("请输入正确的联系电话",-1)
    util.showModel('提示', '请输入正确的手机号')
    return
  }

  if (titleInfo.Email == null || titleInfo.Email.length <= 0) {
    //util.showToast('请输入联系邮箱', -1)
    util.showModel('提示', '请输入联系邮箱')
    return false
  }

  if (!util.checkEmail(titleInfo.Email)) {
    //util.showToast("请输入正确的联系邮箱", -1)
    util.showModel('提示','请输入正确的联系邮箱')
    return false
  }
  return true
}


function checkInvoiceInput() {
  
  //订单号
  if (that.data.addSoID == null || that.data.addSoID.length <= 0) {
    util.showModel('提示', '请输入需要开票的订单号')
    return false
  }

  if (that.data.addSoID.length != 10) {
    util.showModel('提示', '请输入正确的10位订单号')
    return false
  }

  //订单金额 addSoAmt
  if (that.data.addSoAmt == null || that.data.addSoAmt.length <= 0) {
    util.showModel('提示', '请输入订单金额')
    return false
  }

  if (that.data.addSoAmt >= 10000) {
    util.showModel('提示', '开票金额不能大于10000元')
    return false
  }

  return true
}

//*******************发票抬头****************//
function canChooseInvoiceTitle()
{
  if (wx.chooseInvoiceTitle)
  {
    return true
  }

  return false
}

function invoiceTitleSetting()
{
  if (util.useNewAuth())
  {
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.invoiceTitle']) {
          wx.authorize({
            scope: 'scope.invoiceTitle',
            success() {
              // 用户已经同意小程序使用功能，后续调用 接口不会弹窗询问
              getInvoiceTitle()
            },
            fail()
            {
              var message = '您好，此功能必须允许发票抬头才能使用，请先允许授权'
              util.toSettting(message)         
            }
          })
        }
        else{
          getInvoiceTitle()
        }
      }
    })
  }
  else{
    getInvoiceTitle()
  }
}


function getInvoiceTitle() {
  if (wx.chooseInvoiceTitle) {
    wx.chooseInvoiceTitle({
      success(res) {
        if (res != null) {

          //util.showModel('11',JSON.stringify(res))
          var index = 0
          var waitInvoiceInfo = that.data.waitInvoiceInfo

          var result = res
          if (res.choose_invoice_title_info != null && res.choose_invoice_title_info.length > 0) {
            result = JSON.parse(res.choose_invoice_title_info)
          }

          if (result != null) {
            //单位
            if (result.type == 0) {
              index = 1
              waitInvoiceInfo.InvoiceTitles[index].InvoiceName = result.title
              waitInvoiceInfo.InvoiceTitles[index].TaxNum = result.taxNumber
              waitInvoiceInfo.InvoiceTitles[index].CompanyPhone = result.telephone
            }
            //个人
            if (result.type == 1) {
              index = 0
              waitInvoiceInfo.InvoiceTitles[index].InvoiceName = result.title
            }

            that.setData({
              waitInvoiceInfo: waitInvoiceInfo,
              selectIndex: index,
              selectInvType: waitInvoiceInfo.InvoiceTitles[index].TitleType,
            })
          }
        }
      },
      fail(res)
      {
        openSetting()
      }
    })
  }
}

function openSetting()
{
  if (wx.getSetting) {
    wx.getSetting({
      success: function (res) {
        if (!res.authSetting["scope.invoiceTitle"]) {
          getInvoiceTitleFail()
        }
      },
      fail: function (e) {
        getInvoiceTitleFail()
      }
    })
  }
  else {
    if (e.errMsg.indexOf("fail auth deny") >= 0) {
      getInvoiceTitleFail()
    }
    else {
      showToastView('获取微信发票抬头失败')
    }
  }
}

//获取发票抬头失败
function getInvoiceTitleFail() {
  wx.showModal({
    title: '提示',
    content: '您拒绝了发票抬头信息授权，请重新选择授权',
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        openInvoiceTitleSetting()
      }
    }
  })
}


//发票抬头授权失败
function openInvoiceTitleSetting() {
  if (wx.openSetting) {
    wx.openSetting({
      success: function (res) {
        if (res.authSetting["scope.invoiceTitle"]) {
          //这里是授权成功之后 填写你重新获取数据的js
          getInvoiceTitle()
        }
        else {
          getInvoiceTitleFail()
        }
      },
    })
  }
}
//*******************发票抬头****************//

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