<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="index.aspx.cs"
Inherits="VideoConnectionWeb.index" %>

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
      body {
        overflow: hidden;
      }
      #video-grid {
        border: 1px solid #393e4b !important;
      }
      #video-grid > div {
        border: none;
        height: 99%;
        width: 99.4%;
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
      <div style="margin-left: 0.7rem" class="flex items-center">
        <img
          id="testing_btn"
          title="设备、网络检测"
          style="height: 50%; max-width: 2.5rem"
          src="./img/check-mic.png"
        />
        <img
          id="qiehuanquanping_btn"
          title="切换全屏模式"
          style="height: 50%; max-width: 2.5rem; margin-left: 0.6rem"
          src="./img/full.png"
        />
        <img
          id="kaiqizhibo_btn"
          title="开启直播"
          style="
            height: 50%;
            max-width: 2.5rem;
            margin-left: 0.6rem;
            display: none;
          "
          src="./img/live.svg"
        />
      </div>
      <div
        id="roomTitle"
        class="text-[1.8rem] text-white flex items-center justify-center whitespace-nowrap"
      ></div>
      <div class="flex items-center justify-end mr-4">
        <div class="onlineDiv" style="display: none">
          <div class="onlineIcon"></div>
          <div id="onlineNum">
            <span id="onlineNum-zaixian"></span>/<span
              id="onlineNum-zongrenshu"
            ></span>
          </div>
        </div>
        <img
          id="network-up"
          style="max-width: 2.5rem; margin-right: 0.9rem; height: 50%"
          src="./img/network/up/network_4.png"
        />
        <img
          id="network-down"
          style="max-width: 2.5rem; margin-right: 0.9rem; height: 50%"
          src="./img/network/down/network_4.png"
        />
        <div
          id="exit_btn"
          style="font-size: 16px; max-width: 4rem"
          class="anniubeijing w-[5rem] h-[50%] flex justify-center items-center text-white pl-3 pr-3"
        >
          退出
        </div>
      </div>
    </header>
    <section class="section-heght flex flex-row w-full bg-[#24292e] relative">
      <!-- 主讲人区 -->
      <div id="zjr_box" class="w-[80%] h-full relative border-none">
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
          <img
            id="zjr_img"
            style="display: none; z-index: 9"
            class="w-full h-full"
          />
        </div>
      </div>

      <!-- 小视频区域 -->
      <div
        id="video-grid"
        class="box-border grid w-[20%] items-center justify-center z-10"
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
        <div style="width: 5rem" class="toolbar_btn" id="mic_foot_btn">
          <div class="svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-maikefeng"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">麦克风</span>
        </div>
        <div style="width: 5rem" class="toolbar_btn" id="video_foot_btn">
          <div class="svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-xiangji"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">摄像头</span>
        </div>
        <div style="width: 5rem" class="toolbar_btn" id="canyuzhe_foot_btn">
          <div class="svgbox2">
            <svg
              style="font-size: 1.9rem"
              class="icon text-white"
              aria-hidden="true"
            >
              <use xlink:href="#icon-canyuzhe"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">参与者</span>
        </div>
        <div
          style="width: 5rem; display: none"
          class="toolbar_btn"
          id="fayanliebiao_foot_btn"
        >
          <div class="relative svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-fayanliebiao"></use>
            </svg>
            <div
              id="fayan_jiaobiao"
              style="display: none"
              class="w-[10px] h-[10px] rounded-full bg-red-600 absolute right-0 top-0"
            ></div>
          </div>
          <span class="mt-1 text-[16px]">发言列表</span>
        </div>
        <div style="width: 5rem" class="toolbar_btn" id="xiaoxi_foot_btn">
          <div class="relative svgbox2">
            <svg
              style="font-size: 1.9rem"
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
        <div
          style="width: 5rem"
          class="toolbar_btn"
          id="shenqingfayan_foot_btn"
        >
          <div class="svgbox2">
            <svg
              style="font-size: 1.5rem"
              class="icon text-white"
              aria-hidden="true"
            >
              <use xlink:href="#icon-shenqingfayan"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">申请发言</span>
        </div>
        <div
          style="width: 5rem; display: none"
          class="toolbar_btn"
          id="guanbimaikefeng_foot_btn"
        >
          <div class="svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-guanbimaikefeng"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">全部静音</span>
        </div>
        <div
          style="width: 5rem; display: none"
          class="toolbar_btn"
          id="wuzhujiangren_foot_btn"
        >
          <div class="svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-quxiaozhujiangren"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">无主讲人</span>
        </div>
        <div
          style="width: 5rem; display: none"
          class="toolbar_btn"
          id="qiehuanmoshi_foot_btn"
        >
          <div class="svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-qiehuanmoshi"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">切换模式</span>
        </div>
        <div
          style="width: 5rem; display: none"
          class="toolbar_btn"
          id="shangyiye_foot_btn"
        >
          <div class="svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-shangyiye"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">上一页</span>
        </div>
        <div
          style="width: 5rem; display: none"
          class="toolbar_btn"
          id="xiayiye_foot_btn"
        >
          <div class="svgbox2">
            <svg class="icon text-[1.7rem] text-white" aria-hidden="true">
              <use xlink:href="#icon-xiayiye"></use>
            </svg>
          </div>
          <span class="mt-1 text-[16px]">下一页</span>
        </div>
      </div>
    </footer>
    <!-- 切换视图
      遮罩 -->
    <div id="qiehuanshitu_mianban" style="display: none">
      <!-- 切换视图卡片 -->
      <div class="device-testing-card" style="width: 32%; height: 28%">
        <!-- 切换视图面板 -->
        <div
          id="qiehuanshitu_content"
          class="device-testing-prepare p-2 h-full flex flex-col justify-center items-center"
        >
          <div
            class="text-[30px] h-[15%] flex justify-center items-center w-full"
          >
            切换模式
          </div>
          <div class="flex justify-center items-center h-[85%] w-full">
            <div class="shitubox" id="qiehuandashipin_btn">
              <img class="w-[150px]" src="./img/views/da.png" alt="" />
              <div class="text-[20px] mt-2">主讲人</div>
            </div>
            <div class="shitubox" id="qiehuanchangguishipin_btn">
              <img class="w-[150px]" src="./img/views/changgui.png" alt="" />
              <div class="text-[20px] mt-2">主讲人+小视频</div>
            </div>
            <div class="shitubox" id="qiehuanxiaoshipin_btn">
              <img class="w-[150px]" src="./img/views/xiao.png" alt="" />
              <div class="text-[20px] mt-2">小视频</div>
            </div>
          </div>
        </div>
        <!-- 切换视图关闭按钮 -->
        <div id="qiehuanshitu_close_btn" class="device-testing-close-btn">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-closeIcon"></use>
          </svg>
        </div>
      </div>
    </div>

    <!-- 成员列表 -->
    <div
      id="yonghuliebiao"
      class="modalbox"
      style="justify-content: center !important; display: none"
    >
      <div class="modalbox-title">
        <div></div>
        <div class="canyuzhe-title">参与者列表</div>
        <div class="box-close" style="margin-right: 5%">X</div>
      </div>
      <div
        id="member-list"
        class="col-div w-[100%] text-[0.875rem] h-[93%] p-1 overflow-y-scroll overscroll-contain text-white"
      >
        <!-- 成员列表成员模板 -->
        <div
          id="member-me"
          style="display: none; justify-content: space-between"
          class="flex border-b-283240 border-b-[1px] w-full h-[3.5rem]"
        >
          <div
            class="member-id ml-2 flex justify-center items-center"
            style="color: #7c7f85"
          >
            user_7157526(我)
          </div>
          <div
            class="row-div flex h-full justify-c enter items-center mr-5 member-right"
          >
            <img
              class="video_member_btn"
              style="height: 1.5rem"
              src="./img/camera-on.png"
            />
            <img
              class="audio_member_btn ml-[0.8rem]"
              style="height: 1.5rem"
              src="./img/mic-on.png"
            />
            <svg
              class="faxiaoxi_member_btn icon text-[1.6rem] text-[#bfbfbf] ml-[0.8rem]"
              aria-hidden="true"
            >
              <use xlink:href="#icon-faxiaoxi"></use>
            </svg>
            <svg
              class="tidiao_btn icon text-[1.6rem] text-[#bfbfbf] ml-[0.8rem]"
              aria-hidden="true"
            >
              <use xlink:href="#icon-tidiao"></use>
            </svg>
            <div
              style="box-shadow: none"
              class="shezhizhujiangren_member_btn anniubeijing pl-[1rem] pr-[1rem] h-[50%] ml-[0.8rem] text-white flex justify-center items-center"
            >
              设置主讲人
            </div>
            <div
              style="box-shadow: none"
              class="quxiaozhujiangren_member_btn anniubeijing pl-[1rem] pr-[1rem] h-[50%] ml-[0.8rem] text-white flex justify-center items-center"
            >
              取消主讲人
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申请发言列表 -->
    <div id="shenqingfayanliebiao" style="display: none" class="modalbox">
      <div class="modalbox-title">
        <div></div>
        <div>申请发言列表</div>
        <div class="box-close" style="margin-right: 5%">X</div>
      </div>
      <div
        id="speakerList"
        class="flex flex-col h-[93%] overflow-y-scroll overscroll-contain w-full"
      >
        <!-- 发言人模板 -->
        <div
          id="fayan_muban"
          style="display: none"
          class="border-b-283240 border-b-[1px] flex justify-between w-full h-[3.5rem] items-center text-[0.875rem]"
        >
          <div class="fayanrenxingming text-white" style="margin-left: 1rem">
            发言人姓名
          </div>
          <div
            class="flex h-full justify-center items-center"
            style="margin-right: 1rem"
          >
            <div
              class="yunxufayan pl-[1rem] pr-[1rem] anniubeijing h-[50%] flex justify-center items-center text-white mr-3"
            >
              允许发言
            </div>
            <div
              class="buyunxufayan pl-[1rem] pr-[1rem] anniubeijing h-[50%] flex justify-center items-center text-white"
            >
              拒绝
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div id="xiaoxiliebiao" style="display: none" class="modalbox">
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
              class="message_neirong text-white text-[0.875rem] mt-1 ml-2 mr-2 mb-1 bg-[#2d3549] pl-2 pr-2 min-h-[5.7rem] w-[80%]"
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
                class="message_xingming h-[27%] mb-[3%] w-auto text-white overflow-auto text-[0.675rem]"
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
          style="flex: 0.7"
          class="ml-2 min-w-[15%] text-white flex justify-center items-center whitespace-nowrap overflow-hidden text-ellipsis"
        >
          发向管理员
        </div>
        <input
          id="xiaoxineirong"
          style="flex: 2"
          class="mr-3 h-[50%] pl-2 pr-2 ml-2"
          maxlength="200"
        />
        <div
          id="fasongxiaoxi"
          style="height: 60%; flex: 0.7"
          class="min-w-[15%] anniubeijing h-[50%] mr-2 flex justify-center items-center text-white"
        >
          发送
        </div>
      </div>
    </div>

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
    <script src="./js/device-testing.js"></script>
    <script src="./js/rtc-detection.js"></script>
    <script src="./js/BaseChatHubClient.js"></script>
    <script src="./js/pc/ChatHubClient.js"></script>
    <script src="./js/common-public.js"></script>
    <script src="./js/pc/common.js"></script>
    <script src="./js/pc/rtc-client.js"></script>
    <script src="./js/elementEvent.js"></script>
    <script src="./js/iconfont.js"></script>
    <script src="./js/prohibit.js"></script>
    <script>
      var JsonStr = '<%=JsonStr%>';
      authenticate(JsonStr);
      if (!isPC()) {
        tiaozhuandao('mobile');
      }
    </script>
  </body>
</html>
