<<<<<<< HEAD
var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
Page({
  data: {
    rec: {},
    main: {},
    loading: true,
    limit: 20,
    offset: 0,
    recid: 0,
    value: "",
    options: {},
    autoheight: true,
  },

  inputext: function(e) {
    var name = e.detail.value;
    this.setData({
      value: name
    });
  },
  // 监听textarea行数改变
  linechange: function(e){
    var that = this;
    // console.log("--autoheight:", that.data.autoheight);
    // console.log("--height:", that.data.height);
    // console.log("--lineCount:", e.detail.lineCount);
    if (e.detail.lineCount == 3){
      that.setData({
        height: e.detail.height,
      })
    }
    if (e.detail.lineCount >= 3){
      that.setData({
        autoheight: false,
      })
    }else{
      that.setData({
        autoheight: true,
      })
    }
  },
  // 发送评论
  sendComment: function() {
    // TODO内容非空判断，空内容发送按钮不可用
    wx.showToast({
      title: '发送中',
      icon: 'loading',
    })
    var that = this;
    console.log("---sendComment")
    let options = this.data.options;
    var threadId = this.data.recid;
    var content = this.data.value;
    var fromtype = options.from;
    var type = (fromtype == 'song') ? '' : 1;
    console.log("---threadId:", threadId)
    console.log("--content:", content)
    common.sendcomment(app.globalData.cookie, threadId, content, function (data) {
      console.log("cb:",data)
      wx.showToast({
        title: '成功',
        icon: 'success',
        duration: 2000
      })
      that.setData({
        value: ""
      })
      that.reload();
    }, type)
  },
  // 点赞评论
  commentlike: function(e){
    var that = this;
    let options = this.data.options;
    var cid = e.currentTarget.dataset.cid,
        clike = e.currentTarget.dataset.clike,
        fromtype = options.from;
    var type = (fromtype == 'song') ? '' : 1;
    // console.log("---threadId:", this.data.recid)
    // console.log("--clike cid:", cid);
    // console.log("--clike clike:", clike);
    // console.log("--clike type:", type);
    common.commentlike(this.data.recid, cid, clike, function(data){
      console.log("cb:",data)
      if(data.code == 200){
        that.reload();
      }
    }, type)
  },
  onLoad: function(options) {
    // console.log("--onload:", options)
    this.setData({
      options: options
    })
    var id = options.id,
      fromtype = options.from,
      that = this;
    this.setData({
      recid: id,
      loading: true,
    });
    var type = (fromtype == 'song') ? '' : 1;
    common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, id, function(data) {
      that.setData({
        loading: false,
        rec: data,
        loading: false,
        type: type,
        offset: data.comments ? data.comments.length : 0
      });
      wx.setNavigationBarTitle({
        title: '评论(' + (data.total || 0) + ")"
      })
    }, type)
  },
  reload: function(){
    let options = this.data.options;
    console.log("---reload:",options)
    var id = options.id,
      fromtype = options.from,
      that = this;
    this.setData({
      recid: id,
      loading: true,
    });
    var type = (fromtype == 'song') ? '' : 1;
    common.loadrec(app.globalData.cookie, 0, this.data.limit, id, function (data) {
      that.setData({
        loading: false,
        rec: data,
        loading: false,
        type: type,
        offset: data.comments ? data.comments.length : 0
      });
      wx.setNavigationBarTitle({
        title: '评论(' + (data.total || 0) + ")"
      })
      wx.stopPullDownRefresh();
    }, type)
  },
  onPullDownRefresh: function() {
    console.log("---refreash")
    this.reload();
    // wx.stopPullDownRefresh();
  },
  onReachBottom: function() {
    if (this.data.rec.more && !this.data.loading) {
      var that = this;
      this.setData({
        loading: true
      })
      common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, this.data.recid, function(data) {
        var rec = that.data.rec;
        var offset = that.data.offset + (data.comments || []).length
        data.comments = rec.comments.concat(data.comments);
        data.hotComments = rec.hotComments;
        that.setData({
          loading: false,
          rec: data,
          loading: false,
          offset: offset
        });
      }, this.data.type)
    }
  }

