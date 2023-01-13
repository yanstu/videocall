importScripts('../lib/jquery/signalr.min.js');

self.onmessage = (event) => {
  let { hubsUrl, meetInfo } = event.data;
  let connection = new signalR.HubConnectionBuilder().withUrl(hubsUrl).build();
  connection
    .start()
    .then(() => {
      connection.invoke('createRedis', meetInfo.RoomId);
      let data = {
        reCode: '25',
        ReUserid: meetInfo.CHID,
        ReUserQYBH: meetInfo.QYBH,
        ReUserName: meetInfo.XM,
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {
          State: 0,
        },
      };

      setInterval(() => {
        connection
          .invoke('redisFB', meetInfo.RoomId, JSON.stringify(data))
          .then(() => {
            console.log('成功');
          });
      }, 1500);
    })
    .catch((error) => {
      console.error('worker', error);
    });
};
