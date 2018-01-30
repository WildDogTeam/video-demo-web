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

export function splitJoin(e) {
  return e.split("-").slice(1).join("");
}

export function fileType(e) {
  let type = e.split(".")[e.split(".").length - 1];
  switch (type) {
    case "pdf":
      type = "pdf";
      break;
    case "doc":
      type = "doc";
      break;
    case "docx":
      type = "doc";
      break;
    case "ppt":
      type = "ppt";
      break;
    case "pptx":
      type = "ppt";
      break;
    case "pptm":
      type = "ppt";
      break;
    case "mp3":
      type = "mp3";
      break;
    case "mp4":
      type = "mp4";
      break;
    default:
      break;
  }
  return type;
}

export function readablizeBytes(bytes) {
  const s = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
  const e = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, Math.floor(e))).toFixed(2) + " " + s[e];
}
