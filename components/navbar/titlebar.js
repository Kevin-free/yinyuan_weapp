// components/navbar/titlebar.js
const app = getApp()
Component({
  properties: {
    navbarData: { //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function(newVal, oldVal) {}
    }
  },
  data: {
    height: '',
    //默认值  默认显示左上角
    navbarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 1, //是否显示返回图标   1表示显示    0表示不显示
      showTip: 0, //是否显示提示模态框   1表示显示    0表示不显示
      showWenhao: 0,
      showHomeTip: 0, //是否显示主页提示 1表示显示    0表示不显示
      goHome: 0, //是否回主页
      bg: "",
    },

    tishi_num: 1,
    wenxuan: 2,
    tishi_img: "http://yinyuan.ifree258.top/homeInfo1.png",
  },
  attached: function() {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share
    })
    // 定义导航栏的高度   方便对齐
    this.setData({
      barHeight: app.globalData.barHeight, //距离状态栏高度
      barHeightrpx: app.globalData.barHeightrpx,
      // lWidth: app.globalData.winWidth - 98, //屏幕宽度-胶囊宽度 在微调
      lWidth: app.globalData.winWidth - 108, //屏幕宽度-胶囊宽度 在微调
      windowWidth: app.globalData.winWidth,
      windowHeight: app.globalData.winHeight,
    })
  },
  methods: {
    // 回主页
    goHome() {
      console.log("----nav goHome")
      wx.redirectTo({
        url: '/pages/home/home',
      })
      // wx.navigateTo({
      //   url: '/pages/home/home',
      // })
    },
    // 点击问号显示主页提示
    showHomeTip() {
      console.log("----show HomeTip");
      this.setData({
        tishi_num: 1,
        tishi_img: "http://yinyuan.ifree258.top/homeInfo1.png",
        'navbarData.showHomeTip': !this.data.navbarData.showHomeTip,
        wenxuan: 1
      });
    },
    // 点击提示图片事件
    btn_img: function(t) {
      wx.setStorageSync("knowHomeTip", true)
      var a = this;
      return 1 == a.data.tishi_num ? (a.setData({
        tishi_img: "http://yinyuan.ifree258.top/homeInfo2.png",
        tishi_num: 2
      }), !1) : 2 == a.data.tishi_num ? (a.setData({
        tishi_img: "http://yinyuan.ifree258.top/homeInfo3.png",
        tishi_num: 3
      }), !1) : 3 == a.data.tishi_num ? (a.setData({
        tishi_img: "http://yinyuan.ifree258.top/homeInfo4.png",
        tishi_num: 4
      }), !1) : 4 == a.data.tishi_num ? (a.setData({
        tishi_img: "http://yinyuan.ifree258.top/homeInfo5.png",
        tishi_num: 5
      }), !1) : 5 == a.data.tishi_num ? (a.setData({
        tishi_img: "http://yinyuan.ifree258.top/homeInfo6.png",
        tishi_num: 6
      }), !1) : void(6 == a.data.tishi_num && (a.setData({
        'navbarData.showHomeTip': !1,
        tishi_num: 1
      }), 2 == a.data.wenxuan));
    },
    // 返回提示
    showTip() {
      console.log("---showTip");
      wx.showModal({
        title: '是否退出?',
        content: '退出将结束本次寻找，无法再续前缘哦',
        confirmText: '退出',
        success(res) {
          if (res.confirm) {
            // wx.navigateBack();  //这样返回不会调用寻找音缘界面的onHide方法
            wx.redirectTo({
              url: '/pages/home/home',
            })
            // wx.navigateTo({ //这样跳转到首页会调用寻找音缘界面的onHide方法，停止音乐
            //   url: '/pages/home/home',
            // })
          }
        }
      })
    },
    // 返回上一页面
    _navback() {
      console.log("---titlebar back");
      wx.navigateBack()
    },
    //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  }

})