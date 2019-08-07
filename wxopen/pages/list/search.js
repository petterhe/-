//search.js
//获取应用实例
var app = getApp()
var that

const pageSize = 10

var currentPage;
var sourceType;
var storeSysNo;
var productlist;
var bmore = true;
var bmoretoast = true;
	
const util = require('../../utils/util.js')
const appenum = require('../../utils/appenum.js')
const appconst = require('../../utils/appconst.js')

Page({
  data: {
    focus: true,
    searchValue: null,
    productlist:null,
    ShoppingCartCount: 0,
    listHeight:1000,
    isIPhone: false,//解决IPhone屏幕高度包含底部状态栏问题
    StarImgUrl: appconst.StarImgUrl,
  },
  onLoad: function (e) {

    console.log('onLoad')

    if(e.sourceType == undefined)
    {
      sourceType = 0;
    }
    else
    {
      sourceType = e.sourceType
    }
    
    currentPage = 1

    if (app.globalData.storeInfo == null)
    {
      wx.navigateBack()
    }

    storeSysNo = app.globalData.storeInfo.SysNo

    productlist = null
    bmore = true 
    bmoretoast = true

    that = this

    var height = app.globalData.systemInfo.windowHeight
    that.setData(
      {
        listHeight:height,
        ShoppingCartCount: app.globalData.ShoppingCartCount,
        isIPhone: util.isIPhone(),
      }
    )

    // this.setData({
    //   searchValue: '果'
    // })

    // search()
  },
  onShow: function() {
    // wx.setNavigationBarTitle({
    //   title: '搜索',
    //   success: function(res) {
    //     // success
    //   }
    // })
  },
  bindKeyInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },
  search:function(e)
  {
    search()
  },
  scan:function(e)
  {
    scan()
  },
  productDetail: function (e) {
    var productSysNo = e.currentTarget.dataset.productsysno
    util.toProductdetail(productSysNo)
  },
  addCart: function (e) {
    var productSysNo = e.currentTarget.dataset.productsysno
    addCart(productSysNo)
  },
  toCart: function () {
    util.toCart()
  },
  loadmore:function(e)
  {
    if(!bmore)
    {
      if(bmoretoast)
      {
        util.showToast('已经是最后一页',-1);
        bmoretoast = false
      }
      return
    }
    loadmore()
  },
  clear:function(e)
  {
    this.setData({
      searchValue: null
    })
  }
})

function search()
{
  if (that.data.searchValue == null || that.data.searchValue.length == 0)
    {
       util.showToast('请输入您需要搜索的内容',-1);
       that.setData({
          focus: true
       })
       return
    }

   clearData()
   searchProduct()
}

function clearData()
{
  currentPage = 1
  bmore = true
  bmoretoast = true

 productlist = null
  that.setData({
    productlist: productlist
  })

}

function loadmore()
{
  currentPage++
  searchProduct()
}

function searchProduct()
{
  var data = {};
  data.StoreSysNo = storeSysNo
  data.SearchContent = that.data.searchValue
  data.PageSize = pageSize
  data.CurrentPage = currentPage
  data.SourceType = sourceType

  // util.requestGet('ProductSearchService',data,searchProductSuccess,searchProductFail,null)
  util.requestGet('ProductSearchNewService', data, searchProductSuccess, searchProductFail, null)
}

function searchProductSuccess(res)
{
  if (res.data && res.data.Entity && res.data.Entity.ProductList && res.data.Entity.ProductList.length > 0)
  {
    //util.shwoModel('11','请输入您需要搜索的内容');
    showProductList(res.data.Entity.ProductList)
    return
  }

  if (res.data.ResponseStatus && res.data.ResponseStatus.Message)
  {
    util.showToast(res.data.ResponseStatus.Message,-1)
  }
  else
  {
    util.showToast("很抱歉，未找符合条件的商品", -1)
  }
}

function showProductList(list)
{
  if(productlist == null)
  {
    productlist = list
    that.setData({
      productlist: productlist
    })
  }
  else
  {
    /*
    for (var i = 0; i < list.length; i++)
    {
      productlist.push(list[i])
      that.setData({
        productlist: productlist
      })
    }
    */
    
    var len = that.data.productlist.length
    for (var i = 0 ; i < list.length; i++ ) 
　　{ 
      var index = len + i
      var productAdd = 'productlist[' + index + ']'

      that.setData({
        [productAdd]: list[i]
      });
　　}
  }
  
  if(list.length < pageSize)
  {
    bmore = false;
  }

 
}

function searchProductFail()
{

}

//***************加入购物车**************//
function addCart(sysNo) {
  util.addCart(sysNo, addCartSuccess, addCartFail, null)
}

function addCartSuccess(res) {
  if (res.data != null && res.data.Entity != null) {

    app.globalData.ShoppingCartCount = res.data.Entity.ShoppingCartCount

    //util.showTabBarCartCount()

    that.setData({
      ShoppingCartCount: app.globalData.ShoppingCartCount
    })

    util.showToast('加入购物车成功')
    return
  }

  util.showToast(res.data.ResponseStatus.Message, -1)
}

function addCartFail() {

}
//***************加入购物车**************//


function scan()
{
  util.scan(scanSuccess,null,null)
}

function scanSuccess(res)
{
  util.showModel('扫描结果',res.result)
}