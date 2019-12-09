// pages/wdyy/playing/playing.js
//获取应用实例
const app = getApp()
var s = require("../../../utils/http.js");

var backgroundAudioManager = wx.getBackgroundAudioManager();
var areaWidth //播放进度滑块移动区域宽度
var viewWidth //播放进度滑块宽度
var lastTime //滑块移动间隔计算

var currentSongUrl = '';
var toast = false; //记录是否有toast
var reqFailNum = 0; //记录当前请求失败次数
const MAX_REQFN = 3; //定义最大请求失败次数

Page({
  data: {

    voice: {
      playing: false,  //是否正在播放
      canPlay: false, //是否可以播放、加载完毕
      time: {}, //当前播放时间
      margin: 0,

    },

    stylusW: 50,
    panW: 100,
    vHeight: 200,

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '我的主页', //导航栏 中间的标题
      id: 139774,
      name: 'The Truth That You Leave (你离开的事实)',
      author: 'Pianoboy',
      url: 'https://m701.music.126.net/20190427173734/bd1461c42483672bf0f1e3052578a1b3/jdyyaac/035c/5458/070b/46c5c3f076c2d2640b0b0ac88e0a5192.m4a',
      cover: 'https://p1.music.126.net/9idkdzbel_-lYBP7Dv_dVQ==/102254581395289.jpg',
    },

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    bHeight: app.globalData.bHeight,  //剩下底部高度

    currentSongIndex: 0, //记录当前歌曲下标
    songList: [{ //歌曲list数组
      id: 139774,
      name: 'The Truth That You Leave',
      author: 'Pianoboy高至豪',
      url: 'https://m701.music.126.net/20190427173734/bd1461c42483672bf0f1e3052578a1b3/jdyyaac/035c/5458/070b/46c5c3f076c2d2640b0b0ac88e0a5192.m4a',
      cover: 'https://p1.music.126.net/9idkdzbel_-lYBP7Dv_dVQ==/102254581395289.jpg',
    }, {
      id: 400162138,
      name: '海阔天空',
      author: 'Beyond',
      url: 'http://m10.music.126.net/20190130154050/5c80ce33365f219fd15cfd22f4030c18/ymusic/603f/2799/ea87/0ac26d0e219c049b2c5a12fd6be2826f.mp3',
      cover: 'http://p1.music.126.net/a9oLdcFPhqQyuouJzG2mAQ==/3273246124149810.jpg',
    },],
  },

  onLoad: function (res) {
    var that = this;
    //第一次进来应该获取节点信息，用来计算滑块长度
    if (areaWidth == undefined || areaWidth == null || viewWidth == undefined || viewWidth == null) {
      var query = wx.createSelectorQuery()
      setTimeout(function () { //代码多的情况下需要延时执行，否则可能获取不到节点信息
        //获取movable的宽度，计算改变进度使用
        query.select('#movable-area').boundingClientRect(function (rect) {
          areaWidth = rect.width
          console.log("areaWidth------->", areaWidth)
        }).exec()
        query.select('#movable-view').boundingClientRect(function (rect) {
          viewWidth = rect.width // 节点的宽度
          console.log("viewWidth------->", viewWidth)
        }).exec()
      }, 1000)
    }
    
    console.log("res:", res)
    let songId = res.songId;
    console.log("songId:",songId)
    // TODO 发请求通过songId获取歌曲信息及url
    // 传arrayUserSongList即neId获得相应的歌曲信息
    wx.request({
      url: s.getNESongInfoById, //获取对应id歌曲信息
      data: {
        // userSongList: res.arrayUserSongList,
        userSongList: res.songId,
        // userSongList: [4, 2],
      },
      method: 'post', //post可以传递数组
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        //设置显示为对应后台传来的数据
        var data = res.data.rows;
        console.log("查询到的歌曲信息---", data)

        var id = 'nvabarData.id';
        var name = 'nvabarData.name';
        var author = 'nvabarData.author';
        var cover = 'nvabarData.cover';
          that.setData({
            [id]: data[0].id,
            [name]: data[0].name,
            [author]: data[0].author,
            [cover]: data[0].cover,
          });
        that.initBackAudio(); //初始化音乐媒体
      },
      fail: function (res) {
        console.log("req fail.", res)
        that.initBackAudio(); //单机测试用
      }
    })

    // var currentSongIndex = that.data.currentSongIndex;
    // backgroundAudioManager.title = that.data.songList[currentSongIndex].name;
    // backgroundAudioManager.singer = that.data.songList[currentSongIndex].author;
    // backgroundAudioManager.src = that.data.songList[currentSongIndex].url;
    // backgroundAudioManager.coverImgUrl = that.data.songList[currentSongIndex].cover;

  },

  // 封装获取歌曲url请求
  getSongUrl: function (e) {
    var that = this;
    //播放
    var currentSongIndex = that.data.currentSongIndex;
    var neId = that.data.nvabarData.id;
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
      success: function (res) {
        // 如果请求返回成功
        console.log("success:", res.data.success);
        if (res.data.success) {
          //成功时则取消loading
          if (toast) {
            setTimeout(function () {
              wx.hideToast()
            }, 10);
            toast = false;
          }
          // 设置显示为对应后台传来的数据
          var data = res.data.rows;
          console.log("---data:", data);
          currentSongUrl = data[0];

          backgroundAudioManager.src = currentSongUrl;
          console.log("播放-->", currentSongUrl);

          reqFailNum = 0;    
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
      fail: function (e) {
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

  //初始化音频initBackAudio
  initBackAudio: function(e){
    var that = this;
    that.getSongUrl(); //调用获取歌曲url请求
    // 单击测试
    // backgroundAudioManager.src = "https://m701.music.126.net/20190427173734/bd1461c42483672bf0f1e3052578a1b3/jdyyaac/035c/5458/070b/46c5c3f076c2d2640b0b0ac88e0a5192.m4a";

    backgroundAudioManager.title = that.data.nvabarData.name;
    backgroundAudioManager.coverImgUrl = that.data.nvabarData.cover;
    // 监听播放
    backgroundAudioManager.onPlay(() => {
      console.log('onPlay')
      that.data.voice.playing = true
      that.data.voice.canPlay = true //加载完成后可以
      that.setData({
        voice: that.data.voice
      })
    })
    // 监听暂停
    backgroundAudioManager.onPause(() => {
      console.log('Pause')
      that.data.voice.playing = false
      that.setData({
        voice: that.data.voice
      })
    })
    // 监听停止
    backgroundAudioManager.onStop(() => {
      console.log('onStop')
      that.data.voice.playing = false
      that.setData({
        voice: that.data.voice
      })
    })
    //播放结束
    backgroundAudioManager.onEnded(() => {
      console.log("onEnded")
      that.data.voice.progress = 100
      that.data.voice.playing = false
      that.data.voice.time = dateformat(Math.round(backgroundAudioManager.duration))
      // that.data.voice.margin = Math.round(areaWidth - viewWidth)
      that.setData({
        voice: that.data.voice
      })
    })
    //播放进度
    backgroundAudioManager.onTimeUpdate(() => {
      that.data.voice.duration = dateformat(Math.round(backgroundAudioManager.duration));

      that.data.voice.progress = Math.round(100 * backgroundAudioManager.currentTime / backgroundAudioManager.duration) //计算进度值百分比
      that.data.voice.time = dateformat(Math.round(backgroundAudioManager.currentTime)) //当前时间格式化
      that.data.voice.margin = Math.round((areaWidth - viewWidth) * (backgroundAudioManager.currentTime / backgroundAudioManager.duration)) //计算当前滑块margin-left
      // console.log('进度', backgroundAudioManager.currentTime + "  " + backgroundAudioManager.duration)
      that.setData({
        voice: that.data.voice
      })
      // console.log("-----onTimeUpdate:",that.data.voice)
    })
    //播放错误
    backgroundAudioManager.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
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
  voiceSeekMove: function (e) {
    var that = this

    if (e.detail.source == "touch") {
      if (that.data.voice.canPlay) {
        var progress = Math.round(e.detail.x / (areaWidth - viewWidth) * 100)
        that.data.voice.progress = progress
        that.data.voice.margin = e.detail.x
        that.data.voice.time = dateformat(Math.round(backgroundAudioManager.duration * (that.data.voice.progress / 100)))
        that.setData({
          voice: that.data.voice
        })
      }

      console.log("that.data.voice.time----", that.data.voice.time)
      console.log("拖动到时间---", backgroundAudioManager.duration * (that.data.voice.progress / 100))
      // 触摸滑动的时候seek到对应时间
      backgroundAudioManager.seek(backgroundAudioManager.duration * (that.data.voice.progress / 100))

      // console.log('当前时间', backgroundAudioManager.currentTime + "，总时长" + backgroundAudioManager.duration);
    }
  },
  //移动结束再setData，否则真机上会产生 “延迟重放” 
  seekTouchEnd: function (e) {
    var that = this
    console.log("touched paly status---", that.data.voice.playing);

    if (that.data.voice.playing) { //如果之前是播放状态，继续播放
      setTimeout(function () {
        that.setData({
          voice: that.data.voice
        })
        backgroundAudioManager.seek(backgroundAudioManager.duration * (that.data.voice.progress / 100))
        backgroundAudioManager.play()
      }, 300)
    } else { //如果之前是未播放状态，则不播放
      setTimeout(function () {
        that.setData({
          voice: that.data.voice
        })
        backgroundAudioManager.seek(backgroundAudioManager.duration * (that.data.voice.progress / 100))
      }, 300)
    }

  },

  // 点击音频滑块 by kevin
  voiceSeekTap: function (e) {
    console.log("tapped---")
    var that = this
    // backgroundAudioManager.stop()
    backgroundAudioManager.pause();
    console.log(e)
    // 因为movable-area有left偏移，log输出大致为50
    var relatX = e.detail.x - 50;
    console.log("------x:", e.detail.x)
    console.log("------relatX:", relatX)
    if (that.data.voice.canPlay) {
      // var progress = Math.round(e.detail.x / (areaWidth - viewWidth) * 100)
      var progress = Math.round(relatX / (areaWidth - viewWidth) * 100)
      that.data.voice.progress = progress
      // that.data.voice.margin = e.detail.x
      that.data.voice.margin = relatX
      that.data.voice.time = dateformat(Math.round(backgroundAudioManager.duration * (that.data.voice.progress / 100)))
    }
    console.log("tapped end play status---", that.data.voice.playing)
    that.setData({
      voice: that.data.voice
    })
    if (that.data.voice.playing) {
      setTimeout(function () {
        backgroundAudioManager.seek(backgroundAudioManager.duration * (that.data.voice.progress / 100))
        backgroundAudioManager.play()
      }, 300)
    } else {
      setTimeout(function () {
        backgroundAudioManager.seek(backgroundAudioManager.duration * (that.data.voice.progress / 100))
      }, 300)
    }
  },

  // 播放按钮点击事件
  playClick: function () {
    var that = this;
    var playing2 = this.data.voice.playing
    if (playing2) {
      backgroundAudioManager.pause();
      that.data.voice.playing = false
    } else {
      backgroundAudioManager.play();
      that.data.voice.playing = true
    }
    this.setData({
      voice: that.data.voice
    })
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