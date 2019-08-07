const ImageHost = "http://img.mmsshh.com/"

module.exports = {
  sysDataConfig_key:'sys_dataconfig',
  userInfo_key:'userInfo',
  systemInfo_key: 'systemInfo',
  invitationCode_key:'invitationCode',
  ImageHost: ImageHost,
  StarImgUrl: ImageHost + 'AppIcon/Review/Star.png',
  FastBindImgUrl: ImageHost + 'WXMiniAPP/AppIcon/FastBindImage.png',
  RegCouponImageUrl: ImageHost + 'WXMiniAPP/AppIcon/RegCouponImg.png',
  RegCouponBtnUrl: ImageHost + 'WXMiniAPP/AppIcon/RegCouponBtn.png',
  CartOpenVipBg: ImageHost + "WXMiniAPP/ShowCode/cart_openvipbg.png",
  PrivigeCardBg: ImageHost + "WXMiniAPP/ShowCode/privigecard_bg.png",
  scrollPaddingTopValue:36,
  maxQty: 999,
  minQty: 1,
  intDefual:-999999,

  ChangeWXOpenUserService:"ChangeWXOpenUserMCService",
  GetWXOpenPayParamsService:"GetWXOpenPayParamsMCService",
  GetWXOpenUserService:"GetWXOpenUserMCService",
  SaveWXOpenShareLogService:"SaveWXOpenShareLogMCService",
}