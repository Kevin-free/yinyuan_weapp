// pages/xzyy/share/share.js
var myUtil = require('../../../utils/myUtil.js');
var s = require("../../../utils/http.js");
//获取应用实例
const app = getApp()

var arraySongNameList, arrayUserSongList, arrayUserFeelList, feelNum;

Page({
  data: {

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    bHeight: app.globalData.bHeight,  //剩下底部高度

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 1,
      goHome: 1,
      title: '音缘', //导航栏 中间的标题
    },

    song: []

  },

  onLoad: function(e) {
    var that = this;
    // console.log("e:",e)

    // console.log("received feelNum:", e.feelNum);
    // console.log("received songNameList:", e.songNameList);
    // console.log("received userSongList:", e.userSongList);
    // console.log("received userFeelList:", e.userFeelList);
    // arrayUserSongList = e.userSongList;
    // arrayUserFeelList = e.userFeelList;
    feelNum = e.feelNum;
    arraySongNameList = JSON.parse(e.songNameList);
    arrayUserSongList = JSON.parse(e.userSongList); //将字符串转为数组
    arrayUserFeelList = JSON.parse(e.userFeelList);
    // console.log("arraySongNameList:", arraySongNameList)
    // console.log("arrayUserSongList:", arrayUserSongList)
    for (var i = 0; i < arraySongNameList.length; i++) {
      var id = 'song[' + i + '].id';
      var name = 'song[' + i + '].name';
      that.setData({
        [id]: arrayUserSongList[i],
        [name]: arraySongNameList[i]
      })
    }

    // that.setData({
    //   songName: arraySongNameList[0]
    // })
  },

  // 到相应歌曲
  toSongById: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;

    wx.navigateTo({
      url: '../../wdyy/playing/index?id=' + id,
    })
  },

  // 分享
  onShareAppMessage: function () {
    var hostInfo = wx.getStorageSync("userInfo")
    console.log("----hostInfo:", hostInfo)
    var that = this;
    // var feelNum = myUtil.createFeelNum(); //feelNum通过util生成获取
    var userId = wx.getStorageSync("userId");

    // console.log("[share] feelNum:", feelNum);
    // console.log('[share] userId:', userId);
    // console.log("[share] arrayUserSongList", arrayUserSongList);
    // console.log("[share] arrayUserFeelList", arrayUserFeelList);
    // console.log("[share] hostInfo", hostInfo);
    return {
      title: '你会是我的最佳音缘人吗',
      // path: '/pages/xzyy/xzyy?arrayUserSongList=' + arrayUserSongList + '&arrayUserFeelList=' + arrayUserFeelList + '&feelNum=' + feelNum + '&hostId=' + userId,
      path: '/pages/xzyy/xzyy?userSongList=' + JSON.stringify(arrayUserSongList) + '&userFeelList=' + JSON.stringify(arrayUserFeelList) + '&feelNum=' + feelNum + '&hostId=' + userId + '&hostInfo=' + JSON.stringify(hostInfo),
      imageUrl: "http://yinyuan.ifree258.top/share.png",
      success: function(res) { //现在微信不让判断了
        console.log("分享成功", res)
      },
      fail: function(res) {
        console.log("分享失败")
      }
    }
  },

})