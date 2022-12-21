/**
 * 左下角昵称显示区域模板
 * @param {string} userId - 用户身份
 * @param {string} nickName - 用户名
 * @returns {string} 一个 HTML 字符串。
 */
function userInfoTemplateElement(userId, nickName) {
  var isMobile = 版本.手主小();
  return /*html*/ `<div id="profile_${userId}" style="z-index: 12;" class="absolute ${
    isMobile ? 'top-0' : 'bottom-0'
  } left-0 pl-1 pr-1 w-auto h-7 flex justify-items-center items-center text-center">
                  <!-- 背景遮罩 -->
                  <div class="absolute top-0 left-0 w-full ${
                    isMobile ? 'rounded-br-lg' : 'rounded-tr-lg'
                  } h-full bg-[#000000] ${
    isMobile ? 'opacity-20' : 'opacity-10'
  }"></div>
            <!-- 声音显示 -->
            <div id="mic_main_${userId}" style="margin-left: 5px">
                <div class="flex items-center justify-content-center relative h-5 overflow-hidden">
                  <img class="audio_member_btn h-full" src="./img/mic-on.png">
                  <!-- 音量级别显示 -->
                  <img class="volume-level absolute bottom-0 left-0 w-full" style="height: 0%; overflow: hidden; transition: height .1s ease;" src="./img/mic-green.png">
                </div>
            </div>
            <!-- 昵称显示 -->
            <span class="ml-1 mr-1 nicknamespan" style="color: white;font-size: 0.9rem;">
            ${nickName}
            </span>
          </div>`;
}

/**
 * 视频盒子模板
 * @param {string} userId - 用户身份
 * @param {string} nickName - 用户
 * @returns {string} 一个 HTML 字符串。名
 */
function videoBoxTemplateElement(userId, nickName) {
  return /*html*/ `<div style="display: none;overflow: hidden;" id="box_${userId}" class="${
    版本.手主小()
      ? 'w-[9rem] h-full video-box relative'
      : 'video-box relative border-[#393e4b]'
  }">

      ${
        版本.参主小() || 版本.显主小()
          ? `<img id="img_${userId}" style="display: none;object-fit: cover;" class="w-full h-full" src="" alt="">`
          : ''
      }

      <!-- “摄像头未开启”遮罩模板 -->
      <div id="mask_${userId}" style="z-index: 12" class="mask top-0 left-0 justify-center col-div flex w-full h-full bg-[#24292e] items-center justify-content-center absolute flex-col">
        <img class="h-[40%]" src="./img/camera-gray.png" alt="" />
        <div></div>
      </div>
      
          ${
            版本.手小() && userId != meetInfo.CHID
              ? `
        <!-- 控制是否订阅视频播放的按钮 -->
        <div style="height: 2rem;right: 0.2rem;z-index: 13" id="video_${userId}" class="absolute bottom-0">
          <img src="./img/video-on.png" class="h-full w-auto" />
        </div>
        `
              : ''
          }

    ${userInfoTemplateElement(userId, nickName)}
  </div>`;
}

/**
 * 检测弹窗
 * @returns {string} element
 */
