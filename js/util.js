function isIos() {
  var userAgent = navigator.userAgent;
  return !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
}

function isAndroid() {
  var userAgent = navigator.userAgent;
  return userAgent.indexOf('Android') > -1 || userAgent.indexOf('Adr') > -1;
}

function isPC() {
  var userAgentInfo = navigator.userAgent;
  var Agents = new Array(
    'Android',
    'iPhone',
    'SymbianOS',
    'Windows Phone',
    'iPad',
    'iPod'
  );
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

/**
 * 开发环境/生产环境/本地环境
 * @returns {object} function
 */
const env = (() => {
  function baohan(name) {
    return location.hostname.includes(name);
  }
  return {
    isLocal() {
      return baohan('localhost') || baohan('114');
    },
    isDevelop() {
      return baohan('localhost') || baohan('114') || baohan('testvideo');
    },
  };
})();

/**
 * * queryParams
 * @param {string} name
 * @returns {string}
 */
function queryParams(name) {
  const match = window.location.search.match(
    new RegExp('(\\?|&)' + name + '=([^&]*)(&|$)')
  );
  return !match ? '' : decodeURIComponent(match[2]);
}

/**
 * * 启用eruda控制台插件
 */
async function enableEruda() {
  await remoteLoadJs('./lib/eruda/eruda.js');
  await remoteLoadJs('./lib/eruda/eruda-dom@2.0.0.js');
  window.eruda.init();
  window.eruda.add(window.erudaDom);
}

/**
 * 它返回浏览器名称和版本。
 * @returns 具有两个属性的对象：浏览器和版本。
 */
function getBrowser() {
  var sys = {};
  var ua = navigator.userAgent.toLowerCase();
  var s;
  (s = ua.match(/edge\/([\d.]+)/))
    ? (sys.edge = s[1])
    : (s = ua.match(/rv:([\d.]+)\) like gecko/))
    ? (sys.ie = s[1])
    : (s = ua.match(/msie ([\d.]+)/))
    ? (sys.ie = s[1])
    : (s = ua.match(/firefox\/([\d.]+)/))
    ? (sys.firefox = s[1])
    : (s = ua.match(/tbs\/([\d]+)/))
    ? (sys.tbs = s[1])
    : (s = ua.match(/xweb\/([\d]+)/))
    ? (sys.xweb = s[1])
    : (s = ua.match(/chrome\/([\d.]+)/))
    ? (sys.chrome = s[1])
    : (s = ua.match(/opera.([\d.]+)/))
    ? (sys.opera = s[1])
    : (s = ua.match(/version\/([\d.]+).*safari/))
    ? (sys.safari = s[1])
    : 0;

  if (sys.xweb)
    return {
      browser: 'webView XWEB',
      version: '',
    };
  if (sys.tbs)
    return {
      browser: 'webView TBS',
      version: '',
    };
  if (sys.edge)
    return {
      browser: 'Edge',
      version: sys.edge,
    };
  if (sys.ie)
    return {
      browser: 'IE',
      version: sys.ie,
    };
  if (sys.firefox)
    return {
      browser: 'Firefox',
      version: sys.firefox,
    };
  if (sys.chrome)
    return {
      browser: 'Chrome',
      version: sys.chrome,
    };
  if (sys.opera)
    return {
      browser: 'Opera',
      version: sys.opera,
    };
  if (sys.safari)
    return {
      browser: 'Safari',
      version: sys.safari,
    };

  return {
    browser: '',
    version: '0',
  };
}

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * * 如果浏览器支持 Page Visibility API，则返回 document.hidden 属性的值。如果浏览器不支持 Page Visibility API，返回 undefined。
 * @returns 文档的隐藏属性。
 */
function isHidden() {
  var hidden, visibilityChange;
  if (typeof document.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityChange = 'visibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityChange = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityChange = 'webkitvisibilitychange';
  }
  return document[hidden];
}

/**
 * * HH:MM:SS`的格式返回当前时间的字符串。
 * @returns {string} 带有当前日期和时间的字符串。
 */
// 它以`YYYY-MM-DD HH:MM:SS`的格式返回当前时间的字符串。
function getNowTime() {
  function formatZero(num, len = 2) {
    if (String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth();
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  return `${formatZero(hour)}:${formatZero(minute)}:${formatZero(second)}`;
  return `${year}-${formatZero(month)}-${formatZero(day)} ${formatZero(
    hour
  )}:${formatZero(minute)}:${formatZero(second)}`;
}

/**
 * 同步加载js
 * @param {string} url
 * @param {boolean?} hasCallback
 * @returns {Promise}
 */
function remoteLoadJs(url, hasCallback = false) {
  return createScript(url);
  /**
   * 创建script
   * @param url
   * @returns {Promise}
   */
  function createScript(url) {
    let scriptElement = document.createElement('script');
    document.body.appendChild(scriptElement);
    let promise = new Promise((resolve, reject) => {
      scriptElement.addEventListener(
        'load',
        (e) => {
          removeScript(scriptElement);
          if (!hasCallback) {
            resolve(e);
          }
        },
        false
      );
      scriptElement.addEventListener(
        'error',
        (e) => {
          removeScript(scriptElement);
          reject(e);
        },
        false
      );
      if (hasCallback) {
        window.____callback____ = function () {
          resolve();
          window.____callback____ = null;
        };
      }
    });
    if (hasCallback) {
      url += '&callback=____callback____';
    }
    scriptElement.src = url;
    return promise;
  }

  /**
   * 移除script标签
   * @param scriptElement script dom
   */
  function removeScript(scriptElement) {
    document.body.removeChild(scriptElement);
  }
}