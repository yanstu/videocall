<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="small2.aspx.cs"
Inherits="VideoConnectionWeb.small2" %>
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
    <link rel="stylesheet" href="./lib/layui/css/layui.css" />
    <link rel="stylesheet" href="./css/sdkcss.css" />
    <link rel="stylesheet" href="./css/index.css" />
    <link rel="stylesheet" href="./css/common.css" />
    <style>
      * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      #video-grid {
        border: 1px solid #393e4b !important;
        box-sizing: border-box;
        margin-bottom: -2px;
        margin-right: -1px;
      }
      #video-grid > div {
        border: none;
        border-right: #393e4b 1px solid !important;
        border-bottom: #393e4b 1px solid !important;
      }
    </style>
    <script>
      const apiBaseUrl = '<%=ApiBaseUrl%>';
      const hubBaseUrl = '<%=HubBaseUrl%>';
      const hubsUrl = hubBaseUrl + 'chatHub';
    </script>
  </head>

  <body class="w-screen h-screen">
    <header class="flex flex-row h-[70px] bg-[#262626] w-full justify-between">
      <div class="w-[8%] flex items-center justify-start">
        <img
          id="testing_btn"
          title="设备、网络检测"
          style="height: 50%; max-width: 2.5rem; margin-left: 0.7rem"
          src="./img/check-mic.png"
        />
        <img
          id="qiehuanquanping_btn"
          title="切换全屏模式"
          style="height: 50%; max-width: 2.5rem; margin-left: 0.6rem"
          src="./img/full.png"
        />
      </div>
      <div
        id="roomTitle"
        class="text-[1.8rem] text-white flex items-center justify-center whitespace-nowrap"
      ></div>
      <div class="flex items-center justify-end">
        <div class="onlineDiv" style="display: none">
          <div class="onlineIcon"></div>
          <div id="onlineNum">
            <span id="onlineNum-zaixian"></span>/<span
              id="onlineNum-zongrenshu"
            ></span>
          </div>
        </div>
        <img
          id="network-down"
          style="max-width: 2.5rem; margin-right: 0.75rem; height: 50%"
          src="./img/network/down/network_4.png"
        />
        <div
          id="exit_btn"
          style="font-size: 16px; max-width: 4rem"
          class="anniubeijing mr-4 w-[5rem] h-[50%] flex justify-center items-center text-white pl-3 pr-3"
        >
          退出
        </div>
      </div>
    </header>

    <section class="section-heght flex flex-row w-full bg-[#24292e] relative">
      <!-- 视频区域 -->
      <div
        id="video-grid"
        style="background: #24292e"
        class="box-border grid w-full h-full items-center justify-center z-10 grid-cols-5 grid-rows-5"
      ></div>
    </section>

    <footer
      class="w-full h-[80px] drop-shadow-md flex items-center justify-center absolute bottom-2 z-50 mx-auto"
    >
      <div
        id="toolbar"
        style="display: none"
        class="h-full w-auto flex text-center text-white items-center justify-center mx-auto relative"
      >
        <div
          class="absolute w-full h-full top-0 left-0 shadow bg-black opacity-10 pointer-events-none"
        ></div>
        <div class="toolbar_btn" id="shangyiye_foot_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-shangyiye"></use>
          </svg>
          <span class="mt-1 text-[14px]">上一页</span>
        </div>
        <div class="toolbar_btn" id="xiayiye_foot_btn">
          <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
            <use xlink:href="#icon-xiayiye"></use>
          </svg>
          <span class="mt-1 text-[14px]">下一页</span>
        </div>
      </div>
    </footer>

    <!-- sdk -->
    <script src="./lib/jquery/jquery.min.js"></script>
    <script src="./lib/trtc/trtc.js"></script>
    <script src="./lib/jquery/signalr.min.js"></script>
    <script src="./lib/layui/layui.js"></script>
    <script src="./lib/drag.js"></script>
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
    <script src="./js/small2/ChatHubClient.js"></script>
    <script src="./js/common-public.js"></script>
    <script src="./js/small2/common.js"></script>
    <script src="./js/small2/rtc-client.js"></script>
    <script src="./js/elementEvent.js"></script>
    <script src="./js/iconfont.js"></script>
    <script src="./js/prohibit.js"></script>
    <script>
      var JsonStr = '<%=JsonStr%>';
      authenticate(JsonStr);

      $(function () {
        $('#mic_drag').each(function () {
          $(this).dragging({
            move: 'both',
            randomPosition: false,
          });
        });
      });
    </script>
  </body>
</html>
