//index.js
//获取应用实例
const app = getApp()
var s = require("../../utils/http.js");

Page({
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hasNet: true,
  },

  onLoad: function(e) {
    var that = this;
    // TODO 测试网络连接
    wx.request({
      url: s.serverDomain + "/",
      success: function(res) {
        that.data.hasNet = true;
        console.log("---hasNet", that.data.hasNet);
        // 查看是否授权过
        wx.getSetting({
          success: function (res) {
            console.log("111  scope.usreInfo:", res.authSetting['scope.userInfo'])
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称
              wx.getUserInfo({
                success: function (res) {
                  console.log("getUserInfo:", res.userInfo)
                  wx.setStorageSync("userInfo", res.userInfo)
                }
              })
              // 若以授权登录过，则直接到主界面
              var hasUserId = wx.getStorageSync("userId");
              if (hasUserId) {
                console.log("index has userId")
                wx.showLoading({
                  title: '登录中...',
                  complete: function (res) {
                    console.log("---showLoad")
                    wx.redirectTo({ //redirectTo不带返回上一见面，navigateTo带返回
                      url: '../home/home',
                    })
                  }
                });
                setTimeout(function () {
                  console.log("---hideLoad")
                  wx.hideLoading()
                }, 2000)
              }
            }
          }
        })
      },
      fail: function(res) {
        that.data.hasNet = false;
        console.log("---notNet", that.data.hasNet);
        wx.showToast({
          title: '网络连接失败！',
          icon: 'none',
          duration: 2000,
        });
      },
    })
    // console.log("---index hasNet:", app.globalData.hasNet);
    // if (!app.globalData.hasNet){
    //   console.log("notNet")
    //   wx.showToast({
    //     title: '网络连接失败！',
    //     duration: 2000,
    //   });
    // }

    //获取系统信息
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        })
      }
    })

    

  },

  // 点击进入，获取用户信息向后台换取openId并缓存userId
  bindGetUserInfo: function(event) {
    console.log("bindGetUserInfo", event.detail.userInfo)
    //使用
    wx.getSetting({
      success: res => {
        console.log("222 scope.usreInfo:", res.authSetting['scope.userInfo'])
        if (res.authSetting['scope.userInfo']) {
          wx.showLoading({
            title: '登录中...',
          })
          wx.login({
            success: res => {
              // 发送 res.code 到后台换取 openId, sessionKey, unionId
              if (res.code) {
                wx.getUserInfo({
                  success: function(res_user) {
                    console.log("---res_user:", res_user)
                    wx.setStorageSync("userInfo", res_user.userInfo)
                    wx.request({
                      url: s.getOpenId, //这里是本地请求路径,可以写你自己的本地路径,也可以写线上环境
                      data: {
                        code: res.code, //获取openid的话 需要向后台传递code,利用code请求api获取openid
                        nickname: res_user.userInfo.nickName, //这些是用户的基本信息 获取昵称
                        avatarUrl: res_user.userInfo.avatarUrl, //获取头像链接
                        gender: res_user.userInfo.gender, //获取性别
                        country: res_user.userInfo.country, //获取国家
                        province: res_user.userInfo.province, //获取省份
                        city: res_user.userInfo.city //获取城市
                      },
                      success: function(res) {
                        console.log("---res:", res)
                        wx.setStorageSync("userId", res.data.userId) //可以把openid保存起来,以便后期需求的使用
                        wx.redirectTo({
                          url: '../home/home',
                        })
                      },
                      fail: function(res) {
                        console.log("fail:", res);
                        wx.hideLoading();
                        wx.showToast({
                          title: '联网失败!',
                          icon: 'none',
                          duration: 1500,
                        })
                      }
                    })
                  }
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '请允许授权才能使用小程序哦~',
            icon: 'none',
          })
          console.log('获取用户信息失败')
        }
      }
    })
  },

  toXZYY: function() {

  },
})