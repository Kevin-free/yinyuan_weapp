'use strict'; //必须声明'use strict'后才能使用let声明变量否则浏览并不能显示结果

var common = require('../../utils/util.js');
var bsurl = require('../../utils/bsurl.js');
var myUtil = require('../../utils/myUtil.js');
var s = require("../../utils/http.js");

const app = getApp()
var userId = wx.getStorageSync("userId");
var hostInfo = {};
var innerAudioContext = wx.createInnerAudioContext()
var playing = false
// var areaWidth //播放进度滑块移动区域宽度
// var viewWidth //播放进度滑块宽度
// var lastTime //滑块移动间隔计算
// // var currentSongIndex = 0; //当前第几首歌曲
// // let defaultdata = {
// //   winWidth: 0, //屏幕宽带
// //   winHeight: 0, //屏幕高度
// // }
var songNameList = [], //保存歌曲名
  userSongList = [], //保存用户歌曲List
  userFeelList = [],
  hostSongList = [], //保存房主歌曲List，用于onLoad接收后toNext匹配用
  hostFeelList = [],
  arrayUserSongList = [],
  arrayUserFeelList = [];

var currentSongUrl = '',
  hostId,
  feelNum; //当前歌曲url, 保存接收到的feelNum

// var muteVolum = false; // 是否音量静音
var toast = false; //记录是否有toast
var reqFailNum = 0; //记录当前请求失败次数
const MAX_REQFN = 3; //定义最大请求失败次数
let interval;

