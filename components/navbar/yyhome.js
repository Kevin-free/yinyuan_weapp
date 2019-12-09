// components/navbar/wdyy.js
const app = getApp()

Component({
  properties: {
    navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function (newVal, oldVal) { }
    }
  },
  data: {
    //默认值  默认显示左上角
    navbarData: {
      navidx: 0, //默认导航下标
    }
  },

  // 在组件实例进入页面节点树时执行
  attached: function () {
    // 获取是否是通过分享进入的小程序
    this.setData({
      share: app.globalData.share
    })
    // 定义导航栏的高度   方便对齐
    this.setData({
      barHeight: app.globalData.barHeight,  //距离状态栏高度
      barHeightrpx: app.globalData.barHeightrpx,  //距离状态栏高度
      lWidth: app.globalData.winWidth - 98, //屏幕宽度-胶囊宽度 在微调
    })

  },

  methods: {
    // 切换导航
    switchnav(e) {
      var that = this;
      var t = e.currentTarget.dataset.t;
      console.log("---nav t:", t)
      console.log("---data.nav :", this.data.navbarData.navidx)
      if (t == 0) {
        console.log("---to yy")
        this.setData({
          'navbarData.navidx': t
        });
        wx.redirectTo({
          url: '../home/index',
        })
      }
      if (t == 1) {
        console.log("---to my")
        this.setData({
          'navbarData.navidx': t
        });
        wx.redirectTo({
          url: '../me/index',
        })
      }
    },
    // 返回上一页面
    _navback() {
      wx.navigateBack()
    },
    //返回到首页
    _backhome() {
      wx.switchTab({
        url: '/pages/index/index',
      })
    },

  }

}) 