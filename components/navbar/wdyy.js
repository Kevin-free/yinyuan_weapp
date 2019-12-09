// components/navbar/wdyy.js
const app = getApp()
let interval;

Component({
  properties: {
    navbarData: {   //navbarData   由父页面传递的数据，变量名字自命名
      type: Object,
      value: {},
      observer: function (newVal, oldVal) { }
    }
  },
  data: {

    pace: 0.5, //滚动速度
    interval: 20, //时间间隔
    length: 0, //字体宽度
    offsetLeft: 0, //初始偏移量
    windowWidth: 0, //父容器宽度

    height: '',
    //默认值  默认显示左上角
    navbarData: {
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
      lWidth: app.globalData.winWidth - 98, //屏幕宽度-胶囊宽度 在微调
      // width: app.globalData.wWidth - 98, //屏幕宽度-胶囊宽度 在微调
      // height: app.globalData.height,
      // rheight: app.globalData.rheight
    })

  },

  // 在组件布局完成后执行
  ready: function () {
    console.log("dodo---")
    // this.startMarquee();
  },

  methods: {
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
    // 到歌手详情页
    infoDetail() {
      console.log("infoDetail---")
      console.log("artid:", this.data.navbarData.artid);
      wx.navigateTo({
        url: '/pages/wdyy/artist/index?id=' + this.data.navbarData.artid,
      })
    },

    //根据viewId查询view的宽度
    queryViewWidth: function (viewId) {
      var that = this;
      //创建节点选择器
      return new Promise(function (resolve) {
        // var query = wx.createSelectorQuery(); //不可以，这样获取不到自定义组件中的节点
        // var query = wx.createSelectorQuery().in(that); //可以，指定选取范围为自定义组件component内
        var query = that.createSelectorQuery(); //可以，component带有createSelectorQuery方法
        setTimeout(function () {
          query.select('.' + viewId).boundingClientRect(function (rect) {
            resolve(rect.width);
          }).exec();
        }, 1000)
      });
    },

    //停止跑马灯
    stopMarquee: function () {
      console.log("stop-------")
      var that = this;
      //清除旧的定时器
      clearInterval(interval);
      that.setData({
        offsetLeft: 0,
      })
      // if (that.data != null) {
      //   // clearInterval(that.interval);
      //   clearInterval(interval);
      // }
    },
    //执行跑马灯动画
    excuseAnimation: function () {
      console.log("exe----")
      var that = this;
      if (that.data.length > that.data.windowWidth) {
        console.log(">>>>>>")
        //设置循环
        interval = setInterval(function () {
          if (that.data.offsetLeft <= 0) {
            if (that.data.offsetLeft >= -that.data.length) {
              // console.log("that.data.offsetLeft >= -that.data.length")
              that.setData({
                offsetLeft: that.data.offsetLeft - that.data.pace,
              })
            } else {
              // console.log("else---that.data.offsetLeft >= -that.data.length")
              that.setData({
                offsetLeft: that.data.windowWidth,
              })
            }
          } else {
            // console.log("else---that.data.offsetLeft <= 0")
            that.setData({
              offsetLeft: that.data.offsetLeft - that.data.pace,
            })
          }
        }, that.data.interval);
        console.log("interval:", interval)
      } else {
        console.log("<<<<<<<")
        that.stopMarquee();
      }
    },
    //开始判断跑马灯
    startMarquee: function () {
      var that = this;
      that.stopMarquee(); //页面更新时先停止跑马灯，防止加速

      //初始化数据
      // var windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
      var pViewWidth = (wx.getSystemInfoSync().windowWidth - 20) / 100 * 60; //父组件宽度（设置是屏幕宽度-padding后的60 %)
      that.data.windowWidth = pViewWidth;
      that.queryViewWidth('txt-mName').then(function (resolve) {
        that.data.length = resolve;
        console.log(that.data.length + "/" + that.data.windowWidth);
        if (that.data.length > that.data.windowWidth) {
          console.log("onshow start >>>>")
          that.excuseAnimation();
        } else {
          console.log("onshow start <<<<")
          clearInterval(interval);
        }
      });
    },
  },

}) 