Page({
  data: {
    showModal: false,
    showModalTip: false,

    showFeel: false, //显示感受

    pace: 0.5, //滚动速度
    interval: 20, //时间间隔
    length: 0, //字体宽度
    offsetLeft: 0, //初始偏移量
    windowWidth: 0, //父容器宽度

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    bHeight: app.globalData.bHeight, //剩下底部高度

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 1,
      showTip: 1,
      title: '寻找音缘', //导航栏 中间的标题
    },

    getUrl: false,
    voice: {
      muteVolum: false,
      playing: false, //是否正在播放
      canPlay: false, //是否可以播放、加载完毕
      time: {}, //当前播放时间
      tip: "",
      margin: 0
    },

    feelList: [],
    // feelList: [{ content: '喜欢' }, { content: '喜欢' }, { content: '喜欢' },
    //   { content: '喜欢' }, { content: '喜欢' }, { content: '喜欢' },
    //   { content: '喜欢' }, { content: '喜欢' }, { content: '喜欢' },
    // ],

    currentSongIndex: 0, //记录当前歌曲下标
    songList: [
    ],

  },

  // 隐藏模态框
  hideModal() {
    console.log("---hideModal")
    this.setData({
      showModal: false,
      showModalTip: false,
    });
    wx.setStorageSync("knowTip", true);
  },
  // 监听页面加载
  onLoad: function (res) {
    var that = this;
    var knowTip = wx.getStorageSync("knowTip");
    console.log("---knowTip:",knowTip)
    if(knowTip==null || knowTip==""){
      console.log("don't knowTip");
      that.setData({
        showModal: true,
        showModalTip: true,
      })
    }
    var userId = wx.getStorageSync("userId");
    // var userInfo = wx.getStorageSync("userInfo");
    // 加载时先清空
    userSongList = [];
    songNameList = [];
    reqFailNum = 0;
    console.log("----userId:", userId)
    console.log("---received Share res:", res);
    // 如果接收res为空，正常进入，随机请求歌曲
    if (myUtil.isBlank(res)) {
      // if (!myUtil.isBlank(res)) {
      console.log("res为空 正常进入", res);
      userFeelList = [];
      hostFeelList = [];
      console.log("---重置userFeelList,hostFeelList")
      // 发送请求数据库存的网易云音乐基本信息除url
      wx.request({
        url: s.getNESongInfoRand,
        data: {},
        method: 'GET', //定义传到后台接受的是post方法还是get方法
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function(res) {
          // 设置显示为对应后台传来的数据
          var data = res.data.rows;
          console.log("歌曲信息---")
          console.log(data);
          for (var i = 0; i < data.length; i++) {
            var id = 'songList[' + i + '].id';
            var name = 'songList[' + i + '].name';
            var author = 'songList[' + i + '].author';
            var url = 'songList[' + i + '].url';
            var cover = 'songList[' + i + '].cover';
            that.setData({
              [id]: data[i].id,
              [name]: data[i].name,
              [author]: data[i].author,
              // [url]: data[i].url,
              [cover]: data[i].cover,
            });
          }
          // 调用跑马灯
          that.startMarquee();
          that.initInnerAudio(); //初始化音乐媒体
        },
        fail: function(e) {
          wx.showToast({
            icon: 'none',
            title: '联网失败',
          })
        }
      })

    } else { //有res，为点击分享界面进入
      console.log("has res:", res);
      // 若hostId == userId，为创建者进入，查看匹配结果
      if (res.hostId == userId) {
        // if (true) {
        console.log("to 查看匹配")
        wx.redirectTo({
          url: './ckpp/ckpp?feelNum=' + res.feelNum,
        })

      } else { //为其他用户进入，根据neId，返回歌曲信息
        console.log("其他用户点进")
        // 清空数组，再次点击分享时
        userFeelList = [];
        // console.log("arrUserSongList:", res.arrayUserSongList);
        // //单击模拟

        // 点击分享进入时，分享界面传来的房主信息
        console.log("received userSongList:", res.userSongList);
        console.log("-----received hostInfo:", res.hostInfo);
        hostInfo = JSON.parse(res.hostInfo);
        // console.log("-----received hostnickName:", res.hostnickName)
        // hostnickName = res.hostnickName;
        // hostavatarUrl = res.hostavatarUrl;

        arrayUserSongList = JSON.parse(res.userSongList);
        arrayUserFeelList = JSON.parse(res.userFeelList); //将字符串转为数组

        console.log("arrayUserSongList", arrayUserSongList);
        console.log("arrayUserSongList[0]:", arrayUserSongList[0]);
        console.log("arrayUserFeelList[0]:", arrayUserFeelList[0]);

        // hostSongList = res.arrayUserSongList;
        // hostFeelList = res.arrayUserFeelList;
        hostSongList = arrayUserSongList;
        hostFeelList = arrayUserFeelList;
        console.log("hostFeelList[0]:", hostFeelList[0])
        hostId = res.hostId;
        console.log("-分享界面进入 hostId:", hostId);
        feelNum = res.feelNum;
        console.log("-分享界面进入 feelNum:", feelNum);
        // 模拟单机
        // hostSongList = [1993749, 26328682, 28188702, 27580689, 63486];
        // hostFeelList = [6, 9,1,2,3];
        // hostId = 4;
        // feelNum = "201901301426034";
        // arrayUserSongList = [1993749, 26328682, 28188702, 27580689, 63486];

        // 传arrayUserSongList即neId获得相应的歌曲信息
        wx.request({
          url: s.getNESongInfoById, //获取对应id歌曲信息
          data: {
            // userSongList: res.arrayUserSongList,
            userSongList: arrayUserSongList,
            // userSongList: [4, 2],
          },
          method: 'post', //post可以传递数组
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function(res) {
            //设置显示为对应后台传来的数据
            var data = res.data.rows;
            console.log("歌曲信息---", data)
            for (var i = 0; i < data.length; i++) {
              var id = 'songList[' + i + '].id';
              var name = 'songList[' + i + '].name';
              var author = 'songList[' + i + '].author';
              var url = 'songList[' + i + '].url';
              var cover = 'songList[' + i + '].cover';
              that.setData({
                [id]: data[i].id,
                [name]: data[i].name,
                [author]: data[i].author,
                [cover]: data[i].cover,
              });
            }
            // 调用跑马灯
            that.startMarquee();
            that.initInnerAudio();
          },
          fail: function(res) {
            console.log("req fail.", res)
          }
        })

      }
    }

  },

  onShow: function(){
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("---xzyy onHide")
    // innerAudioContext.stop();
  },

  /**
  * 生命周期函数--监听页面卸载
  */
  onUnload: function () {
    console.log("---xzyy onUnload pause")
    innerAudioContext.pause();
  },

  //根据viewId查询view的宽度
  queryViewWidth: function(viewId) {
    //创建节点选择器
    return new Promise(function(resolve) {
      var query = wx.createSelectorQuery();
      var that = this;
      setTimeout(function() {
        query.select('.' + viewId).boundingClientRect(function(rect) {
          resolve(rect.width);
        }).exec();
      }, 1000)
    });

  },
  //停止跑马灯
  stopMarquee: function() {
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
  excuseAnimation: function() {
    console.log("exe----")
    var that = this;
    if (that.data.length > that.data.windowWidth) {
      console.log(">>>>>>")
      //设置循环
      interval = setInterval(function() {
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
  startMarquee: function() {
    var that = this;
    that.stopMarquee(); //页面更新时先停止跑马灯，防止加速

    //初始化数据
    // var windowWidth = wx.getSystemInfoSync().windowWidth; // 屏幕宽度
    var pViewWidth = (wx.getSystemInfoSync().windowWidth - 20) / 100 * 60; //父组件宽度（设置是屏幕宽度-padding后的60 %)
    that.data.windowWidth = pViewWidth;
    that.queryViewWidth('txt-mName').then(function(resolve) {
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

  playmusic: function (that, id, br) {
    wx.request({
      url: bsurl + 'music/detail',
      data: {
        id: id
      },
      success: function (res) {
        console.log("playmusic songs[0]", res.data.songs[0])
        app.globalData.curplay = res.data.songs[0];
        !app.globalData.list_am.length && (app.globalData.list_am.push(res.data.songs[0]))
        !app.globalData.list_sf.length && (app.globalData.list_sf.push(res.data.songs[0]))
        app.globalData.curplay.st = app.globalData.staredlist.indexOf(app.globalData.curplay.id) < 0 ? false : true
        that.setData({
          start: 0,
          share: {
            id: id,
            title: app.globalData.curplay.name,
            br: res.data.privileges[0].maxbr,
            des: (app.globalData.curplay.ar || app.globalData.curplay.artists)[0].name
          },
          music: app.globalData.curplay,
          duration: common.formatduration(app.globalData.curplay.dt || app.globalData.curplay.duration),
          // nvabarData: {
          //   name: app.globalData.curplay.name,
          //   author: (app.globalData.curplay.ar || app.globalData.curplay.artists)[0].name,
          //   artid: (app.globalData.curplay.ar || app.globalData.curplay.artists)[0].id,
          // }
        });
        console.log("----playing music:", that.data.music)
        wx.setNavigationBarTitle({ title: app.globalData.curplay.name });
        // app.seekmusic(1);
        // app.playing(1);
        common.loadrec(app.globalData.cookie, 0, 0, that.data.music.id, function (res) {
          that.setData({
            commentscount: res.total
          })
        })
      }
    })

  },

  // 封装获取歌曲url请求
  getSongUrl: function(e) {
    var that = this;
    //播放
    var currentSongIndex = that.data.currentSongIndex;
    var neId = that.data.songList[currentSongIndex].id;

    that.playmusic(that, neId, undefined);
    console.log('neId id:', neId);
    console.log("---req")
    wx.request({ //通过neId获取歌曲url
      url: s.getNESongUrlById,
      data: {
        urlId: neId
      },
      method: 'GET',
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        // 如果请求返回成功
        console.log("--------res:", res)
        console.log("success:", res.data.success);
        if (res.data.success) {
          //成功时则取消loading
          if (toast) {
            setTimeout(function() {
              wx.hideToast()
            }, 10);
            toast = false;
          }
          // 设置显示为对应后台传来的数据
          var data = res.data.rows;
          console.log("---data[0]:", data[0]);
          console.log("data[0]==null", data[0]==null);
          if (data[0] == null) {
            wx.showToast({
              title: '资源错误，到下一首',
              icon: 'none',
              duration: 1500
            })
            // 资源错误时，延时提示信息并切歌
            setTimeout(function(){
              that.toNextSong();
              // that.setData({
              //   currentSongIndex: ++currentSongIndex
              // });
              // that.getSongUrl();
            },1500)
          }else{
            currentSongUrl = data[0];

            innerAudioContext.src = currentSongUrl;
            console.log("播放-->", currentSongUrl);

            reqFailNum = 0;
            that.getFeelContent(); //调用获取感受内容请求   
          }       
        } else {
          // 处理后台getURL超时
          console.log("res.data.msg:", res.data.msg)
          toast = true;
          wx.showToast({
            title: '网络错误，尝试重新请求',
            icon: 'loading',
            duration: 20000 //设置持续loading时间20s
          });
          reqFailNum++;
          console.log("reqFailNum:", reqFailNum)
          if (reqFailNum < MAX_REQFN) {
            that.getSongUrl();
          } else {
            wx.showToast({
              title: '连接失败过多，请检查网络',
            })
          }
        }
      },
      fail: function(e) {
        toast = true;
        wx.showToast({
          title: '连接失败，尝试重新请求',
          icon: 'loading',
          duration: 20000 //设置持续loading时间20s
        });
        reqFailNum++;
        console.log("reqFailNum:", reqFailNum)
        if (reqFailNum < MAX_REQFN) {
          that.getSongUrl();
        } else {
          wx.showToast({
            title: '连接失败过多，请检查网络',
          })
        }
      }
    })
  },

  // 封装获取感受内容请求
  getFeelContent: function(e) {
    var that = this;
    var currentSongIndex = that.data.currentSongIndex;
    var neId = that.data.songList[currentSongIndex].id;
    // 请求感受信息
    wx.request({
      url: s.getIdAndContent,
      data: {
        neId: neId
      },
      method: 'GET', //定义传到后台接受的是post方法还是get方法
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function(res) {
        //成功时则取消loading
        if (toast) {
          setTimeout(function() {
            wx.hideToast()
          }, 10);
          toast = false;
        }
        // 设置显示为对应后台传来的数据
        var data = res.data.rows;
        console.log("感受信息---")
        console.log(data);
        // for (var i = 0; i < data.length; i++) {
        for (var i = 0; i < 9; i++) {
          var id = 'feelList[' + i + '].id';
          var content = 'feelList[' + i + '].content';
          that.setData({
            [id]: data[i].commentId,
            [content]: data[i].content,
            showFeel: true,
          });
        }
      },
      fail: function(e) {
        toast = true;
        wx.showToast({
          title: '获取失败，尝试重新请求',
          icon: 'loading',
          duration: 20000 //设置持续loading时间20s
        });

        reqFailNum++;
        console.log("reqFailNum:", reqFailNum)
        if (reqFailNum < MAX_REQFN) {
          that.getFeelContent();
        } else {
          wx.showToast({
            title: '连接失败过多，请检查网络',
          })
        }
      }
    })
  },

  //初始化initInnerAudio
  initInnerAudio: function(e) {
    var that = this;
    that.getSongUrl(); //调用获取歌曲url请求

    innerAudioContext.obeyMuteSwitch = true //是否遵循系统静音开关，默认为 true
    innerAudioContext.autoplay = true //是否自动播放
    innerAudioContext.onPlay(() => {
      console.log('onPlay')
      playing = true
      that.data.voice.playing = true
      that.data.voice.canPlay = true //加载完成后可以
      that.setData({
        voice: that.data.voice
      })
    })
    innerAudioContext.onPause(() => {
      console.log('Pause')
      playing = false
      that.data.voice.playing = false
      that.setData({
        voice: that.data.voice
      })
    })
    innerAudioContext.onStop(() => {
      console.log('onStop')
      playing = false
      that.data.voice.playing = false
      that.setData({
        voice: that.data.voice
      })
    })

    //播放进度
    innerAudioContext.onTimeUpdate(() => {
      that.data.voice.duration = dateformat(Math.round(innerAudioContext.duration));

      that.data.voice.progress = Math.round(100 * innerAudioContext.currentTime / innerAudioContext.duration) //计算进度值百分比
      that.data.voice.time = dateformat(Math.round(innerAudioContext.currentTime)) //当前时间格式化
      // that.data.voice.margin = Math.round((areaWidth - viewWidth) * (innerAudioContext.currentTime / innerAudioContext.duration)) //计算当前滑块margin-left
      // console.log('进度', innerAudioContext.currentTime + "  " + innerAudioContext.duration)
      that.setData({
        voice: that.data.voice
      })
      // console.log("-----voice:",that.data.voice)
    })
    //播放结束
    innerAudioContext.onEnded(() => {
      console.log("onEnded")
      playing = false
      that.data.voice.progress = 100
      that.data.voice.playing = false
      that.data.voice.time = dateformat(Math.round(innerAudioContext.duration))
      // that.data.voice.margin = Math.round(areaWidth - viewWidth)
      that.setData({
        voice: that.data.voice
      })

    })
    //播放错误
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
      playing = false
      that.data.voice.playing = false
      that.setData({
        voice: that.data.voice
      })
      wx.showToast({
        title: '错误:' + res.errMsg,
        icon: "none"
      })
    })
  },

  //移动音频滑块，此处不能设置moveable-view 的x值，会有冲突延迟
  voiceSeekMove: function(e) {
    var that = this

    if (e.detail.source == "touch") {
      if (that.data.voice.canPlay) {
        var progress = Math.round(e.detail.x / (areaWidth - viewWidth) * 100)
        that.data.voice.progress = progress
        that.data.voice.margin = e.detail.x
        that.data.voice.time = dateformat(Math.round(innerAudioContext.duration * (that.data.voice.progress / 100)))
        that.setData({
          voice: that.data.voice
        })
      }

      console.log("that.data.voice.time----", that.data.voice.time)
      console.log("拖动到时间---", innerAudioContext.duration * (that.data.voice.progress / 100))
      // 触摸滑动的时候seek到对应时间
      innerAudioContext.seek(innerAudioContext.duration * (that.data.voice.progress / 100))

      console.log('当前时间', innerAudioContext.currentTime + "，总时长" + innerAudioContext.duration);
    }
  },
  //移动结束再setData，否则真机上会产生 “延迟重放” 
  seekTouchEnd: function(e) {
    var that = this
    console.log("touched paly status---", that.data.voice.playing);

    if (that.data.voice.playing) { //如果之前是播放状态，继续播放
      setTimeout(function() {
        that.setData({
          voice: that.data.voice
        })
        innerAudioContext.seek(innerAudioContext.duration * (that.data.voice.progress / 100))
        innerAudioContext.play()
      }, 300)
    } else { //如果之前是未播放状态，则不播放
      setTimeout(function() {
        that.setData({
          voice: that.data.voice
        })
        innerAudioContext.seek(innerAudioContext.duration * (that.data.voice.progress / 100))
      }, 300)
    }

  },

  // 点击音频滑块 by kevin
  voiceSeekTap: function(e) {
    console.log("tapped---")
    var that = this
    innerAudioContext.stop()
    console.log(e)
    if (that.data.voice.canPlay) {
      var progress = Math.round(e.detail.x / (areaWidth - viewWidth) * 100)
      that.data.voice.progress = progress
      that.data.voice.margin = e.detail.x
      that.data.voice.time = dateformat(Math.round(innerAudioContext.duration * (that.data.voice.progress / 100)))
    }
    console.log("tapped end play status---", that.data.voice.playing)
    that.setData({
      voice: that.data.voice
    })
    if (that.data.voice.playing) {
      setTimeout(function() {
        innerAudioContext.seek(innerAudioContext.duration * (that.data.voice.progress / 100))
        innerAudioContext.play()
      }, 300)
    } else {
      setTimeout(function() {
        innerAudioContext.seek(innerAudioContext.duration * (that.data.voice.progress / 100))
      }, 300)
    }
  },

  // 点击声音控制
  volumClick: function() {
    console.log("volum clicked")
    var muteVolum = this.data.voice.muteVolum;
    if (muteVolum) {
      innerAudioContext.volume = 1;
      this.data.voice.muteVolum = false;
      this.setData({
        voice: this.data.voice
      })
    } else {
      innerAudioContext.volume = 0;
      this.data.voice.muteVolum = true;
      // muteVolum = true;
      this.setData({
        voice: this.data.voice
      })
    }
  },

  // 点击播放、暂停
  voiceClick: function() {
    var playing2 = this.data.voice.playing
    if (playing2) {
      innerAudioContext.pause()
    } else {
      innerAudioContext.play()
    }
  },

  // 点击爱心、喜欢
  likeClick: function(){
    console.log("----like this.data.music.st", this.data.music.st);
    common.songheart(this, app, 0, this.data.music.st)
  },

  // 下一首事件
  toNextSong: function (e) {
    var userId = wx.getStorageSync("userId");
    // var userInfo = wx.getStorageSync("userInfo");
    var that = this;
    reqFailNum = 0;
    innerAudioContext.stop(); //上一曲停止

    var currentSongIndex = that.data.currentSongIndex;
    // 将当前以选择的歌曲id和感受id存到数组中，传到share界面
    songNameList.push(that.data.songList[currentSongIndex].name)
    userSongList.push(that.data.songList[currentSongIndex].id)
    // userFeelList.push(e.currentTarget.dataset.id)
    console.log("------e:",e)
    userFeelList.push(myUtil.isBlank(e) ? 0 : e.currentTarget.dataset.id == myUtil.isBlank(e.currentTarget.dataset.id) ? 0 : e.currentTarget.dataset.id)
    // console.log("that.data:", that.data.songList[currentSongIndex].id)
    // arrayUserSongList.push(that.data.songList[currentSongIndex].id)
    // arrayUserFeelList.push(e.currentTarget.dataset.id)
    // 如果不是最后一首歌，否则到分享界面或查看匹配
    if (currentSongIndex < that.data.songList.length - 1) {
      console.log("currentSongIndex:", currentSongIndex);
      console.log("saved sondName:", that.data.songList[currentSongIndex].name);
      console.log("saved sondId:", that.data.songList[currentSongIndex].id);
      console.log('saved feelId:', myUtil.isBlank(e)? 0 : e.currentTarget.dataset.id == myUtil.isBlank(e.currentTarget.dataset.id) ? 0 : e.currentTarget.dataset.id);
      console.log("toNextSong---");
      currentSongIndex++;

      that.setData({
        currentSongIndex: currentSongIndex,
        showFeel: false,
      });
      // 调用跑马灯
      that.startMarquee();
      // that.onShow();
      // 调用获取歌曲URL和感受
      that.getSongUrl();

    } else { // 最后一首播放完后
      if (myUtil.isBlank(hostFeelList)) { //如果是正常发起后
        // if (!myUtil.isBlank(hostFeelList)) {
        console.log("to share---");
        console.log("---创建userId:", userId);
        feelNum = myUtil.createFeelNum(); //feelNum通过util生成获取
        console.log("---创建feelNum:", feelNum);
        // console.log("songNameList:", songNameList);
        // console.log("userSongList:", userSongList);
        // console.log("userFeelList:", userFeelList);
        //添加hostId的yinyuan记录，避免无用户推荐
        wx.request({
          url: s.yinyuanInsert,
          data: {
            userId: userId,
            hostId: userId,
            yyNum: feelNum,
            ppzs: 5,
            addyingan: 0,
          },
          method: 'post', //post可以传递数组
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function (res) {
            console.log("success res:", res);
          },
          fail: function (res) {
            console.log("fail!", res);
          }
        })
        wx.redirectTo({
          url: 'share/share?songNameList=' + JSON.stringify(songNameList) + '&userSongList=' + JSON.stringify(userSongList) 
          + '&userFeelList=' + JSON.stringify(userFeelList) + '&feelNum=' + feelNum, //将数组转为字符串
        })
      } else { // 其他用户点击分享匹配游戏后
        console.log("其他用户匹配完结果")
        console.log("hostFeelList:", hostFeelList)

        console.log("hostFeelList[0]:")
        console.log(hostFeelList[0]);
        console.log("userFeelList:", userFeelList);
        // console.log("userFeelList:", arrayUserFeelList);
        console.log("insert-- hostSongList:", hostSongList);

        let ppzs = 0;
        // 循环遍历数组的值进行比较
        console.log("hostFeelList.length", hostFeelList.length)
        for (let i = 0; i < hostFeelList.length; i++) {
          console.log("hostFeelList[i]:", hostFeelList[i] + ",userFeelList[i]:", userFeelList[i])
          // console.log("hostFeelList[i]:", hostFeelList[i] + ",userFeelList[i]:", arrayUserFeelList[i])
          console.log("==:", hostFeelList[i] == userFeelList[i])
          // console.log("==:", hostFeelList[i].con)
          if (hostFeelList[i] == userFeelList[i]) {
            ppzs++;
          }
        }
        wx.showToast({
          title: '匹配指数：'+ppzs,
        })
        console.log("----toNext hostInfo:", hostInfo)
        wx.redirectTo({
          url: './result/index?ppzs=' + ppzs + '&hostavatarUrl=' + hostInfo.avatarUrl + '&hostnickName=' + hostInfo.nickName,
        })
        console.log("---匹配指数：", ppzs)
        let addyingan = ppzs==5 ? 25 : ppzs;
        console.log("---新增音感：", addyingan)
        // 将用户id和创建者id和feelNum和匹配度
        console.log("---匹配userId:", userId);
        console.log("---匹配hostId:", hostId);
        console.log("---匹配feelNum:", feelNum);
        // console.log("---匹配指数：:", ppzs);
        //添加yinyuan记录，同时会更新用户的总匹配指数和音感
        wx.request({
          url: s.yinyuanInsert,
          data: {
            userId: userId,
            hostId: hostId,
            yyNum: feelNum,
            ppzs: ppzs,
            addyingan: addyingan,
          },
          method: 'post', //post可以传递数组
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function (res) {
            console.log("success res:", res);
          },
          fail: function (res) {
            console.log("fail!", res);
          }
        })

      }
    }
  },

})

function dateformat(second) {
  //天
  var day = Math.floor(second / (3600 * 24))
  // 小时位
  var hour = Math.floor((second - day * 3600 * 24) / 3600);
  // 分钟位
  var min = Math.floor((second - day * 3600 * 24 - hour * 3600) / 60);
  // 秒位
  var sec = (second - day * 3600 * 24 - hour * 3600 - min * 60); // equal to => var sec = second % 60;

  return {
    'day': day,
    'hour': p(hour),
    'min': p(min),
    'sec': p(sec)
  }
}
//创建补0函数
function p(s) {
  return s < 10 ? '0' + s : s;
}