// pages/home/home.js
// 获取应用实例
const app = getApp();
var bsurl = require('../../utils/bsurl.js');
var myUtil = require('../../utils/myUtil.js');
var s = require("../../utils/http.js");
const totalCountTime = 10800; //单位秒 3小时
// var userId = wx.getStorageSync("userId");

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 组件所需的参数
    nvabarData: {
      showCapsule: 1, //是否显示左上角图标   1表示显示    0表示不显示
      showBack: 0, //是否显示返回图标   1表示显示    0表示不显示
      showWenhao: 1,
      showHomeTip: !1,
      title: '音缘', //导航栏 中间的标题
    },

    winHeight: app.globalData.winHeight, //屏幕高度

    dropping: true, //是否在滴水

    intervalTime: '', //时间计时器
    intervalDrop: '', //水滴计时器
    intervalYG: '', //音感计时器
    intervalGainYG: '', //听歌获取音感计时器

    countDownHour: 0, //显示时，分，秒
    countDownMinute: 0,
    countDownSecond: 0,
    countTime: totalCountTime, //计时时间初始值，单位秒
    waterHeight: 0, //计时水高初始值
    gainYG: 0, //获得的音感
    totalYG: '', //总音感
    zyyzs: 0, //总音缘指数
    totalGainTime: 3600, //3600s 5分钟一次 总共一小时

    showModal: false,  //是否显示音感模态框
    showModalYG: false,

    userInfo: {
      avatarUrl: '',
      nickName: '昵称',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    console.log("---home app.globalData.playing", app.globalData.playing)
    var knowHomeTip = wx.getStorageSync("knowHomeTip");
    console.log("---knowHomeTip:", knowHomeTip)
    if (knowHomeTip == null || knowHomeTip == "") {
      console.log("don't knowHomeTip");
      that.setData({
        'nvabarData.showHomeTip': 1,
      })
    }
    // that.getUserBasicInfo();
  },

  // 获取用户音感、总音缘
  getUserBasicInfo: function(){
    let that = this;
    var userId = wx.getStorageSync("userId");
    var userInfo = wx.getStorageSync("userInfo");
    console.log("---onload userId:", userId);
    console.log("---home winHeight:", that.data.winHeight)
    console.log("---userInfo:", userInfo);
    that.setData({
      'userInfo.avatarUrl': userInfo.avatarUrl,
      'userInfo.nickName': userInfo.nickName,
    })
    // 请求后台获取音感
    wx.request({
      url: s.getUserYYInfo,
      data: {
        id: userId,
      },
      success: function (res) {
        console.log("getUserYYInfo succ:", res);
        if (res.data.success) {
          let returnYingan = res.data.rows[0].yingandu;
          let zyyzs = res.data.rows[0].zyyzs;
          console.log("re Yingan:", returnYingan);
          console.log("re zyyzs:", zyyzs);
          wx.setStorageSync("totalYG", returnYingan);
          let countTime = wx.getStorageSync("countTime");
          let waterHeight = wx.getStorageSync("waterHeight");
          let gainYG = wx.getStorageSync("gainYG");
          let totalYG = wx.getStorageSync("totalYG");
          if (!myUtil.isBlank(countTime)) {
            // console.log("!myUtil.isBlank(countTime)  setData")
            that.setData({
              countTime: countTime,
              waterHeight: waterHeight,
              gainYG: gainYG,
            })
          }
          that.setData({
            totalYG: totalYG,
            zyyzs: zyyzs,
          })
          console.log("---countTime:", countTime);
        } else {
          console.log("res fail")
        }
      },
      fail: function (res) {
        console.log("fail:", res);
      },
    })

  },

  // 到寻找音缘
  xzyy: function(){
    var that = this;
    let totalYG = that.data.totalYG;
    console.log("xzyy totalYG:",totalYG);
    if(totalYG>=5){
      wx.showModal({
        title: '是否寻找？',
        content: '寻找音缘一次会消耗5点音感，若匹配满阶可获得25点音感，是否开始寻找？',
        confirmText: '寻找',
        success(res) {
          if (res.confirm) {
            console.log("to xzyy");
            wx.navigateTo({
              url: '../xzyy/xzyy',
            })
            // 寻找一次，减少5点音感
            let totalYG = that.data.totalYG - 5;
            console.log("totalYG:", totalYG)
            that.setData({
              totalYG: totalYG,
            })
          }
        }
      })
    }else{
      wx.showToast({
        title: '音感不足，请先获取足够音感',
        icon: 'none',
      },5000)
    }
    
    // wx.navigateTo({
    //   url: '../xzyy/xzyy',
    // })
  },

  // 到我的音园
  wdyy: function(){
    console.log("to wdyy");
    var nePhone = wx.getStorageSync("nePhone");
    var nePwd = wx.getStorageSync("nePwd");
    console.log("getStorageSync nePhone:",nePhone);
    console.log("myUtil.isBlank(nePhone):", myUtil.isBlank(nePhone))
    // 如果未缓存网易账号，第一次则到登录界面
    if(myUtil.isBlank(nePhone)){
      wx.navigateTo({
        url: '../wdyy/login/index',
      })
    }
    // 否则有缓存网易账号，自动登录并跳转到音园首页
    else{
      // TODO 处理自动登录网易云
      var that = this;
      var url = /^0\d{2,3}\d{7,8}$|^1[34578]\d{9}$/.test(nePhone) ? "login/cellphone" : "login"
      wx.request({
        url: bsurl + url,
        data: {
          email: nePhone,
          phone: nePhone,
          password: nePwd
        },
        complete: function (res) {
          console.log("login res---", res);
          var cookie = res.data.cookie;
          wx.setStorageSync('cookie', res.data.cookie); //将当前用户的mycookie存入缓存

          var user = JSON.parse(res.data.user); //json字符转对象
          // console.log("----cookie:", cookie)
          // console.log("----user:", user)
          // console.log("----user.code", user.code)
          if (user.code != 200) {
            wx.showModal({
              title: '提示',
              content: user.msg + '，请重试！'
            })
            return;
          }
          app.mine();
          // app.likelist();
        }
      })

      wx.navigateTo({
        url: '../wdyy/home/index',
      })
    }
  },

  // 到最佳音缘
  zjyy: function () {
    console.log("to zjyy")
    wx.navigateTo({
      url: '../zjyy/zjyy',
    })
  },

  // 到排行榜
  phb: function () {
    console.log("to phb")
    wx.navigateTo({
      url: '../phb/phb',
    })
  },

  // 到音感源泉
  ygyq: function(){
    console.log("to ygyq")
    this.setData({
      showModal: true,
      showModalYG: true,
    })
  },

  // 到设置
  sz: function () {
    console.log("to sz")
    // wx.navigateTo({
    //   url: '../sz/sz',
    // })
    this.setData({
      showModal: true,
      showModalSZ: true,
    })
  },

  // 隐藏模态框
  hideModal() {
    console.log("---hideModal")
    this.setData({
      showModal: false,
      showModalYG: false,
      showModalSZ: false,
    });
  },

  // 清缓存
  onTapClearStorage: function () {
    wx.showModal({
      title: "提示",
      content: "清楚缓存将会清除你在小程序中产生的所有数据",
      cancelText: "取消",
      confirmText: "确认清除",
      success: function (t) {
        if (t.confirm) try {
          wx.clearStorageSync(), wx.getSavedFileList({
            success: function (t) {
              for (var e in t.fileList) t.fileList.length > 0 && wx.removeSavedFile({
                filePath: t.fileList[e].filePath,
                fail: function (t) {
                  wx.showToast({
                    title: "清楚文件失败",
                    image: "/images/icon/error_icon.png",
                    mask: !0
                  }), console.log(t);
                }
              });
            }
          }), wx.showToast({
            title: "清除成功"
          }), wx.reLaunch({
            url: "../index/index"
          });
        } catch (t) {
          console.log(t), wx.showToast({
            title: "清除失败"
          });
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    that.updateInterval();
  },


  // 更新计时器
  updateInterval: function () {
    var that = this;
    var waterHeight = that.data.waterHeight;
    var countTime = that.data.countTime;
    console.log("---update:",countTime)
    var gainYG = that.data.gainYG;

    var interval = setInterval(function () {
      // 秒数
      var totalSecond = that.data.countTime;

      // 天数位
      var day = Math.floor(totalSecond / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;

      // 小时位
      var hr = Math.floor((totalSecond - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;

      // 分钟位
      var min = Math.floor((totalSecond - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;

      // 秒位
      var sec = totalSecond - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;

      this.setData({
        countDownDay: dayStr,
        countDownHour: hrStr,
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        wx.showToast({
          title: '音感源泉已满',
        });
        this.setData({
          countDownDay: '00',
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
    // 更新听歌时获得的音感
    that.setData({
      intervalGainYG: setInterval(function(){
        // 秒数
        var totalSecond = that.data.totalGainTime; //3600s 一小时

        var isplaying = app.globalData.playing;
        let userId = wx.getStorageSync("userId");
        // totalSecond--;
        // that.setData({
        //   totalGainTime: totalSecond
        // })
        // console.log("--- isplaying", isplaying, ",totalSecond", totalSecond)
        if (totalSecond > 0 && isplaying) {
          totalSecond--;
          that.setData({
            totalGainTime: totalSecond
          })
          // 每300秒 即5分钟增加一次音感
          if(totalSecond%300==0){
            console.log("获得音感+5,totalSecond", totalSecond);
            wx.request({
              url: s.updateYinganByYinyuan,
              data: {
                id: userId,
              },
              success: function (res) {
                console.log("updateYinganByYinyuan succ:", res);
              },
              fail: function (res) {
                console.log("updateYinganByYinyuan fail:", res);
              }
            })
          }
        } else {
          // clearInterval(that.data.intervalGainYG);
          // wx.showToast({
          //   title: '活动已结束',
          // });
          // console.log("不获得")
        }
      }, 1000),  //单位ms 300秒即5分钟
    });  

    //如果将定时器设置在外面，那么用户就看不到countTime的数值动态变化，所以要把定时器存进data里面
    that.setData({
      intervalTime: setInterval(function () {//这里把setInterval赋值给变量名为intervalTime的变量
        //每隔一秒countTime就减一，实现同步
        countTime--;
        // waterHeight += 1;
        // gainYG++;
        //然后把countTime存进data，好让用户知道时间在倒计着
        that.setData({
          countTime: countTime,
          // waterHeight: waterHeight,
          // gainYG: gainYG,
        })
        //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
        if (countTime == 0) {
          that.setData({
            dropping: false, //时间到，设置不滴水
          })
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
          //因为intervalTime是存在data里面的，所以在关掉时，也要在data里取出后再关闭
          clearInterval(that.data.intervalTime);
          //关闭定时器之后，可作其他处理codes go here
        }
      }, 1000),
      intervalDrop: setInterval(function () {//这里把setInterval赋值给变量名为timer的变量
        //每隔一秒countTime就减一，实现同步
        // countTime--;
        waterHeight += 1;
        // gainYG++;
        //然后把countTime存进data，好让用户知道时间在倒计着
        that.setData({
          // countTime: countTime,
          waterHeight: waterHeight,
          // gainYG: gainYG,
        })
        //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
        if (countTime == 0) {
          that.setData({
            dropping: false, //时间到，设置不滴水
          })
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
          //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
          clearInterval(that.data.intervalDrop);
          //关闭定时器之后，可作其他处理codes go here
        }
      }, 90000),
      // 90s 1rpx
      intervalYG: setInterval(function () {//这里把setInterval赋值给变量名为timer的变量
        //每隔一秒countTime就减一，实现同步
        // countTime--;
        // waterHeight += 1;
        gainYG++;
        //然后把countTime存进data，好让用户知道时间在倒计着
        that.setData({
          // countTime: countTime,
          // waterHeight: waterHeight,
          gainYG: gainYG,
        })
        //在倒计时还未到0时，这中间可以做其他的事情，按项目需求来
        if (countTime == 0) {
          that.setData({
            dropping: false, //时间到，设置不滴水
          })
          //这里特别要注意，计时器是始终一直在走的，如果你的时间为0，那么就要关掉定时器！不然相当耗性能
          //因为timer是存在data里面的，所以在关掉时，也要在data里取出后再关闭
          clearInterval(that.data.intervalDrop);
          //关闭定时器之后，可作其他处理codes go here
        }
      }, 180000)
      // 180s 1音感
    });
  },

  // 清除定时器
  clearInterval: function () {
    console.log("clear---")
    let that = this;
    clearInterval(that.data.intervalTime);
    clearInterval(that.data.intervalDrop);
    clearInterval(that.data.intervalYG);
    // clearInterval(that.data.intervalGainYG);
  },

  // 点击获取音感
  gainYG: function () {
    let that = this;
    let gainYG = that.data.gainYG;
    console.log("gainYG:", gainYG)
    let totalYG = gainYG + that.data.totalYG;
    console.log("totalYG:", totalYG)
    that.setData({
      countTime: totalCountTime,
      waterHeight: 0,
      gainYG: 0,
      totalYG: totalYG,
    })
    that.clearInterval();
    that.updateInterval();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    that.getUserBasicInfo();    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("----onHide")
    var that = this;
    that.hideModal();
    var userId = wx.getStorageSync("userId");
    console.log("that.data.countTime:", that.data.countTime)
    wx.setStorageSync("countTime", that.data.countTime);
    wx.setStorageSync("waterHeight", that.data.waterHeight);
    wx.setStorageSync("gainYG", that.data.gainYG);
    // wx.setStorageSync("totalYG", that.data.totalYG);

    // let totalYG = wx.getStorageSync("totalYG");
    let totalYG = that.data.totalYG;
    console.log("userId:", userId, "totalYG:", totalYG)
    // 发请求修改同步后台音感数据
    wx.request({
      url: s.yinganUpdata,
      data: {
        id:userId,
        yingan: totalYG,
      },  
      success: function(res){
        console.log("succ:",res);
        if(res.data.success == true){
          console.log("更新音感成功！")
          wx.setStorageSync("totalYG", that.data.totalYG);
        }else{
          console.log("更新音感失败")
        }
      },
      fail: function (res) {
        console.log("fail:", res);
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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