=======
<<<<<<< HEAD
var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
Page({
  data: {
    rec: {},
    main: {},
    loading: true,
    limit: 20,
    offset: 0,
    recid: 0,
    value: "",
    options: {},
    autoheight: true,
  },

  inputext: function(e) {
    var name = e.detail.value;
    this.setData({
      value: name
    });
  },
  // 监听textarea行数改变
  linechange: function(e){
    var that = this;
    // console.log("--autoheight:", that.data.autoheight);
    // console.log("--height:", that.data.height);
    // console.log("--lineCount:", e.detail.lineCount);
    if (e.detail.lineCount == 3){
      that.setData({
        height: e.detail.height,
      })
    }
    if (e.detail.lineCount >= 3){
      that.setData({
        autoheight: false,
      })
    }else{
      that.setData({
        autoheight: true,
      })
    }
  },
  // 发送评论
  sendComment: function() {
    // TODO内容非空判断，空内容发送按钮不可用
    wx.showToast({
      title: '发送中',
      icon: 'loading',
    })
    var that = this;
    console.log("---sendComment")
    let options = this.data.options;
    var threadId = this.data.recid;
    var content = this.data.value;
    var fromtype = options.from;
    var type = (fromtype == 'song') ? '' : 1;
    console.log("---threadId:", threadId)
    console.log("--content:", content)
    common.sendcomment(app.globalData.cookie, threadId, content, function (data) {
      console.log("cb:",data)
      wx.showToast({
        title: '成功',
        icon: 'success',
        duration: 2000
      })
      that.setData({
        value: ""
      })
      that.reload();
    }, type)
  },
  // 点赞评论
  commentlike: function(e){
    var that = this;
    let options = this.data.options;
    var cid = e.currentTarget.dataset.cid,
        clike = e.currentTarget.dataset.clike,
        fromtype = options.from;
    var type = (fromtype == 'song') ? '' : 1;
    // console.log("---threadId:", this.data.recid)
    // console.log("--clike cid:", cid);
    // console.log("--clike clike:", clike);
    // console.log("--clike type:", type);
    common.commentlike(this.data.recid, cid, clike, function(data){
      console.log("cb:",data)
      if(data.code == 200){
        that.reload();
      }
    }, type)
  },
  onLoad: function(options) {
    // console.log("--onload:", options)
    this.setData({
      options: options
    })
    var id = options.id,
      fromtype = options.from,
      that = this;
    this.setData({
      recid: id,
      loading: true,
    });
    var type = (fromtype == 'song') ? '' : 1;
    common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, id, function(data) {
      that.setData({
        loading: false,
        rec: data,
        loading: false,
        type: type,
        offset: data.comments ? data.comments.length : 0
      });
      wx.setNavigationBarTitle({
        title: '评论(' + (data.total || 0) + ")"
      })
    }, type)
  },
  reload: function(){
    let options = this.data.options;
    console.log("---reload:",options)
    var id = options.id,
      fromtype = options.from,
      that = this;
    this.setData({
      recid: id,
      loading: true,
    });
    var type = (fromtype == 'song') ? '' : 1;
    common.loadrec(app.globalData.cookie, 0, this.data.limit, id, function (data) {
      that.setData({
        loading: false,
        rec: data,
        loading: false,
        type: type,
        offset: data.comments ? data.comments.length : 0
      });
      wx.setNavigationBarTitle({
        title: '评论(' + (data.total || 0) + ")"
      })
      wx.stopPullDownRefresh();
    }, type)
  },
  onPullDownRefresh: function() {
    console.log("---refreash")
    this.reload();
    // wx.stopPullDownRefresh();
  },
  onReachBottom: function() {
    if (this.data.rec.more && !this.data.loading) {
      var that = this;
      this.setData({
        loading: true
      })
      common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, this.data.recid, function(data) {
        var rec = that.data.rec;
        var offset = that.data.offset + (data.comments || []).length
        data.comments = rec.comments.concat(data.comments);
        data.hotComments = rec.hotComments;
        that.setData({
          loading: false,
          rec: data,
          loading: false,
          offset: offset
        });
      }, this.data.type)
    }
  }

