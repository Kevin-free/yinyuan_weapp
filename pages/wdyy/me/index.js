var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
var myutil = require('../../../utils/myUtil.js');
Page({
  data: {
    list: [],
    subcount: {},
    loading: true,

     // 组件所需的参数
     nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '', //导航栏 中间的标题
      navidx: 1,
    },
    topHeightrpx: app.globalData.topHeightrpx,//距离顶部 暂时以最大值处理，有轻微差距
  },
  relogin: function () {
    console.log("登录")
    wx.navigateTo({
      url: '../login/index'
    });
  },
  onLoad: function () {
  },
  onShow: function () {
    console.log("me show----------")

    var that = this;
    var id = wx.getStorageSync('user');
    console.log("---id:", id)
    // if (myutil.isBlank(id)) {
    //   wx.redirectTo({
    //     url: '../login/index'
    //   });
    //   return;
    // }
    id = id.account.id;
    this.setData({ uid: id })
    wx.request({
      url: bsurl + 'user/subcount?id=' + id,
      success: function (res) {
        that.setData({

          subcount: res.data
        });
      }
    });
    wx.request({
      url: bsurl + 'user/playlist',
      data: {
        uid: id,
        offset: 0,
        limit: 1000
      },
      success: function (res) {
        that.setData({
          loading: false,
          list1: res.data.playlist.filter(function (item) { return item.userId == id }),
          list2: res.data.playlist.filter(function (item) { return item.userId != id }),
        });
      }
    });
  }
})