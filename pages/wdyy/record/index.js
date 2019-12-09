var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
Page({
  data: {
    loading: false,
    // weekData: [],
    weekData: {
      weekData: [{
        playCount: 520,
        score: 100,
        song: { name: "情歌王", ar: [{ name: "古巨基", }], al: { name: "我还是你的 - 情歌王", } },
      },],
      code: 200
    },
    allData: [],
    code: 0,
    tab: 1,
    curplay: -1
  },
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: bsurl + 'record',
      data: {
        cookie: app.globalData.cookie,
        uid: options.uid,
        type: 1
      },
      success: function (res) {
        // console.log("my data:", that.data.weekData)
        // console.log("week data:", res.data)
        that.setData({
          // weekData: that.data.weekData
          weekData: res.data
        })
      }
    })
    wx.request({
      url: bsurl + 'record',
      data: {
        uid: options.uid,
        type: 0
      },
      success: function (res) {
        // console.log("all data:", res.data)
        that.setData({
          allData: res.data
        })
      },
      complete: function () {
        that.setData({
          loading: true
        })
      }
    })
  },
  switchtab: function (e) {
    var t = e.currentTarget.dataset.t;
    // console.log(t)
    this.setData({
      tab: t
    });
  }
})