=======
var app = getApp();
var bsurl = require('../../../utils/bsurl.js');
var common = require('../../../utils/util.js');
Page({
  data: {
    rec: {},
    main: {},
    loading: true,
    limit: 20,
    offset: 0,
    recid: 0,
    value: "",
    options: {},
    autoheight: true,
  },

  inputext: function(e) {
    var name = e.detail.value;
    this.setData({
      value: name
    });
  },
  // 监听textarea行数改变
  linechange: function(e){
    var that = this;
    // console.log("--autoheight:", that.data.autoheight);
    // console.log("--height:", that.data.height);
    // console.log("--lineCount:", e.detail.lineCount);
    if (e.detail.lineCount == 3){
      that.setData({
        height: e.detail.height,
      })
    }
    if (e.detail.lineCount >= 3){
      that.setData({
        autoheight: false,
      })
    }else{
      that.setData({
        autoheight: true,
      })
    }
  },
  // 发送评论
  sendComment: function() {
    // TODO内容非空判断，空内容发送按钮不可用
    wx.showToast({
      title: '发送中',
      icon: 'loading',
    })
    var that = this;
    console.log("---sendComment")
    let options = this.data.options;
    var threadId = this.data.recid;
    var content = this.data.value;
    var fromtype = options.from;
    var type = (fromtype == 'song') ? '' : 1;
    console.log("---threadId:", threadId)
    console.log("--content:", content)
    common.sendcomment(app.globalData.cookie, threadId, content, function (data) {
      console.log("cb:",data)
      wx.showToast({
        title: '成功',
        icon: 'success',
        duration: 2000
      })
      that.setData({
        value: ""
      })
      that.reload();
    }, type)
  },
  // 点赞评论
  commentlike: function(e){
    var that = this;
    let options = this.data.options;
    var cid = e.currentTarget.dataset.cid,
        clike = e.currentTarget.dataset.clike,
        fromtype = options.from;
    var type = (fromtype == 'song') ? '' : 1;
    // console.log("---threadId:", this.data.recid)
    // console.log("--clike cid:", cid);
    // console.log("--clike clike:", clike);
    // console.log("--clike type:", type);
    common.commentlike(this.data.recid, cid, clike, function(data){
      console.log("cb:",data)
      if(data.code == 200){
        that.reload();
      }
    }, type)
  },
  onLoad: function(options) {
    // console.log("--onload:", options)
    this.setData({
      options: options
    })
    var id = options.id,
      fromtype = options.from,
      that = this;
    this.setData({
      recid: id,
      loading: true,
    });
    var type = (fromtype == 'song') ? '' : 1;
    common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, id, function(data) {
      that.setData({
        loading: false,
        rec: data,
        loading: false,
        type: type,
        offset: data.comments ? data.comments.length : 0
      });
      wx.setNavigationBarTitle({
        title: '评论(' + (data.total || 0) + ")"
      })
    }, type)
  },
  reload: function(){
    let options = this.data.options;
    console.log("---reload:",options)
    var id = options.id,
      fromtype = options.from,
      that = this;
    this.setData({
      recid: id,
      loading: true,
    });
    var type = (fromtype == 'song') ? '' : 1;
    common.loadrec(app.globalData.cookie, 0, this.data.limit, id, function (data) {
      that.setData({
        loading: false,
        rec: data,
        loading: false,
        type: type,
        offset: data.comments ? data.comments.length : 0
      });
      wx.setNavigationBarTitle({
        title: '评论(' + (data.total || 0) + ")"
      })
      wx.stopPullDownRefresh();
    }, type)
  },
  onPullDownRefresh: function() {
    console.log("---refreash")
    this.reload();
    // wx.stopPullDownRefresh();
  },
  onReachBottom: function() {
    if (this.data.rec.more && !this.data.loading) {
      var that = this;
      this.setData({
        loading: true
      })
      common.loadrec(app.globalData.cookie, this.data.offset, this.data.limit, this.data.recid, function(data) {
        var rec = that.data.rec;
        var offset = that.data.offset + (data.comments || []).length
        data.comments = rec.comments.concat(data.comments);
        data.hotComments = rec.hotComments;
        that.setData({
          loading: false,
          rec: data,
          loading: false,
          offset: offset
        });
      }, this.data.type)
    }
  }

>>>>>>> renew
>>>>>>> 2019/12/9
})