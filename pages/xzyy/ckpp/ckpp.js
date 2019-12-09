// pages/xzyy/ckpp/ckpp.js
var s = require("../../../utils/http.js");
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    bHeight: app.globalData.bHeight,  //剩下底部高度
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 1,
      showTip: 0,
      goHome: 1,
      title: '查看匹配结果', //导航栏 中间的标题
    },
    infos: [],
    tabTxt: ['已匹配用户', '匹配指数'], //分类
    tab: [true, true],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let yyNum = options.feelNum;
    console.log("--received feelNum:" + options.feelNum);
    // TODO 通过feelNum查询音缘记录中的userId,hostId,ppzs
    wx.request({
      url: s.yinyuanGetUserPP,
      data:{
        yyNum: yyNum,
        // yyNum: "201905142141291",
      },
      success: function(res){
        console.log("yinyuanGetUserPP succ:", res)
        // 设置显示为对应后台传来的数据
        var data = res.data.rows;
        console.log("GetUserPPData:", data);
        for (var i = 0; i < data.length; i++) {
          var avatarUrl = 'infos[' + i + '].avatarUrl';
          var nickName = 'infos[' + i + '].nickName';
          var ppzs = 'infos[' + i + '].ppzs';
          that.setData({
            [avatarUrl]: data[i].wxAvatarUrl,
            [nickName]: data[i].wxNickName,
            [ppzs]: data[i].ppzs,
          });
        }
      },
      fail:function(res){
        console.log("getUserPP fail:",res)
      }
    })
  },

  // 选项卡
  filterTab: function (e) {
    var data = [true, true],
      index = e.currentTarget.dataset.index;
    data[index] = !this.data.tab[index];
    this.setData({
      tab: data
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // console.log("---ckpp onUnload to home")
    // wx.redirectTo({
    //   url: '/pages/home/home',
    // })
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