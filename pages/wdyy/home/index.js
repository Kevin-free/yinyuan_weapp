<<<<<<< HEAD
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
var myUtil = require('../../../utils/myUtil.js');
var async = require("../../../utils/async.js");
var nt = require("../../../utils/nt.js")
var app = getApp();
Page({
  data: {
    totalGainTime: 30, //3600秒 一小时
    rec: {
      idx: 0,
      loading: false,
    },
    music: {},
    playing: false,
    playtype: {},
    banner: [4],
    thisday: (new Date()).getDate(),
    cateisShow: false,
    playlist: {
      idx: 1,
      loading: false,
      list: {},
      offset: 0,
      limit: 20
    },
    catelist: {
      res: {},
      checked: {}
    },
    djlist: {
      idx: 2,
      loading: false,
      list: [],
      offset: 0,
      limit: 20
    },
    djcate: {
      loading: false
    },
    djrecs: {},
    sort: {
      idx: 3,
      loading: false
    },
    tabidx: 0,

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '', //导航栏 中间的标题
      navidx: 0,
    },

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    topHeightrpx: app.globalData.topHeightrpx,
  },
  toggleplay: function() {
    common.toggleplay(this, app);
  },
  playnext: function(e) {
    app.nextplay(e.currentTarget.dataset.pt)
  },
  music_next: function(r) {
    this.setData({
      music: r.music,
      playtype: r.playtype
    })
  },
  music_toggle: function(r) {
    this.setData({
      playing: r.playing
    })
  },
  onLoad: function(options) {
    var cookie = wx.getStorageSync('cookie');
    // 如果未绑定网易云账号
    if (myUtil.isBlank(cookie)) {
      // console.log("---mylikelist")
      app.mylikelist()
    }
    else{
      // console.log("---likelist")
      app.likelist();
    }

    if (options.share == 1) {
      var url = '../' + options.st + '/index?id=' + options.id
      console.log(url, options.st, options.id)
      wx.navigateTo({
        url: url,
        success: function() {
          console.log("tiaozhuan chenggong")
        }
      })
      return;
    };
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // that.updateInterval();
    // var hasInterval = wx.getStorageSync("hasInterval")
    // if (hasInterval == null || hasInterval == "") {
    //   console.log("don't hasInterval");     
    //   console.log("that.data.totalGainTime", that.data.totalGainTime)
    //   that.updateInterval();
    //   wx.setStorageSync("hasInterval", that.data.totalGainTime)
    // }else{
    //   console.log("---hasInterval:", hasInterval);
    //   that.setData({
    //     totalGainTime: hasInterval
    //   })
    // }
  },
  // 更新计时器
  updateInterval: function() {
    var that = this;
    var interval = setInterval(function() {
      // 秒数
      var totalSecond = that.data.totalGainTime; //3600s 一小时

      var isplaying = app.globalData.playing;
      console.log("--- isplaying", isplaying)
      totalSecond--;
      that.setData({
        totalGainTime: totalSecond
      })
      if (totalSecond > 0) {
        console.log("获得音感+5,totalSecond", totalSecond);

      }else{
        clearInterval(interval);
        wx.showToast({
          title: '活动已结束',
        });
      }
    }.bind(this), 5000); //5s
  },
  onHide: function() {
    nt.removeNotification("music_next", this)
    nt.removeNotification("music_toggle", this)
  },
  onUnload: function(){
    console.log("---音乐界面 onUnload")
    wx.setStorageSync("hasInterval", this.data.totalGainTime)
  },
  onShow: function() {
    nt.addNotification("music_next", this.music_next, this);
    nt.addNotification("music_toggle", this.music_toggle, this)
    this.setData({
        music: app.globalData.curplay,
        playing: app.globalData.playing,
        playtype: app.globalData.playtype,
      })
      // if (!wx.getStorageSync('user')) {
      //   console.log("--------redi", !wx.getStorageSync('user'))
      //     wx.redirectTo({
      //         url: '../login/index'
      //     });
      //     return;
      // }
      !this.data.rec.loading && this.init();
  },
  switchtab: function(e) {
    var that = this;
    var t = e.currentTarget.dataset.t;
    this.setData({
      tabidx: t
    });
    if (t == 1 && !this.data.playlist.loading) {
      this.gplaylist()
    }
    if (t == 2 && !this.data.djcate.loading) {
      //批量获取电台分类，推荐节目，精选电台，热门电台
      async.map(['djradio/catelist', 'program/recommend', 'djradio/recommend', 'djradio/hot'], function(item, callback) {
        wx.request({
          url: bsurl + item,
          success: function(res) {
            callback(null, res.data)
          }
        })
      }, function(err, results) {
        console.log(err)
        console.log(results)
        var catelist = results[0];
        catelist.loading = true;
        that.setData({
          djcate: catelist,
          djrecs: {
            rec_p: results[1],
            rec_d: results[2]
          },
          djlist: {
            loading: true,
            idx: 2,
            list: results[3],
            limit: 20,
            offset: results[3].djRadios.length
          }
        })
      });
    }
    if (t == 3 && !this.data.sort.loading) {
      this.data.sort.loading = false;
      this.setData({
        sort: this.data.sort
      })
      wx.request({
        url: bsurl + 'toplist/detail',
        success: function(res) {
          res.data.idx = 3;
          res.data.loading = true;
          that.setData({
            sort: res.data
          })
        }
      })
    }

  },
  gdjlist: function(isadd) {
    var that = this;
    var that = this;
    wx.request({
      url: bsurl + 'djradio/hot',
      data: {
        limit: that.data.djlist.limit,
        offset: that.data.djlist.offset
      },
      complete: function(res) {
        that.data.djlist.loading = true;
        if (!isadd) {
          that.data.djlist.list = res.data
        } else {
          res.data.djRadios = that.data.djlist.list.djRadios.concat(res.data.djRadios);
          that.data.djlist.list = res.data
        }
        that.data.djlist.offset += res.data.djRadios.length;
        that.setData({
          djlist: that.data.djlist
        })
      }
    })
  },
  gplaylist: function(isadd) {
    //分类歌单列表
    var that = this;
    wx.request({
      url: bsurl + 'top/playlist',
      data: {
        limit: that.data.playlist.limit,
        offset: that.data.playlist.offset,
        type: that.data.catelist.checked.name
      },
      complete: function(res) {
        that.data.playlist.loading = true;
        if (!isadd) {
          that.data.playlist.list = res.data
        } else {
          res.data.playlists = that.data.playlist.list.playlists.concat(res.data.playlists);
          that.data.playlist.list = res.data
        }
        that.data.playlist.offset += res.data.playlists.length;
        that.setData({
          playlist: that.data.playlist
        })
      }
    })
  },
  onReachBottom: function() {
    if (this.data.tabidx == 1) {
      this.gplaylist(1); //更多歌单
    } else if (this.data.tabidx == 2) {
      this.gdjlist(1); //更多dj节目
    }
  },
  togglePtype: function() {
    this.setData({
      cateisShow: !this.data.cateisShow
    })
  },
  cateselect: function(e) {
    var t = e.currentTarget.dataset.catype;
    this.data.catelist.checked = t
    this.setData({
      playlist: {
        idx: 1,
        loading: false,
        list: {},
        offset: 0,
        limit: 20
      },
      cateisShow: !this.data.cateisShow,
      catelist: this.data.catelist
    });
    this.gplaylist();
  },

  init: function() {
    var that = this
    var rec = this.data.rec
    //banner，
    // wx.request({
    //     url: bsurl + 'banner',
    //     data: { cookie: app.globalData.cookie },
    //     success: function (res) {
    //         that.setData({
    //             banner: res.data.banners
    //         })
    //     }
    // });
    wx.request({
      url: bsurl + 'playlist/catlist',
      data: {
        cookie: app.globalData.cookie
      },
      complete: function(res) {
        that.setData({
          catelist: {
            isShow: false,
            res: res.data,
            checked: res.data.all
          }
        })
      }
    })
    //个性推荐内容,歌单，新歌，mv，电台
    async.map(['personalized', 'personalized/newsong', 'personalized/mv', 'personalized/djprogram'], function(item, callback) {
      wx.request({
        url: bsurl + item,
        data: {
          cookie: app.globalData.cookie
        },
        success: function(res) {
          callback(null, res.data.result)
        }
      })
    }, function(err, results) {
      rec.loading = true;
      rec.re = results
      that.setData({
        rec: rec
      })
    });
  }
=======
<<<<<<< HEAD
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
var myUtil = require('../../../utils/myUtil.js');
var async = require("../../../utils/async.js");
var nt = require("../../../utils/nt.js")
var app = getApp();
Page({
  data: {
    totalGainTime: 30, //3600秒 一小时
    rec: {
      idx: 0,
      loading: false,
    },
    music: {},
    playing: false,
    playtype: {},
    banner: [4],
    thisday: (new Date()).getDate(),
    cateisShow: false,
    playlist: {
      idx: 1,
      loading: false,
      list: {},
      offset: 0,
      limit: 20
    },
    catelist: {
      res: {},
      checked: {}
    },
    djlist: {
      idx: 2,
      loading: false,
      list: [],
      offset: 0,
      limit: 20
    },
    djcate: {
      loading: false
    },
    djrecs: {},
    sort: {
      idx: 3,
      loading: false
    },
    tabidx: 0,

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '', //导航栏 中间的标题
      navidx: 0,
    },

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    topHeightrpx: app.globalData.topHeightrpx,
  },
  toggleplay: function() {
    common.toggleplay(this, app);
  },
  playnext: function(e) {
    app.nextplay(e.currentTarget.dataset.pt)
  },
  music_next: function(r) {
    this.setData({
      music: r.music,
      playtype: r.playtype
    })
  },
  music_toggle: function(r) {
    this.setData({
      playing: r.playing
    })
  },
  onLoad: function(options) {
    var cookie = wx.getStorageSync('cookie');
    // 如果未绑定网易云账号
    if (myUtil.isBlank(cookie)) {
      // console.log("---mylikelist")
      app.mylikelist()
    }
    else{
      // console.log("---likelist")
      app.likelist();
    }

    if (options.share == 1) {
      var url = '../' + options.st + '/index?id=' + options.id
      console.log(url, options.st, options.id)
      wx.navigateTo({
        url: url,
        success: function() {
          console.log("tiaozhuan chenggong")
        }
      })
      return;
    };
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // that.updateInterval();
    // var hasInterval = wx.getStorageSync("hasInterval")
    // if (hasInterval == null || hasInterval == "") {
    //   console.log("don't hasInterval");     
    //   console.log("that.data.totalGainTime", that.data.totalGainTime)
    //   that.updateInterval();
    //   wx.setStorageSync("hasInterval", that.data.totalGainTime)
    // }else{
    //   console.log("---hasInterval:", hasInterval);
    //   that.setData({
    //     totalGainTime: hasInterval
    //   })
    // }
  },
  // 更新计时器
  updateInterval: function() {
    var that = this;
    var interval = setInterval(function() {
      // 秒数
      var totalSecond = that.data.totalGainTime; //3600s 一小时

      var isplaying = app.globalData.playing;
      console.log("--- isplaying", isplaying)
      totalSecond--;
      that.setData({
        totalGainTime: totalSecond
      })
      if (totalSecond > 0) {
        console.log("获得音感+5,totalSecond", totalSecond);

      }else{
        clearInterval(interval);
        wx.showToast({
          title: '活动已结束',
        });
      }
    }.bind(this), 5000); //5s
  },
  onHide: function() {
    nt.removeNotification("music_next", this)
    nt.removeNotification("music_toggle", this)
  },
  onUnload: function(){
    console.log("---音乐界面 onUnload")
    wx.setStorageSync("hasInterval", this.data.totalGainTime)
  },
  onShow: function() {
    nt.addNotification("music_next", this.music_next, this);
    nt.addNotification("music_toggle", this.music_toggle, this)
    this.setData({
        music: app.globalData.curplay,
        playing: app.globalData.playing,
        playtype: app.globalData.playtype,
      })
      // if (!wx.getStorageSync('user')) {
      //   console.log("--------redi", !wx.getStorageSync('user'))
      //     wx.redirectTo({
      //         url: '../login/index'
      //     });
      //     return;
      // }
      !this.data.rec.loading && this.init();
  },
  switchtab: function(e) {
    var that = this;
    var t = e.currentTarget.dataset.t;
    this.setData({
      tabidx: t
    });
    if (t == 1 && !this.data.playlist.loading) {
      this.gplaylist()
    }
    if (t == 2 && !this.data.djcate.loading) {
      //批量获取电台分类，推荐节目，精选电台，热门电台
      async.map(['djradio/catelist', 'program/recommend', 'djradio/recommend', 'djradio/hot'], function(item, callback) {
        wx.request({
          url: bsurl + item,
          success: function(res) {
            callback(null, res.data)
          }
        })
      }, function(err, results) {
        console.log(err)
        console.log(results)
        var catelist = results[0];
        catelist.loading = true;
        that.setData({
          djcate: catelist,
          djrecs: {
            rec_p: results[1],
            rec_d: results[2]
          },
          djlist: {
            loading: true,
            idx: 2,
            list: results[3],
            limit: 20,
            offset: results[3].djRadios.length
          }
        })
      });
    }
    if (t == 3 && !this.data.sort.loading) {
      this.data.sort.loading = false;
      this.setData({
        sort: this.data.sort
      })
      wx.request({
        url: bsurl + 'toplist/detail',
        success: function(res) {
          res.data.idx = 3;
          res.data.loading = true;
          that.setData({
            sort: res.data
          })
        }
      })
    }

  },
  gdjlist: function(isadd) {
    var that = this;
    var that = this;
    wx.request({
      url: bsurl + 'djradio/hot',
      data: {
        limit: that.data.djlist.limit,
        offset: that.data.djlist.offset
      },
      complete: function(res) {
        that.data.djlist.loading = true;
        if (!isadd) {
          that.data.djlist.list = res.data
        } else {
          res.data.djRadios = that.data.djlist.list.djRadios.concat(res.data.djRadios);
          that.data.djlist.list = res.data
        }
        that.data.djlist.offset += res.data.djRadios.length;
        that.setData({
          djlist: that.data.djlist
        })
      }
    })
  },
  gplaylist: function(isadd) {
    //分类歌单列表
    var that = this;
    wx.request({
      url: bsurl + 'top/playlist',
      data: {
        limit: that.data.playlist.limit,
        offset: that.data.playlist.offset,
        type: that.data.catelist.checked.name
      },
      complete: function(res) {
        that.data.playlist.loading = true;
        if (!isadd) {
          that.data.playlist.list = res.data
        } else {
          res.data.playlists = that.data.playlist.list.playlists.concat(res.data.playlists);
          that.data.playlist.list = res.data
        }
        that.data.playlist.offset += res.data.playlists.length;
        that.setData({
          playlist: that.data.playlist
        })
      }
    })
  },
  onReachBottom: function() {
    if (this.data.tabidx == 1) {
      this.gplaylist(1); //更多歌单
    } else if (this.data.tabidx == 2) {
      this.gdjlist(1); //更多dj节目
    }
  },
  togglePtype: function() {
    this.setData({
      cateisShow: !this.data.cateisShow
    })
  },
  cateselect: function(e) {
    var t = e.currentTarget.dataset.catype;
    this.data.catelist.checked = t
    this.setData({
      playlist: {
        idx: 1,
        loading: false,
        list: {},
        offset: 0,
        limit: 20
      },
      cateisShow: !this.data.cateisShow,
      catelist: this.data.catelist
    });
    this.gplaylist();
  },

  init: function() {
    var that = this
    var rec = this.data.rec
    //banner，
    // wx.request({
    //     url: bsurl + 'banner',
    //     data: { cookie: app.globalData.cookie },
    //     success: function (res) {
    //         that.setData({
    //             banner: res.data.banners
    //         })
    //     }
    // });
    wx.request({
      url: bsurl + 'playlist/catlist',
      data: {
        cookie: app.globalData.cookie
      },
      complete: function(res) {
        that.setData({
          catelist: {
            isShow: false,
            res: res.data,
            checked: res.data.all
          }
        })
      }
    })
    //个性推荐内容,歌单，新歌，mv，电台
    async.map(['personalized', 'personalized/newsong', 'personalized/mv', 'personalized/djprogram'], function(item, callback) {
      wx.request({
        url: bsurl + item,
        data: {
          cookie: app.globalData.cookie
        },
        success: function(res) {
          callback(null, res.data.result)
        }
      })
    }, function(err, results) {
      rec.loading = true;
      rec.re = results
      that.setData({
        rec: rec
      })
    });
  }
=======
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
var myUtil = require('../../../utils/myUtil.js');
var async = require("../../../utils/async.js");
var nt = require("../../../utils/nt.js")
var app = getApp();
Page({
  data: {
    totalGainTime: 30, //3600秒 一小时
    rec: {
      idx: 0,
      loading: false,
    },
    music: {},
    playing: false,
    playtype: {},
    banner: [4],
    thisday: (new Date()).getDate(),
    cateisShow: false,
    playlist: {
      idx: 1,
      loading: false,
      list: {},
      offset: 0,
      limit: 20
    },
    catelist: {
      res: {},
      checked: {}
    },
    djlist: {
      idx: 2,
      loading: false,
      list: [],
      offset: 0,
      limit: 20
    },
    djcate: {
      loading: false
    },
    djrecs: {},
    sort: {
      idx: 3,
      loading: false
    },
    tabidx: 0,

    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      title: '', //导航栏 中间的标题
      navidx: 0,
    },

    topHeight: app.globalData.topHeight, //距离顶部 暂时以最大值处理，有轻微差距
    topHeightrpx: app.globalData.topHeightrpx,
  },
  toggleplay: function() {
    common.toggleplay(this, app);
  },
  playnext: function(e) {
    app.nextplay(e.currentTarget.dataset.pt)
  },
  music_next: function(r) {
    this.setData({
      music: r.music,
      playtype: r.playtype
    })
  },
  music_toggle: function(r) {
    this.setData({
      playing: r.playing
    })
  },
  onLoad: function(options) {
    var cookie = wx.getStorageSync('cookie');
    // 如果未绑定网易云账号
    if (myUtil.isBlank(cookie)) {
      // console.log("---mylikelist")
      app.mylikelist()
    }
    else{
      // console.log("---likelist")
      app.likelist();
    }

    if (options.share == 1) {
      var url = '../' + options.st + '/index?id=' + options.id
      console.log(url, options.st, options.id)
      wx.navigateTo({
        url: url,
        success: function() {
          console.log("tiaozhuan chenggong")
        }
      })
      return;
    };
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // that.updateInterval();
    // var hasInterval = wx.getStorageSync("hasInterval")
    // if (hasInterval == null || hasInterval == "") {
    //   console.log("don't hasInterval");     
    //   console.log("that.data.totalGainTime", that.data.totalGainTime)
    //   that.updateInterval();
    //   wx.setStorageSync("hasInterval", that.data.totalGainTime)
    // }else{
    //   console.log("---hasInterval:", hasInterval);
    //   that.setData({
    //     totalGainTime: hasInterval
    //   })
    // }
  },
  // 更新计时器
  updateInterval: function() {
    var that = this;
    var interval = setInterval(function() {
      // 秒数
      var totalSecond = that.data.totalGainTime; //3600s 一小时

      var isplaying = app.globalData.playing;
      console.log("--- isplaying", isplaying)
      totalSecond--;
      that.setData({
        totalGainTime: totalSecond
      })
      if (totalSecond > 0) {
        console.log("获得音感+5,totalSecond", totalSecond);

      }else{
        clearInterval(interval);
        wx.showToast({
          title: '活动已结束',
        });
      }
    }.bind(this), 5000); //5s
  },
  onHide: function() {
    nt.removeNotification("music_next", this)
    nt.removeNotification("music_toggle", this)
  },
  onUnload: function(){
    console.log("---音乐界面 onUnload")
    wx.setStorageSync("hasInterval", this.data.totalGainTime)
  },
  onShow: function() {
    nt.addNotification("music_next", this.music_next, this);
    nt.addNotification("music_toggle", this.music_toggle, this)
    this.setData({
        music: app.globalData.curplay,
        playing: app.globalData.playing,
        playtype: app.globalData.playtype,
      })
      // if (!wx.getStorageSync('user')) {
      //   console.log("--------redi", !wx.getStorageSync('user'))
      //     wx.redirectTo({
      //         url: '../login/index'
      //     });
      //     return;
      // }
      !this.data.rec.loading && this.init();
  },
  switchtab: function(e) {
    var that = this;
    var t = e.currentTarget.dataset.t;
    this.setData({
      tabidx: t
    });
    if (t == 1 && !this.data.playlist.loading) {
      this.gplaylist()
    }
    if (t == 2 && !this.data.djcate.loading) {
      //批量获取电台分类，推荐节目，精选电台，热门电台
      async.map(['djradio/catelist', 'program/recommend', 'djradio/recommend', 'djradio/hot'], function(item, callback) {
        wx.request({
          url: bsurl + item,
          success: function(res) {
            callback(null, res.data)
          }
        })
      }, function(err, results) {
        console.log(err)
        console.log(results)
        var catelist = results[0];
        catelist.loading = true;
        that.setData({
          djcate: catelist,
          djrecs: {
            rec_p: results[1],
            rec_d: results[2]
          },
          djlist: {
            loading: true,
            idx: 2,
            list: results[3],
            limit: 20,
            offset: results[3].djRadios.length
          }
        })
      });
    }
    if (t == 3 && !this.data.sort.loading) {
      this.data.sort.loading = false;
      this.setData({
        sort: this.data.sort
      })
      wx.request({
        url: bsurl + 'toplist/detail',
        success: function(res) {
          res.data.idx = 3;
          res.data.loading = true;
          that.setData({
            sort: res.data
          })
        }
      })
    }

  },
  gdjlist: function(isadd) {
    var that = this;
    var that = this;
    wx.request({
      url: bsurl + 'djradio/hot',
      data: {
        limit: that.data.djlist.limit,
        offset: that.data.djlist.offset
      },
      complete: function(res) {
        that.data.djlist.loading = true;
        if (!isadd) {
          that.data.djlist.list = res.data
        } else {
          res.data.djRadios = that.data.djlist.list.djRadios.concat(res.data.djRadios);
          that.data.djlist.list = res.data
        }
        that.data.djlist.offset += res.data.djRadios.length;
        that.setData({
          djlist: that.data.djlist
        })
      }
    })
  },
  gplaylist: function(isadd) {
    //分类歌单列表
    var that = this;
    wx.request({
      url: bsurl + 'top/playlist',
      data: {
        limit: that.data.playlist.limit,
        offset: that.data.playlist.offset,
        type: that.data.catelist.checked.name
      },
      complete: function(res) {
        that.data.playlist.loading = true;
        if (!isadd) {
          that.data.playlist.list = res.data
        } else {
          res.data.playlists = that.data.playlist.list.playlists.concat(res.data.playlists);
          that.data.playlist.list = res.data
        }
        that.data.playlist.offset += res.data.playlists.length;
        that.setData({
          playlist: that.data.playlist
        })
      }
    })
  },
  onReachBottom: function() {
    if (this.data.tabidx == 1) {
      this.gplaylist(1); //更多歌单
    } else if (this.data.tabidx == 2) {
      this.gdjlist(1); //更多dj节目
    }
  },
  togglePtype: function() {
    this.setData({
      cateisShow: !this.data.cateisShow
    })
  },
  cateselect: function(e) {
    var t = e.currentTarget.dataset.catype;
    this.data.catelist.checked = t
    this.setData({
      playlist: {
        idx: 1,
        loading: false,
        list: {},
        offset: 0,
        limit: 20
      },
      cateisShow: !this.data.cateisShow,
      catelist: this.data.catelist
    });
    this.gplaylist();
  },

  init: function() {
    var that = this
    var rec = this.data.rec
    //banner，
    // wx.request({
    //     url: bsurl + 'banner',
    //     data: { cookie: app.globalData.cookie },
    //     success: function (res) {
    //         that.setData({
    //             banner: res.data.banners
    //         })
    //     }
    // });
    wx.request({
      url: bsurl + 'playlist/catlist',
      data: {
        cookie: app.globalData.cookie
      },
      complete: function(res) {
        that.setData({
          catelist: {
            isShow: false,
            res: res.data,
            checked: res.data.all
          }
        })
      }
    })
    //个性推荐内容,歌单，新歌，mv，电台
    async.map(['personalized', 'personalized/newsong', 'personalized/mv', 'personalized/djprogram'], function(item, callback) {
      wx.request({
        url: bsurl + item,
        data: {
          cookie: app.globalData.cookie
        },
        success: function(res) {
          callback(null, res.data.result)
        }
      })
    }, function(err, results) {
      rec.loading = true;
      rec.re = results
      that.setData({
        rec: rec
      })
    });
  }
>>>>>>> renew
>>>>>>> 2019/12/9
})