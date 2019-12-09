<<<<<<< HEAD
/**
 * 创建用户感受表中的音缘序号
 */
function createFeelNum() {
  //获取当前时间戳
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  console.log("当前时间戳为：" + timestamp);
  //获取当前时间
  var n = timestamp * 1000;
  var date = new Date(n);
  //年
  var Y = date.getFullYear();
  //月
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  //日
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  //时
  var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  //分
  var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  //秒
  var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  console.log("当前时间：" + Y + M + D + h + ":" + m + ":" + s);
  var userId = wx.getStorageSync("userId");
  console.log("---userId:", userId);
  var fellNum = ""+ Y + M + D + h + m + s + userId;
  console.log("---feelNum:", fellNum)
  return fellNum;
}


/**
 * 用于判断空，Undefined String Number Array Object
 */
function isBlank(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') { //空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Number]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数字或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return JSON.stringify(str) == '{}' ? true : false
  } else {
    return true
  }
}

/**
 * 导出
 */
module.exports = {
  createFeelNum: createFeelNum,
  isBlank: isBlank
=======
<<<<<<< HEAD
/**
 * 创建用户感受表中的音缘序号
 */
function createFeelNum() {
  //获取当前时间戳
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  console.log("当前时间戳为：" + timestamp);
  //获取当前时间
  var n = timestamp * 1000;
  var date = new Date(n);
  //年
  var Y = date.getFullYear();
  //月
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  //日
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  //时
  var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  //分
  var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  //秒
  var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  console.log("当前时间：" + Y + M + D + h + ":" + m + ":" + s);
  var userId = wx.getStorageSync("userId");
  console.log("---userId:", userId);
  var fellNum = ""+ Y + M + D + h + m + s + userId;
  console.log("---feelNum:", fellNum)
  return fellNum;
}


/**
 * 用于判断空，Undefined String Number Array Object
 */
function isBlank(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') { //空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Number]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数字或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return JSON.stringify(str) == '{}' ? true : false
  } else {
    return true
  }
}

/**
 * 导出
 */
module.exports = {
  createFeelNum: createFeelNum,
  isBlank: isBlank
=======
/**
 * 创建用户感受表中的音缘序号
 */
function createFeelNum() {
  //获取当前时间戳
  var timestamp = Date.parse(new Date());
  timestamp = timestamp / 1000;
  console.log("当前时间戳为：" + timestamp);
  //获取当前时间
  var n = timestamp * 1000;
  var date = new Date(n);
  //年
  var Y = date.getFullYear();
  //月
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  //日
  var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  //时
  var h = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  //分
  var m = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  //秒
  var s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  console.log("当前时间：" + Y + M + D + h + ":" + m + ":" + s);
  var userId = wx.getStorageSync("userId");
  console.log("---userId:", userId);
  var fellNum = ""+ Y + M + D + h + m + s + userId;
  console.log("---feelNum:", fellNum)
  return fellNum;
}


/**
 * 用于判断空，Undefined String Number Array Object
 */
function isBlank(str) {
  if (Object.prototype.toString.call(str) === '[object Undefined]') { //空
    return true
  } else if (
    Object.prototype.toString.call(str) === '[object String]' ||
    Object.prototype.toString.call(str) === '[object Number]' ||
    Object.prototype.toString.call(str) === '[object Array]') { //字条串或数字或数组
    return str.length == 0 ? true : false
  } else if (Object.prototype.toString.call(str) === '[object Object]') {
    return JSON.stringify(str) == '{}' ? true : false
  } else {
    return true
  }
}

/**
 * 导出
 */
module.exports = {
  createFeelNum: createFeelNum,
  isBlank: isBlank
>>>>>>> renew
>>>>>>> 2019/12/9
}