function jiancetanchuangElement() {
  return /*html*/ `
  <div id="device-testing-root" style="display: none">
      <!-- 设备检测卡片 -->
      <div class="device-testing-card">
        <!-- 设备检测准备界面 -->
        <div id="device-testing-prepare" class="device-testing-prepare">
          <div class="testing-title">
            设备连接
          </div>
          <div class="testing-prepare-info">
            设备检测前请务必开放摄像头，麦克风权限
          </div>
          <div class="device-display flex">
            <div id="device-camera" class="device icon-normal connect-success">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-cameraIcon"></use>
              </svg>
            </div>
            <div id="device-voice" class="device icon-normal connect-success">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-voice"></use>
              </svg>
            </div>
            <div id="device-mic" class="device icon-normal connect-success">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-microphone"></use>
              </svg>
            </div>
          </div>
          <div
            id="device-loading"
            class="loading-background"
            style="display: none"
          >
            <div class="device-loading"></div>
          </div>
          <!-- 连接结果提示 -->
          <div class="connect-info">
            <!-- 连接结果 -->
            <div id="connect-info" style="color: rgb(50, 205, 50)">
              设备及网络连接成功，请开始设备检测
            </div>
            <!-- 错误icon及错误解决指引 -->
            <div
              id="connect-attention-container"
              class="connect-attention-container"
              style="display: none"
            >
              <div id="connect-attention-icon" class="connect-attention-icon">
                <svg class="icon" aria-hidden="true">
                  <use xlink:href="#icon-warn"></use>
                </svg>
              </div>
              <div
                id="connect-attention-info"
                class="connect-attention-info"
                style="display: none"
              ></div>
            </div>
          </div>
          <!-- 设备连接页面button -->
          <div class="testing-btn-display flex">
            <div id="start-test-btn" class="test-btn start-test">开始检测</div>
            <div
              id="start-test-btn-tc"
              class="test-btn start-test"
              style="margin-left: 15px"
            >
              关闭
            </div>
          </div>
        </div>
        <!-- 设备检测tab页 -->
        <div id="device-testing" class="device-testing" style="display: none">
          <div class="device-testing-title">
            <div id="camera-testing" class="testing icon-gray">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-cameraIcon"></use>
              </svg>
            </div>
            <div id="voice-testing" class="testing icon-gray">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-voice"></use>
              </svg>
            </div>
            <div id="mic-testing" class="testing icon-gray">
              <svg class="icon" aria-hidden="true">
                <use xlink:href="#icon-microphone"></use>
              </svg>
            </div>
          </div>
          <!-- 设备检测-摄像头检测 -->
          <div
            id="camera-testing-body"
            class="testing-body"
            style="display: none"
          >
            <div class="device-list camera-device-list flex">
              <div class="select-title" style="display: block">摄像头选择</div>
              <div class="select-list" style="display: block">
                <select
                  name="select"
                  id="camera-select"
                  class="device-select"
                ></select>
              </div>
              <div
                id="camera-refresh"
                class="select-title ml-2 !text-blue-500 underline"
                style="display: block"
              >
                刷新
              </div>
            </div>
            <div id="camera-video" class="camera-video"></div>
            <div class="testing-info-container">
              <div class="button-list flex">
                <div id="camera-success" class="success-button">下一步</div>
                <div id="reload" class="success-button">重新尝试</div>
              </div>
            </div>
          </div>
          <!-- 设备检测-播放器检测 -->
          <div
            id="voice-testing-body"
            class="testing-body"
            style="display: none"
          >
            <div class="device-list camera-device-list flex">
              <div class="select-title" style="display: block">扬声器选择</div>
              <div class="select-list" style="display: block">
                <select
                  name="select"
                  id="voice-select"
                  class="device-select"
                ></select>
              </div>
            </div>
            <div class="audio-control">
              <div class="audio-control-info">
                请调高设备音量, 点击播放下面的音频
              </div>
              <audio
                id="audio-player"
                src="https://web.sdk.qcloud.com/trtc/webrtc/assets/bgm-test.mp3"
                controls=""
              ></audio>
            </div>
            <div class="testing-info-container">
              <div class="button-list flex">
                <div id="voice-success" class="success-button">下一步</div>
              </div>
            </div>
          </div>
          <!-- 设备检测-麦克风检测 -->
          <div id="mic-testing-body" class="testing-body" style="display: none">
            <div class="device-list camera-device-list">
              <div class="select-title" style="display: block">麦克风选择</div>
              <div class="select-list" style="display: block">
                <select
                  name="select"
                  id="mic-select"
                  class="device-select"
                ></select>
              </div>
              <div
                id="mic-refresh"
                class="select-title ml-2 !text-blue-500 underline"
                style="display: block"
              >
                刷新
              </div>
            </div>
            <div class="mic-testing-container">
              <div class="mic-testing-info">调节麦克风音量大小</div>
              <div class="volume-size-container">
                <div id="volumeSizeEl"></div>
                <div id="volumeSizeText"></div>
                <div id="resetvolumeSizeEl-btn">重置音量</div>
              </div>
              <div class="volume-tips"> <p>请合理调节音量大小，如果设置过大会有<span style="color: orange;">爆音</span>风险</p></div>
            </div>
            <div class="mic-testing-container">
              <div class="mic-testing-info">对着麦克风说话</div>
              <div id="mic-bar-container" class="mic-bar-container"></div>
              <div id="audio-container"></div>
            </div>
            <div class="testing-info-container">
              <div class="button-list">
                <div id="testing-close-btn" class="test-btn">关闭检测</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 设备检测关闭按钮 -->
        <div id="device-testing-close-btn" class="device-testing-close-btn">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-closeIcon"></use>
          </svg>
        </div>
        <!-- 扩展设置/调试 -->
        <div id="kuozhanshezhi-btn" style="display: none;" class="kuozhanshezhi-btn">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-kuozhanshezhi"></use>
          </svg>
          更多
        </div>
        <!-- 返回按钮 -->
        <div id="settingBack-btn" style="display: none;" class="settingBack-btn">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-settingback"></use>
          </svg>
          返回
        </div>
      </div>
    </div>
  `;
}

