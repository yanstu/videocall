<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="zb.aspx.cs"
Inherits="VideoConnectionWeb.zb" %>

<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="pragma" content="no-cache" />
    <meta http-equiv="content-type" content="no-cache, must-revalidate" />
    <meta http-equiv="expires" content="Wed, 26 Feb 1997 08:21:57 GMT" />
    <meta
      http-equiv="Content-Security-Policy"
      content="upgrade-insecure-requests"
    />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no"
    />
    <title>视频连线</title>
    <link rel="icon" href="./img/favicon.ico" />
    <link href="css/normalize.css" rel="stylesheet" />
    <link href="lib/live/tcplayer.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="./css/common.css" />
    <link rel="stylesheet" href="./css/sdkcss.css" />
    <link rel="stylesheet" href="css/mzb.css" />
    <link rel="stylesheet" href="./lib/layui/css/layui.css" />
    <script>
      const apiBaseUrl = '<%=ApiBaseUrl%>';
      const hubBaseUrl = '<%=HubBaseUrl%>';
      const hubsUrl = hubBaseUrl + 'chatHub';
    </script>
  </head>
  <body>
    <header>
      <div class="header-left">
        <img
          id="qiehuanquanping_btn"
          title="切换全屏模式"
          src="./img/full.png"
        />

        <img id="xuanzhuan_btn" title="翻转视频" src="./img/xuanzhuan3.svg" />
      </div>
      <div class="header-center">
        <div
          class="overflow-hidden text-ellipsis whitespace-nowrap"
          id="roomTitle"
        >
          视频连线
        </div>
      </div>
      <div class="header-right">
        <img
          style="margin-right: 7px"
          id="testing_btn"
          title="设备、网络检测"
          src="./img/check-mic.png"
        />
        <div id="exit_btn">退出</div>
      </div>
    </header>

    <section class="relative">
      <div id="playerbox"></div>
    </section>

    <footer>
      <div id="tabs" class="layui-tab layui-tab-card">
        <ul class="layui-tab-title">
          <li class="layui-this">消息列表</li>
          <li>参会列表</li>
        </ul>
        <div class="layui-tab-content" style="height: 100px">
          <div class="layui-tab-item layui-show">1</div>
          <div class="layui-tab-item">2</div>
        </div>
      </div>
    </footer>

    <!-- TRTC推流容器 -->
    <div id="publishBox" style="display: none"></div>

    <!-- sdk -->
    <!--如果需要在 Chrome 和 Firefox 等现代浏览器中通过 H5 播放 HLS 格式的视频，需要在 tcplayer.v4.2.min.js 之前引入 hls.min.0.13.2m.js。-->
    <script src="./lib/live/hls.min.0.13.2m.js"></script>
    <!--如果需要在 Chrome 和 Firefox 等现代浏览器中通过 H5 播放 Webrtc 视频，需要在 tcplayer.vx.x.x.min.js 之前引入 TXLivePlayer-x.x.x.min.js。-->
    <script src="./lib/live/TXLivePlayer-1.2.3.min.js"></script>
    <!--播放器脚本文件-->
    <script src="./lib/live/tcplayer.v4.5.4.min.js"></script>
    <script src="./lib/jquery/jquery.min.js"></script>
    <script src="./lib/trtc/trtc.js"></script>
    <script src="./lib/jquery/signalr.min.js"></script>
    <script src="./lib/layui/layui.js"></script>
    <!-- js -->
    <script src="./js/onload.js"></script>
    <script src="./js/variable.js"></script>
    <script src="./js/api.js"></script>
    <script src="./js/util.js"></script>
    <script src="./js/device-testing.js"></script>
    <script src="./js/rtc-detection.js"></script>
    <script src="./js/template.js"></script>
    <script src="./js/elementHandle.js"></script>
    <script src="./js/BaseChatHubClient.js"></script>
    <script src="./js/zb/ChatHubClient.js"></script>
    <script src="./js/common-public.js"></script>
    <script src="./js/zb/common.js"></script>
    <script src="./js/zb/rtc-client.js"></script>
    <script src="./js/live/Player.js"></script>
    <script src="./js/zb/event.js"></script>
    <script src="./js/prohibit.js"></script>
    <script src="./js/iconfont.js"></script>
    <script>
      var JsonStr = '<%=JsonStr%>';
      authenticate(JsonStr);
    </script>
  </body>
</html>
