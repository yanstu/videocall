importScripts('../lib/jquery/jquery.nodom.js');

let heartbeatUserId = ''

self.onmessage = (event) => {
  heartbeatUserId = event.data;
  setInterval(() => {
    request()
  }, 2000);
};

function request() {
  $.ajax({
    url: '/Handler/RedisHandler.ashx',
    type: 'post',
    timeout: 2000,
    dataType: 'json',
    async: true,
    data: {
      Infotype: 'Heartbeat',
      key: heartbeatUserId,
    },
    error: (res) => {
      res.responseText != '成功' && console.error(self.name, res.responseText);
      self.postMessage(res.responseText);
    },
  });
}