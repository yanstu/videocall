/**
 * @param {string} key - 关键是接口的名称，也就是路由器函数中的接口名称。
 * @returns {object} 对象中键的值。
 */
function router(key) {
  var urls = {
    /**
     * 检查进入会议信息
     * @param {string} JMStr
     */
    checkJRHYInfo: {
      method: 'post',
      url: apiBaseUrl + 'VideoConference/CheckJRHYInfo',
    },
    /**
     * 连接redis
     */
    RedisHandler: {
      method: 'post',
      url: '/Handler/RedisHandler.ashx',
      errmsg: 'redis服务连接失败',
    },
    /**
     * 展示端心跳连接
     */
    LoginHandler: {
      method: 'post',
      url: '/Handler/LoginHandler.ashx',
      errmsg: 'redis服务连接失败',
    },
  };
  return urls[key];
}

/**
 * @param {string} str
 * @param {object?} data
 * @param {function} callback
 */
function ajaxMethod(str, data = {}, callback) {
  const route = router(str);
  $.ajax({
    type: route.method,
    url: route.url,
    data,
    dataType: 'json',
    async: false,
    timeout: 10 * 1000,
    beforeSend: (XMLHttpRequest) => {
      XMLHttpRequest.setRequestHeader('Token', 'abc123sfkj');
    },
    success: (res) => {
      callback && callback(res);
    },
    error: (error) => {
      window.layer &&
        layer.msg(route.errmsg || '请求超时或没有网络链接', { icon: 2 });
      setTimeout(() => {
        console.log('[ajaxMethod] ', error)
        ajaxMethod(str, data, callback)
      }, 1 * 1000);
    },
  });
}
