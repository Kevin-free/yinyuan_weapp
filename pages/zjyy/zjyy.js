// pages/zjyy/zjyy.js
//获取应用实例
let app = getApp();
var s = require("../../utils/http.js");
var common = require('../../utils/util.js');
var bsurl = require('../../utils/bsurl.js');
var nt = require('../../utils/nt.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    playing: false, //默认播放状态
    hasRec: true, //是否有推荐
    curplay: {},

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 1,
      goHome: 0,
      title: '最佳音缘', //导航栏 中间的标题
    },

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    bHeight: app.globalData.bHeight, //剩下底部高度

    recinfoLists: {}, // 推荐信息

    magnifyMedia: {}, //swiper放大动画
    shrinkMedia: {}, //swiper缩小动画

  },

  xzyy: function(){
    console.log("---xzyy")
  },

  // 滑动swiper事件
  applyMediaSwiper: function (e) {
    // console.log("---swiper e:",e)
    var recinfoLists = this.data.recinfoLists;
    // console.log("advertisements.length:",advertisements.length)
    for (let i = 0; i < recinfoLists.length; i++) {
      if (i == e.detail.current) {
        recinfoLists[i].state = 1;
      } else {
        recinfoLists[i].state = 0;
      }
    }
    this.setData({
      recinfoLists: recinfoLists
    })
  },

  // 到相应歌曲
  toSongById: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.songid;
    console.log("taped id:", id)

    wx.navigateTo({
      url: '../wdyy/playing/index?id=' + id,
    })
  },

  // 播放、暂停歌曲
  playingtoggle: function (e) {
    var that = this;
    var id = e.currentTarget.dataset.songid;
    console.log("taped songid:", id)
    wx.request({
      url: bsurl + 'music/detail',
      data: {
        id: id
      },
      success: function (res) {
        app.globalData.curplay = res.data.songs[0];

        common.toggleplay(that, app, null)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;

    //动画
    var magnifyMedia = wx.createAnimation({
      timingFunction: "ease",
    })
    magnifyMedia.scale(1, 1).step();
    this.setData({
      magnifyMedia: magnifyMedia.export()
    })
    var shrinkMedia = wx.createAnimation({
      timingFunction: "ease",
    })
    shrinkMedia.scale(0.95, 0.9).step();
    this.setData({
      shrinkMedia: shrinkMedia.export()
    })

    var userId = wx.getStorageSync("userId");
    console.log("最佳音缘 onload userId:", userId);
    wx.request({
      url: s.getRecommendByUserId,
      data: {
        userID: userId
      },
      success: function (res) {
        // console.log("success res:", res);
        // console.log("res.data.rows:", res.data.rows);
        // console.log("res.data.rows.length:", res.data.rows.length);
        if (res.data.rows.length != 0) {
          console.log("---hasRec")
          that.setData({
            hasRec: true
          })
          var recinfoLists = res.data.rows;
          // 初始化swiper状态
          for (let index = 0; index < res.data.rows.length; index++) {
            if (index == 0) {
              recinfoLists[index].state = 1; // state=1, 当前显示
            } else {
              recinfoLists[index].state = 0; // state=0, 不显示
            }
          }
          that.setData({
            recinfoLists: recinfoLists
          })
        }
        console.log("that.data.recinfoLists:", that.data.recinfoLists);
      },
      fail: function (res) {
        console.log("fail!", res);
      }
    })
  },

  music_next: function (r) {
    this.setData({
      music: r.music,
      playtype: r.playtype,
      curplay: r.music.id
    })
  },
  music_toggle: function (r) {
    this.setData({
      playing: r.playing,
      music: r.music,
      playtype: r.playtype,
      curplay: r.music.id
    })
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

    nt.addNotification("music_next", this.music_next, this);
    nt.addNotification("music_toggle", this.music_toggle, this)
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

    nt.removeNotification("music_next", this)
    nt.removeNotification("music_toggle", this)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

    nt.removeNotification("music_next", this)
    nt.removeNotification("music_toggle", this)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})