// pages/xzyy/result/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    zs: '零',
    userInfo: {},
    hostInfo: {},
    hostInfo: {
      avatarUrl: "https://wx.qlogo.cn/mmopen/vi_32/DYAIOgq83erk5UhvmJB8HKUrwnp564tRAVtVERcQB7cOEEU5XaHrNBGw0MUTEU8pA8gT4ZzecIclkaDFuhmaWw/132",
      nickName: "平凡的世界",
    },

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 1,
      showTip: 0,
      goHome: 1,
      title: '匹配结果', //导航栏 中间的标题
    },

    randTxt: "",
    // 随机句子
    allRandTxt: ["众里寻他千百度\n\n蓦然回首\n\n那人却在灯火阑珊处",
      "向来情深\n\n奈何缘浅",
      "人生若只如初见\n\n何事秋风悲画扇",
      "两情若是久长时\n\n又岂在朝朝暮暮",
      "山有木兮木有枝\n\n心悦君兮知不知",
      "衣带渐宽终不悔\n\n为伊消得人憔悴",
      "曾经沧海难为水\n\n除却巫山不是云",
      "十年生死两茫茫\n\n不思量\n\n自难忘\n\n千里孤坟\n\n无处话凄凉",
      "每个人来到世上\n\n都是匆匆过客\n\n有些人与之邂逅\n\n转身忘记\n\n有些人与之擦肩\n\n必然回首",
      "缘分是本书\n\n翻得不经意会错过\n\n读得太认真会流泪",
      "千生百世\n\n缘起缘灭\n\n皆已注定",
      "情缘两边两陌路\n\n咫尺一厘一天涯",
      "会不会有这样的两个人\n\n生来\n\n便是为了遇见",
      "相遇是缘\n\n两忘心安",
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log("allRandTxt.length:", that.data.allRandTxt.length);
    // 获取随机数
    var rand = Math.floor(Math.random() * that.data.allRandTxt.length);
    // 随机从数组中取出某值（不会改变原数组）
    // var data = this.peoples.slice(rand, 1)[0];
    // 随机从数组中取出某值（会改变原数组）
    // var data = this.peoples.splice(rand, 1)[0];
    // console.log("---data:", data)

    that.setData({
      randTxt: that.data.allRandTxt.splice(rand, 1)[0]
    })
    console.log("---end txt:", that.data.allRandTxt)

    var zs = options.ppzs;
    var hostavatarUrl = options.hostavatarUrl;
    var hostnickName = options.hostnickName;
    console.log("recived opt.zs:", zs);
    console.log("recived hostnickName:", hostnickName);
    var userInfo = wx.getStorageSync("userInfo");
    that.setData({
      'userInfo.avatarUrl': userInfo.avatarUrl,
      'userInfo.nickName': userInfo.nickName,
      'hostInfo.avatarUrl': hostavatarUrl,
      'hostInfo.nickName': hostnickName,
    });

    switch (zs) {
      case "0":
        that.setData({
          zs: "零",
        });
        break;
      case "1":
        that.setData({
          zs: "一",
        });
        break;
      case "2":
        that.setData({
          zs: "二",
        });
        break;
      case "3":
        that.setData({
          zs: "三",
        });
        break;
      case "4":
        that.setData({
          zs: "四",
        });
        break;
      case "5":
        that.setData({
          zs: "五",
        });
        break;
    }
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