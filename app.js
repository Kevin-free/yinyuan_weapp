//app.js
var s = require("/utils/http.js");
var bsurl = require('utils/bsurl.js');
var nt = require('utils/nt.js')
var myutil = require('./utils/myUtil.js');

App({
  onLaunch: function (options) {
    var that = this;

    // 判断是否由分享进入小程序
    if (options.scene == 1007 || options.scene == 1008) {
      // if (true) {
      console.log("app.js 由分享进入")
      this.globalData.share = true
      // 先判断是否缓存了userId
      try {
        var hasUserId = wx.getStorageSync("userId");
        if (hasUserId) {
          console.log("has")
        } else {
          console.log("not")
          wx.showModal({
            title: '注意',
            showCancel: false,
            confirmText: '好去授权',
            content: '为了您更好的体验,请先同意授权',
            success: function (res) {
              wx.navigateTo({
                url: '/pages/index/index',
              })
            }
          })
        }
      } catch (e) {
        console.log("catch")
      }
    } else {
      console.log("app.js 正常进入")
      this.globalData.share = false
      try {
        var hasUserId = wx.getStorageSync("userId");
        if (hasUserId) {
          console.log("has")
        } else {
          console.log("not")
        }
      } catch (e) {
        console.log("catch")
      }
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log("----app getSetting res:", res)
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              wx.setStorageSync("userInfo", res.userInfo)

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });

    // 获取系统宽高，进行自适应调整
    wx.getSystemInfo({
      success: (res) => {
        console.log(res.system)

        var rpxR = 750 / res.windowWidth; //rpx和px比例
        // 记录全局变量屏幕宽度
        this.globalData.winWidth = res.windowWidth;
        // console.log("winW:", res.windowWidth)
        // 记录全局变量屏幕高度
        this.globalData.winHeight = res.windowHeight;
        console.log("winHeight:", res.windowHeight)
        // 记录全局变量状态栏高度： 最上部份(除iPhoneX为44px，大部分为20px)
        this.globalData.barHeight = res.statusBarHeight;
        console.log("barHeight:", res.statusBarHeight)
        // 记录全局变量状态栏高度 换算为rpx
        this.globalData.barHeightrpx = (res.statusBarHeight * rpxR) + 15;
        // console.log("barHeightrpx:", res.statusBarHeight * rpxR)
        // 上部份高度: 最顶部状态栏(系统获取) + 胶囊按钮(32pt) + 边距(有差异，估算)
        this.globalData.topHeight = res.statusBarHeight + 48; //距离顶部 暂时以最大值处理，有轻微差距 
        this.globalData.topHeightrpx = ((res.statusBarHeight + 32) * rpxR) + 29; //距离顶部 暂时以最大值处理，有轻微差距 
        // console.log("topHeight:", this.globalData.topHeight)
        // 剩下部分高度：屏幕高度 - 上部分
        this.globalData.bHeight = res.windowHeight - res.statusBarHeight - 48;
        // this.globalData.bHeightrpx = ((res.windowHeight - res.statusBarHeight - 32) * rpxR) - 28;
        /* 偷懒可将剩余高度设大一点，解决 Android和iOS 胶囊距顶部高度不同的问题，安卓局顶部30pt（即= 30px = 15rpx）,
        iOS距顶部24pt，细化可获取手机系统进行判断后动态调整*/
        this.globalData.bHeightrpx = ((res.windowHeight - res.statusBarHeight - 32) * rpxR) - 26;
        // console.log("bHeight:", this.globalData.bHeight)
      }
    });

    var cookie = wx.getStorageSync('cookie') || '';
    // console.log("cookie:", cookie);
    var gb = wx.getStorageSync("globalData");
    gb && (this.globalData = gb)
    // this.globalData.cookie = cookie
    // console.log("this.globalData.cookie:", this.globalData.cookie);
    var that = this;
    //播放列表中下一首
    wx.onBackgroundAudioStop(function () {
      if (that.globalData.globalStop) {
        return;
      }
      if (that.globalData.playtype != 2) {
        that.nextplay(that.globalData.playtype);
      } else {
        that.nextfm();
      }
    });
    //监听音乐暂停，保存播放进度广播暂停状态
    wx.onBackgroundAudioPause(function () {
      nt.postNotificationName("music_toggle", {
        playing: false,
        playtype: that.globalData.playtype,
        music: that.globalData.curplay || {}
      });
      that.globalData.playing = false;
      that.globalData.globalStop = that.globalData.hide ? true : false;
      wx.getBackgroundAudioPlayerState({
        complete: function (res) {
          that.globalData.currentPosition = res.currentPosition ? res.currentPosition : 0
        }
      })
    });
    //my 监听音乐播放，保存播放进度广播暂停状态
    wx.onBackgroundAudioPlay(function () {
      nt.postNotificationName("music_toggle", {
        playing: true,
        playtype: that.globalData.playtype,
        music: that.globalData.curplay || {}
      });
      that.globalData.playing = true;
      that.globalData.globalStop = that.globalData.hide ? true : false;
      wx.getBackgroundAudioPlayerState({
        complete: function (res) {
          that.globalData.currentPosition = res.currentPosition ? res.currentPosition : 0
        }
      })
    });
    // this.mine();
    // this.likelist();
    // this.loginrefresh();

  },

  // 获取用户信息
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },

  mine: function () {
    var that = this;
    var user = wx.getStorageSync("user");
    // console.log("ne user:",user);
    console.log("myutil.isBlank(user):", myutil.isBlank(user))
    // if (myutil.isBlank(user)) {
    wx.request({
      url: bsurl + 'mine',
      success: function (res) {
        console.log("-----mine res:", res.data);
        // if (!myutil.isBlank(res.data)){
        that.globalData.user = res.data;
        wx.setStorageSync('user', res.data);
        // that.likelist();
        // }
      }
    })
    // }

  },
  loginrefresh: function () {
    wx.request({
      url: bsurl + 'login/refresh',
      data: { cookie: wx.getStorageSync('cookie') },
      success: function (res) {
        // success
        console.log(res)
      }
    })
  },
  // 绑定网易时，获取加心心喜欢歌曲(包括网易和本库)
  likelist: function () {
    // 先获取本库加心心
    var that = this;
    var userId = wx.getStorageSync("userId");
    wx.request({
      url: s.myLikeList,
      data: {
        userId: userId
      },
      success: function (res) {
        // console.log("----mylikelist:", res.data.rows)
        var staredlistTmp = [];
        Array.prototype.push.apply(staredlistTmp, res.data.rows)
        // 获取网易加心心
        var id = wx.getStorageSync('user');
        id = id.account.id;
        wx.request({
          url: bsurl + 'likelist',
          data: {
            uid: id,
            cookie: wx.getStorageSync('cookie')
          },
          success: function (res) {
            // console.log("----nelikelist:", res.data.ids)
            Array.prototype.push.apply(staredlistTmp, res.data.ids)
            that.globalData.staredlist = staredlistTmp;
            // console.log("----nelikelist staredlist:", that.globalData.staredlist)
          }
        })
      }
    })
  },
  // 未绑定网易时，获取自己数据库的加心心歌曲
  mylikelist: function () {
    // console.log("---mylikelist")
    var that = this;
    var userId = wx.getStorageSync("userId");
    wx.request({
      url: s.myLikeList,
      data: {
        userId: userId
      },
      success: function (res) {
        // console.log("----mylikelist:", res.data.rows)
        that.globalData.staredlist = res.data.rows;
        // console.log("----mylikelist staredlist:", that.globalData.staredlist)
      }
    })
  },
  nextplay: function (t, cb, pos) {

    //播放列表中下一首
    this.preplay();
    if (this.globalData.playtype == 2) {
      this.nextfm();
      return;
    }
    var list = this.globalData.playtype == 1 ? this.globalData.list_am : this.globalData.list_dj;
    var index = this.globalData.playtype == 1 ? this.globalData.index_am : this.globalData.index_dj;
    if (t == 1) {
      index++;
    } else {
      index--;
    }
    index = index > list.length - 1 ? 0 : (index < 0 ? list.length - 1 : index);
    index = pos != undefined ? pos : index;
    this.globalData.curplay = (this.globalData.playtype == 1 ? list[index] : list[index].mainSong) || this.globalData.curplay;
    if (this.globalData.staredlist.indexOf(this.globalData.curplay.id) != -1) {
      this.globalData.curplay.starred = true;
      this.globalData.curplay.st = true;
    }
    if (this.globalData.playtype == 1) {
      this.globalData.index_am = index;
    } else {
      this.globalData.index_dj = index;
    }
    nt.postNotificationName("music_next", {
      music: this.globalData.curplay,
      playtype: this.globalData.playtype,
      p: this.globalData.playtype == 1 ? [] : list[index],
      index: this.globalData.playtype == 1 ? this.globalData.index_am : this.globalData.index_dj
    });
    this.seekmusic(this.globalData.playtype);
    cb && cb();
  },
  nextfm: function (cb) {
    //下一首fm
    this.preplay()
    var that = this;
    var list = that.globalData.list_fm;
    var index = that.globalData.index_fm;
    index++;
    this.globalData.playtype = 2;
    if (index > list.length - 1) {
      that.getfm();

    } else {
      console.log("获取下一首fm")
      that.globalData.index_fm = index;
      that.globalData.curplay = list[index];
      if (this.globalData.staredlist.indexOf(this.globalData.curplay.id) != -1) {
        this.globalData.curplay.starred = true;
        this.globalData.curplay.st = true;
      }
      that.seekmusic(2);
      nt.postNotificationName("music_next", {
        music: this.globalData.curplay,
        playtype: 2,
        index: index
      });
      cb && cb();
    }

  },
  preplay: function () {
    //歌曲切换 停止当前音乐
    this.globalData.playing = false;
    this.globalData.globalStop = true;
    wx.pauseBackgroundAudio();
  },
  getfm: function () {
    var that = this;
    wx.request({
      url: bsurl + 'fm',
      data: { cookie: wx.getStorageSync('cookie') },
      success: function (res) {
        console.log("----getfm res:", res)
        if (res.data.code != 200) {
          wx.showModal({
            title: '提示',
            showCancel: false,
            confirmText: '去登录',
            content: '您还未登录，无法推荐私人FM哦~',
            success: function (res) {
              wx.navigateTo({
                url: '../login/index',
              })
            }
          })
        }

        that.globalData.list_fm = res.data.data;
        that.globalData.index_fm = 0;
        that.globalData.curplay = res.data.data[0];
        if (that.globalData.staredlist.indexOf(that.globalData.curplay.id) != -1) {
          that.globalData.curplay.starred = true;
          that.globalData.curplay.st = true;
        }
        that.seekmusic(2);
        nt.postNotificationName("music_next", {
          music: that.globalData.curplay,
          playtype: 2,
          index: 0
        });
      }
    })
  },
  stopmusic: function (type, cb) {
    wx.pauseBackgroundAudio();
  },
  seekmusic: function (type, seek, cb) {
    var that = this;
    var m = this.globalData.curplay;
    if (!m.id) return;
    this.globalData.playtype = type;
    if (cb) {
      this.playing(type, cb, seek);
    } else {
      this.geturl(function () { that.playing(type, cb, seek); })
    }
  },
  playing: function (type, cb, seek) {
    var that = this
    var m = that.globalData.curplay
    console.log("-------app.js m:", m)
    console.log("m.url", m.url)
    if (m.url == undefined) {
      wx.showToast({
        title: '资源错误，无法播放',
        icon: 'none',
      }, 1500);
      wx.stopBackgroundAudio();
    }


    var picUrl = m.al == undefined ? m.album.picUrl : m.al.picUrl;
    console.log("-----picUrl:", picUrl);
    wx.playBackgroundAudio({
      dataUrl: m.url,
      title: m.name,
      coverImgUrl: picUrl,
      success: function (res) {
        if (seek != undefined) {
          wx.seekBackgroundAudio({ position: seek })
        };
        that.globalData.globalStop = false;
        that.globalData.playtype = type;
        that.globalData.playing = true;
        // nt.postNotificationName("music_toggle", {
        //   playing: true,
        //   music: that.globalData.curplay,
        //   playtype: that.globalData.playtype
        // });
        cb && cb();
      },
      fail: function () {
        if (type != 2) {
          that.nextplay(1)
        } else {
          that.nextfm();
        }
      }
    })
  },
  geturl: function (suc, err, cb) {
    var that = this;
    var m = that.globalData.curplay
    wx.request({
      url: bsurl + 'music/url',
      // url: "http://localhost:8080/yinyuan/neapi/music/url",
      data: {
        id: m.id,
        br: m.duration ? ((m.hMusic && m.hMusic.bitrate) || (m.mMusic && m.mMusic.bitrate) || (m.lMusicm && m.lMusic.bitrate) || (m.bMusic && m.bMusic.bitrate)) : (m.privilege ? m.privilege.maxbr : ((m.h && m.h.br) || (m.m && m.m.br) || (m.l && m.l.br) || (m.b && m.b.br))),
        br: 128000
      },
      success: function (a) {
        // 听歌记录到userSong表中        
        var userId = wx.getStorageSync("userId");
        console.log("---记录到userSong表.userId:",userId,",songId:",m.id)
        wx.request({
          url: s.addUserSong,
          data: {
            userId: userId,
            nesongId: m.id,
          },
          success: function(res){
            console.log("succ:",res)
          },
          fail: function(res) {
            console.log("fail:",res)
          }
        })

        a = a.data.data[0];
        if (!a.url) {
          err && err()
        } else {
          that.globalData.curplay.url = a.url;
          that.globalData.curplay.getutime = (new Date()).getTime()
          // console.log("---staredlist:", that.globalData.staredlist)
          // console.log("---staredlist.indexOf:", that.globalData.staredlist.indexOf(that.globalData.curplay.id))
          if (that.globalData.staredlist.indexOf(that.globalData.curplay.id) != -1) {
            that.globalData.curplay.starred = true;
            that.globalData.curplay.st = true;
          }
          suc && suc()
        }
      }
    })
  },
  shuffleplay: function (shuffle) {
    //播放模式shuffle，1顺序，2单曲，3随机
    var that = this;
    that.globalData.shuffle = shuffle;
    if (shuffle == 1) {
      that.globalData.list_am = that.globalData.list_sf;
    }
    else if (shuffle == 2) {
      that.globalData.list_am = [that.globalData.curplay]
    }
    else {
      that.globalData.list_am = [].concat(that.globalData.list_sf);
      var sort = that.globalData.list_am;
      sort.sort(function () {
        return Math.random() - (0.5) ? 1 : -1;
      })

    }
    for (let s in that.globalData.list_am) {
      if (that.globalData.list_am[s].id == that.globalData.curplay.id) {
        that.globalData.index_am = s;
      }
    }
  },
  onShow: function () {
    this.globalData.hide = false
  },
  onHide: function () {
    this.globalData.hide = true;
    console.log("home hide")
    // TODO 第一次不隐藏前无法设置gd
    wx.setStorageSync('globalData', this.globalData);
  },

  globalData: {
    hasNet: true,
    hasLogin: false,
    hide: false,
    list_am: [],
    list_dj: [],
    list_fm: [],
    list_sf: [],
    index_dj: 0,
    index_fm: 0,
    index_am: 0,
    playing: false,
    playtype: 1,
    curplay: {},
    shuffle: 1,
    globalStop: true,
    currentPosition: 0,
    nestaredlist: [], // 网易加心心歌曲
    mystaredlist: [], // 本库加心心歌曲
    staredlist: [],   // 总的加心心歌曲

    cookie: "",
    user: {},

    userInfo: {},
    share: false, // 分享默认为false

    winWidth: 0,
    winHeight: 0,
    barHeight: 0,
    barHeightrpx: 0,
    topHeight: 0,
    topHeightrpx: 0,
    bHeight: 0,
    bHeightrpx: 0,
  }
})