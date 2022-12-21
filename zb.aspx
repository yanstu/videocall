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
    <link rel="stylesheet" href="css/zb.css" />
    <link rel="stylesheet" href="./lib/layui/css/layui.css" />
    <script src="./js/onload.js"></script>
    <script src="./js/api.js"></script>
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
        <img
          style="margin-left: 10px"
          id="testing_btn"
          title="设备、网络检测"
          src="./img/check-mic.png"
        />
        <img
          style="margin-left: 10px"
          id="qiehuan_btn"
          title="切换播放模式"
          src="./img/qiehuan.svg"
        />
      </div>
      <div class="header-center">
        <div
          id="roomTitle"
          class="text-[1.8rem] text-white flex items-center justify-center whitespace-nowrap"
        ></div>
      </div>
      <div class="header-right">
        <div class="onlineDiv" style="display: none">
          <div class="onlineIcon"></div>
          <div id="onlineNum">
            <span id="onlineNum-zaixian"></span>/<span
              id="onlineNum-zongrenshu"
            ></span>
          </div>
        </div>
        <div id="exit_btn" class="anniubeijing">退出</div>
      </div>
    </header>
    <section class="relative">
      <div id="playerbox"></div>
    </section>

    <!-- TRTC推流容器 -->
    <div id="publishBox" style="display: none"></div>

    <!--如果需要在 Chrome 和 Firefox 等现代浏览器中通过 H5 播放 HLS 格式的视频，需要在 tcplayer.v4.2.min.js 之前引入 hls.min.0.13.2m.js。-->
    <script src="./lib/live/hls.min.0.13.2m.js"></script>
    <!--如果需要在 Chrome 和 Firefox 等现代浏览器中通过 H5 播放 Webrtc 视频，需要在 tcplayer.vx.x.x.min.js 之前引入 TXLivePlayer-x.x.x.min.js。-->
    <script src="./lib/live/TXLivePlayer-1.2.3.min.js"></script>
    <!--播放器脚本文件-->
    <script src="lib/live/tcplayer.v4.5.4.min.js"></script>
    <script src="./lib/jquery/jquery.min.js"></script>
    <script src="./lib/trtc/trtc.js"></script>
    <script src="./js/variable.js"></script>
    <script src="./js/util.js"></script>
    <script src="./js/live/Player.js"></script>
    <script src="./js/device-testing.js"></script>
    <script src="./js/rtc-detection.js"></script>
    <script src="./lib/jquery/signalr.min.js"></script>
    <script src="./js/template.js"></script>
    <script src="./js/elementHandle.js"></script>
    <script src="./js/BaseChatHubClient.js"></script>
    <script src="./js/zb/ChatHubClient.js"></script>
    <script src="./js/common-public.js"></script>
    <script src="./js/zb/common.js"></script>
    <script src="./js/zb/rtc-client.js"></script>
    <script src="./lib/layui/layui.js"></script>
    <script src="./js/zb/event.js"></script>
    <script src="./js/prohibit.js"></script>
    <script src="./js/iconfont.js"></script>

    <script>
      var JsonStr = '<%=JsonStr%>';
      authenticate(JsonStr);
    </script>
  </body>
</html>
