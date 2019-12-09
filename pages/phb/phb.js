// pages/phb/phb.js
//获取应用实例
const app = getApp();

var s = require("../../utils/http.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 1,
      goHome: 0,
      title: '音缘排行榜', //导航栏 中间的标题
    },

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    bHeight: app.globalData.bHeight, //剩下底部高度

    top3Lists: [],
    topLists: [],
    // topLists: [{
    //   avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/mM10icFM9LzPaa2D8CLmucMxKWjl4MhOqOMD3PpXUNsQTdQHLcf3rODqGs0kwvyPerpywBiaerqviczWAMCzdyGSA/132",
    //   nickName: "Le",
    //   zyyzs: 233,
    // }, {
    //   avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83erk5UhvmJB8HKUrwnp564tRAVtVERcQB7cOEEU5XaHrNBGw0MUTEU8pA8gT4ZzecIclkaDFuhmaWw/132",
    //   nickName: "平凡的世界",
    //   zyyzs: 222,
    // }, {
    //   avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTIibD7vjC8JExPWf6xtw4kHvDed3U8upfpfNAXicJpGvrd0aRBG2dNGj94LApwgEhThFc9VuHoTr96w/132",
    //   nickName: "^o^爇尽残阳水沉烟",
    //   zyyzs: 200,
    //   },]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // 请求排行榜信息
    wx.request({
      url: s.getRankInfo,
      success: function (res) {
        // 设置显示为对应后台传来的数据
        var data = res.data.rows;
        console.log("getRankInfo data:", data);
        // 设置top3数据
        for (var i = 0; i < 3; i++) {
          var avatarUrl = 'top3Lists[' + i + '].avatarUrl';
          var nickName = 'top3Lists[' + i + '].nickName';
          var zyyzs = 'top3Lists[' + i + '].zyyzs';
          that.setData({
            [avatarUrl]: data[i].wxAvatarUrl,
            [nickName]: data[i].wxNickName,
            [zyyzs]: data[i].zyyzs,
          });
        }
        // 设置剩余排行数据
        for (var i = 0; i < data.length-3; i++) {
          // 剩余的从第4名开始显示
          let j = i+3;
          var avatarUrl = 'topLists[' + i + '].avatarUrl';
          var nickName = 'topLists[' + i + '].nickName';
          var zyyzs = 'topLists[' + i + '].zyyzs';
          that.setData({
            [avatarUrl]: data[j].wxAvatarUrl,
            [nickName]: data[j].wxNickName,
            [zyyzs]: data[j].zyyzs,
          });
        }
      },
      fail: function(res){
        console.log("getRankInfo fail res:",res)
        wx.showToast({
          icon: 'none',
          title: '获取失败',
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})