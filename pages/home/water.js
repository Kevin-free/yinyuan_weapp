// pages/home/water.js
var myUtil = require('../../utils/myUtil.js');
const totalCountTime = 10800; //单位秒 3小时

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dropping: true, //是否在滴水

    intervalTime: '', //时间计时器
    intervalDrop: '', //水滴计时器
    intervalYG: '', //音感计时器
    
    countDownHour: 0, //显示时，分，秒
    countDownMinute: 0,
    countDownSecond: 0,
    countTime: totalCountTime, //计时时间初始值，单位秒
    waterHeight: 0, //计时水高初始值
    gainYG: 0, //获得的音感
    totalYG: 100, //总音感
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let countTime = wx.getStorageSync("countTime");
    let waterHeight = wx.getStorageSync("waterHeight");
    let gainYG = wx.getStorageSync("gainYG");
    let totalYG = wx.getStorageSync("totalYG");
    if (!myUtil.isBlank(countTime)){
      console.log("has countTime");
      that.setData({
        countTime: countTime,
        waterHeight: waterHeight,
        gainYG: gainYG,
        totalYG: totalYG,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var that = this;
    that.updateInterval();
  },

  // 更新计时器
  updateInterval: function(){
    var that = this;
    var waterHeight = that.data.waterHeight;
    var countTime = that.data.countTime;
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
          title: '活动已结束',
        });
        this.setData({
          countDownDay: '00',
          countDownHour: '00',
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);

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
      }, 3000),
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
      }, 5000)
    });
  },

  // 清除定时器
  clearInterval: function(){
    console.log("clear---")
    let that = this;
    clearInterval(that.data.intervalTime);
    clearInterval(that.data.intervalDrop);
    clearInterval(that.data.intervalYG);
  },

  // 点击获取音感
  gainYG: function(){
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("----onHide")
    var that = this;
    console.log("that.data.countTime:", that.data.countTime)
    wx.setStorageSync("countTime", that.data.countTime);
    wx.setStorageSync("waterHeight", that.data.waterHeight);
    wx.setStorageSync("gainYG", that.data.gainYG);
    wx.setStorageSync("totalYG", that.data.totalYG);
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