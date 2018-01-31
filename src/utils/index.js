export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null;
  }

  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;

  if (typeof time == 'object') {
    date = time;
  } else {
    if (time && typeof time == 'string' && time.indexOf('-') != -1) {
      time = time.replace(/-/g, '/');
    }
    date = new Date(time);
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  };
  const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
    let value = formatObj[key];
    if (key === 'a') return ['一', '二', '三', '四', '五', '六', '日'][value - 1];
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
  return time_str;
}

export function sec2time(s) {
  var t;
  if (s > -1) {
    var hour = Math.floor(s / 3600);
    var min = Math.floor(s / 60) % 60;
    var sec = s % 60;
    if (hour < 10) {
      t = '0' + hour + ":";
    } else {
      t = hour + ":";
    }

    if (min < 10) { t += "0"; }
    t += min + ":";
    if (sec < 10) { t += "0"; }
    t += sec;
  }
  return t;
}

export function time2sec(time) {
  var s = '';
  var hour = time.split(':')[0];
  var min = time.split(':')[1];
  var sec = time.split(':')[2];

  s = Number(hour * 3600) + Number(min * 60) + Number(sec);

  return s;
};


export function formatTime(time, option) {
  time = +time * 1000;
  const d = new Date(time);
  const now = Date.now();
  const diff = (now - d) / 1000;

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) { // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return d.getMonth() + 1 + '月' + d.getDate() + '日' + d.getHours() + '时' + d.getMinutes() + '分'
  }
}

/* 合法uri*/
export function validateURL(textval) {
  const urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
  return urlregex.test(textval);
}

/* 小写字母*/
export function validateLowerCase(str) {
  const reg = /^[a-z]+$/;
  return reg.test(str);
}

/* 大写字母*/
export function validateUpperCase(str) {
  const reg = /^[A-Z]+$/;
  return reg.test(str);
}

/* 大小写字母*/
export function validatAlphabets(str) {
  const reg = /^[A-Za-z]+$/;
  return reg.test(str);
}

export function randomName(num) {
  // console.log(num)
  var str = "",
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  for (var i = 0; i < num; i++) {
    let pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

export function randomFaceurl() {
  let url = `https://img.wdstatic.cn/imdemo/${Math.floor(Math.random() * 10 + 1)}.png`;
  return url
}

export function realSysTime(val) {
  const currentDate = new Date().getTime(); //结束时间
  const roomTime = currentDate - val; //时间差的毫秒数
  const leave1 = roomTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000)) + "";
  if (hours.length == 1) hours = "0" + hours;
  //计算相差分钟数
  const leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
  let minutes = Math.floor(leave2 / (60 * 1000)) + "";
  if (minutes.length == 1) minutes = "0" + minutes;
  //计算相差秒数
  const leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
  let seconds = Math.round(leave3 / 1000) + "";
  if (seconds.length == 1) seconds = "0" + seconds; //格式0更改为00
  return `${hours}:${minutes}:${seconds}`;
}