/**
 * 展示不支持webRTC的提示
 * @returns {string} element
 */
function buzhichiRTCElement() {
  return /*html*/ `
    <!-- 展示不支持webRTC的提示 -->
      <div
        id="remind-info-container"
        style="justify-content: center; display: none"
      >
        <!-- 提醒用户用可以使用的浏览器打开 -->
        <div id="browser-remind" class="browser-remind">
          <div id="remind-icon" style="width: 100%; font-size: 28px">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-warn"></use>
            </svg>
            <span style="display: inline-block; margin-left: 5px">提示</span>
          </div>
          <div id="remind-info" class="remind-info"></div>
        </div>
      </div>
  `;
}

/**
 * 预加载所有网络图片资源，防止断网后加载不出断网图标图片
 * @returns {string} element
 */
function imgLodingElement() {
  return /*html*/ `
    <!-- 预加载所有网络图片资源，防止断网后加载不出断网图标图片 -->
    <div style="display: none">
      <img src="./img/network/up/network_0.png" alt="" />
      <img src="./img/network/up/network_1.png" alt="" />
      <img src="./img/network/up/network_2.png" alt="" />
      <img src="./img/network/up/network_3.png" alt="" />
      <img src="./img/network/up/network_4.png" alt="" />
      <img src="./img/network/up/network_5.png" alt="" />
      <img src="./img/network/up/network_6.png" alt="" />
      <img src="./img/network/down/network_0.png" alt="" />
      <img src="./img/network/down/network_1.png" alt="" />
      <img src="./img/network/down/network_2.png" alt="" />
      <img src="./img/network/down/network_3.png" alt="" />
      <img src="./img/network/down/network_4.png" alt="" />
      <img src="./img/network/down/network_5.png" alt="" />
      <img src="./img/network/down/network_6.png" alt="" />
      <img src="./img/mic-on.png" alt="" />
      <img src="./img/mic-off.png" alt="" />
      <img src="./lib/layui/css/modules/layer/default/icon.png" alt="" />
    </div>
  `;
}

/**
 * 屏保element
 * @returns {string} element
 */
function pingbaoElement() {
  return /*html*/ `
  <div id="pingbao" style="display: none;">
    <div class="pingbao-beijingtupian"></div>
    <div class="pingbao-container">
      <div class="pingbao-bq">:)</div>
      <div class="pingbao-tips">会议中场休息</div>
      <div class="pingbao-time">2022年04月21日 14:31</div>
      <div onclick="guanbipingbao()" class="goodbtn" id="pingbao-recovery">恢复视频连线</div>
    </div>
  </div>
  `;
}
