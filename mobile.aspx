<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="mobile.aspx.cs"
Inherits="VideoConnectionWeb.mobile" %>
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
      #zjr_box,
      .video-box,
      #video-grid {
        box-shadow: 0 2px 5px 0 rgb(0 0 0 / 20%), 0 2px 10px 0 rgb(0 0 0 / 10%) !important;
      }
    </style>
    <script>
      const apiBaseUrl = '<%=ApiBaseUrl%>';
      const hubBaseUrl = '<%=HubBaseUrl%>';
      const hubsUrl = hubBaseUrl + 'chatHub';
    </script>
  </head>

  <body class="w-screen h-screen">
    <header
      class="flex flex-row whitespace-nowrap h-[7%] bg-[#262626] w-full justify-between items-center"
    >
      <div class="flex items-center justify-start flex-1 ml-2">
        <img
          id="network-up"
          style="width: 1.6rem; height: 1.6rem"
          class="h-full w-auto"
          src="./img/network/up/network_4.png"
        />
        <img
          style="width: 1.6rem; height: 1.6rem"
          id="network-down"
          class="h-full w-auto ml-2"
          src="./img/network/down/network_4.png"
        />
      </div>
      <div style="flex: 2; padding-right: 15px" class="overflow-hidden">
        <div
          id="roomTitle"
          class="overflow-hidden text-ellipsis whitespace-nowrap w-full text-[16px] text-white text-center"
        ></div>
      </div>
      <div
        class="flex flex-1 flex-row items-center justify-end text-right mr-2"
      >
        <img
          id="testing_btn"
          title="设备、网络检测"
          class="mr-2 invert-[100%]"
          style="height: 1.7rem; width: 1.7rem"
          src="./img/check-mic.png"
        />
        <div
          id="exit_btn"
          style="height: 1.7rem; width: 3rem"
          class="anniubeijing pl-2 pr-2 text-[14px] flex justify-center items-center text-white"
        >
          退出
        </div>
      </div>
    </header>

    <section class="h-[93%] flex flex-row w-full bg-[#24292e] relative">
      <!-- 主讲人区 -->
      <div id="zjr_box" class="w-full h-full relative border-none">
        <!-- 视频模板 -->
        <div id="zjr_video" class="w-full h-full video-box relative">
          <!-- “摄像头未开启”遮罩模板 -->
          <div
            id="zjr_mask"
            style="z-index: 8"
            class="mask top-0 left-0 justify-center col-div flex w-full h-full bg-[#24292e] items-center justify-items-center absolute flex-col"
          >
            <img class="h-[40%]" src="./img/camera-gray.png" alt="" />
            <div></div>
          </div>
        </div>
      </div>

      <!-- 群众区 -->
      <div
        id="video-grid"
        class="box-border grid w-[9rem] h-[13rem] overflow-hidden absolute top-[0.5%] right-[1%] items-center z-13"
      ></div>
    </section>

    <footer
      style="height: 9%"
      class="w-full drop-shadow-md flex items-center justify-center absolute bottom-2 z-50 mx-auto"
    >
      <div
        id="toolbar"
        style="display: none"
        class="h-full w-auto flex text-center text-white items-center justify-center mx-auto relative"
      >
        <div
          class="absolute w-full h-full top-0 left-0 shadow bg-black opacity-20 pointer-events-none"
        ></div>
        <div style="width: 4rem" class="toolbar_btn" id="mic_foot_btn">
          <div class="svgbox">
            <svg
              style="font-size: 30px"
              class="icon text-white"
              aria-hidden="true"
            >
              <use xlink:href="#icon-maikefeng"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">麦克风</span>
        </div>
        <div style="width: 4rem" class="toolbar_btn" id="video_foot_btn">
          <div class="svgbox">
            <svg
              style="font-size: 30px"
              class="icon text-white"
              aria-hidden="true"
            >
              <use xlink:href="#icon-xiangji"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">摄像头</span>
        </div>
        <div style="width: 4rem" class="toolbar_btn" id="fanzhuan_btn">
          <div class="svgbox">
            <svg
              style="font-size: 29px"
              class="icon text-white"
              aria-hidden="true"
            >
              <use xlink:href="#icon-fanzhuan"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">翻转</span>
        </div>
        <div style="width: 4rem" class="toolbar_btn" id="xiaoxi_foot_btn">
          <div class="relative svgbox">
            <svg
              style="font-size: 31px"
              class="icon text-white"
              aria-hidden="true"
            >
              <use xlink:href="#icon-xiaoxi"></use>
            </svg>
            <div
              id="xiaoxi_jiaobiao"
              style="display: none"
              class="w-[10px] h-[10px] rounded-full bg-red-600 absolute right-0 top-0"
            ></div>
          </div>
          <span class="mt-1 text-[16px]">消息</span>
        </div>
        <div style="width: 4rem" class="toolbar_btn" id="shenqingfayan_foot_btn">
          <div class="svgbox">
            <svg
              style="font-size: 27px"
              class="icon text-white"
              aria-hidden="true"
            >
              <use xlink:href="#icon-shenqingfayan"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">申请发言</span>
        </div>
      </div>
    </footer>

    <!-- 消息列表 -->
    <div
      id="xiaoxiliebiao"
      style="display: none; width: 90%; margin-left: 5%"
      class="modalbox"
    >
      <div class="modalbox-title">
        <div></div>
        <div class="xiaoxi-title">消息列表</div>
        <div class="box-close" style="margin-right: 5%">X</div>
      </div>
      <div id="messageList" class="h-[86%] w-full overflow-y-scroll pb-3">
        <!-- 消息模板 -->
        <div
          id="message_muban"
          style="display: none"
          class="flex flex-col h-auto pl-2 pr-2 pt-2 text-[0.875rem]"
        >
          <div
            class="message_time mb-2 mt-1 h-[20%] text-white flex justify-center items-center"
          >
            2022-02-27 09:18:12
          </div>
          <div
            class="message_info h-[70%] flex flex-row w-full justify-end items-center"
          >
            <div
              style="min-height: 4.3rem; padding: 0.5rem"
              class="message_neirong text-white text-[0.875rem] mt-1 ml-2 mr-2 mb-1 bg-[#2d3549] w-[80%]"
            >
              这个是内这个是内这个是内内这个
            </div>
            <div
              class="message_touxiang bg-[#2d3549] flex items-center justify-center w-[20%] flex-col h-full"
            >
              <svg class="icon text-[4.5rem] text-white" aria-hidden="true">
                <use xlink:href="#icon-touxiang"></use>
              </svg>
              <div
                style="width: 100%; text-align: center"
                class="message_xingming h-[27%] mb-[3%] text-white text-center overflow-auto text-[0.675rem] overflow-hidden text-ellipsis whitespace-nowrap"
              >
                贵州省人大
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="h-[7%] flex w-full justify-between items-center bg-[#262626] text-[0.875rem]"
      >
        <div
          id="fasong_tip"
          style="font-size: 12px"
          class="mr-2 ml-2 min-w-[15%] text-white flex-1 flex justify-center items-center whitespace-nowrap overflow-hidden text-ellipsis"
        >
          发向管理员
        </div>
        <input
          id="xiaoxineirong"
          class="mr-3 h-[50%] pl-2 pr-2 flex-[1.1]"
          maxlength="200"
        />
        <div
          id="fasongxiaoxi"
          style="height: 60%"
          class="min-w-[15%] anniubeijing h-[50%] mr-2 flex-1 flex justify-center items-center text-white"
        >
          发送
        </div>
      </div>
    </div>

    <!-- 滚动消息 -->
    <div class="gundongxiaoxi" style="display: none; z-index: 19"></div>

    <!-- sdk -->
    <script src="./lib/jquery/jquery.min.js"></script>
    <script src="./lib/trtc/trtc.js"></script>
    <script src="./lib/jquery/signalr.min.js"></script>
    <script src="./lib/layui/layui.js"></script>
    <!-- js -->
    <script src="./js/onload.js"></script>
    <script src="./js/variable.js"></script>
    <script src="./js/api.js"></script>
    <script src="./js/util.js"></script>
    <script src="./js/template.js"></script>
    <script src="./js/elementHandle.js"></script>
    <script src="./js/BaseChatHubClient.js"></script>
    <script src="./js/mobile/ChatHubClient.js"></script>
    <script src="./js/common-public.js"></script>
    <script src="./js/mobile/common.js"></script>
    <script src="./js/rtc-detection.js"></script>
    <script src="./js/mobile/rtc-client.js"></script>
    <script src="./js/device-testing.js"></script>
    <script src="./js/elementEvent.js"></script>
    <script src="./js/iconfont.js"></script>
    <script src="./js/prohibit.js"></script>
    <script>
      const ua = navigator.userAgent.toLowerCase();
      const isWeixin = ua.indexOf('micromessenger') !== -1;
      if ((window.android && window.android.enterMeetingRoom) || isWeixin) {
      } else {
        if (!env.isDevelop()) {
          $('body *').remove();
          $('body').append(`<h1 style="color: red;">请在微信公众号内打开</h1>`);
        }
      }
      var JsonStr = '<%=JsonStr%>';
      authenticate(JsonStr);
    </script>
  </body>
</html>
