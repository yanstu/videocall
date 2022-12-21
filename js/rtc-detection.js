TRTC.Logger.setLogLevel(TRTC.Logger.LogLevel.WARN);
TRTC.Logger.enableUploadLog();

/**
 * TRTC demo提供的支持度检测和替换默认设备id
 */
async function trtcPreliminaryDetection() {
  try {
    rtcDetection();
    // 如果缓存中的相机id现在还存在，则将默认的相机id设置为换为缓存中的
    let cameraStorage = localStorage.getItem('rtc_cameraId');
    let cameraDevices = await TRTC.getCameras();
    if (cameraDevices.length == 0) {
      deviceIsNormal(false, 'camera');
    } else {
      if (cameraStorage) {
        if (isIos()) {
          cameraId = cameraStorage;
        } else if (isAndroid()) {
          // 如果androidCameraIndex不存在或为0，都是前置，是1则为后置
          let 是后置摄像头吗 =
            localStorage.getItem('androidCameraIndex') == '1';
          cameraId = 是后置摄像头吗
            ? cameraDevices[1].deviceId
            : cameraDevices[0].deviceId;
          androidCameraIndex = 是后置摄像头吗 ? 1 : 0;
        } else {
          let currCamera = cameraDevices.find(
            (item) => item.deviceId == cameraStorage
          );
          if (currCamera) {
            cameraId = cameraStorage;
          }
        }
      }
    }
    let micStorage = localStorage.getItem('rtc_cameraId');
    let micDevices = await TRTC.getMicrophones();
    if (micDevices.length == 0) {
      deviceIsNormal(false, 'mic');
    } else {
      if (cameraStorage) {
        let currmic = micDevices.find((item) => item.deviceId == micStorage);
        if (currmic) {
          micId = micStorage;
        }
      }
    }
  } catch (error) {}
}

/**
 * rtc支持度检测
 */
async function rtcDetection() {
  const recommendBrowserInfo = `
  <h3>
    推荐使用 <span style="color: orange">360浏览器</span>、
    <span style="color: orange">谷歌chrome浏览器</span>、
    <span style="color: orange">火狐浏览器</span>、
    <span style="color: orange">微软Edge浏览器</span>
    打开链接
  </h3>
  <br />
  <h3>请勿使用IE浏览器</h3>
  <br />
  <h3>
    360浏览器请启用
    <span style="color: red">极速模式</span>，请勿使用
    <span style="color: red" >兼容模式</span>
  </h3>
  `;
  if (getBrowser().browser === 'IE' || (window.WeixinJSBridge && isPC())) {
    $('#browser-remind').show();
    $('#remind-info').html(recommendBrowserInfo);
    return false;
  }
  // 当前浏览器不支持webRtc
  let checkResult = await TRTC.checkSystemRequirements();
  let deviceDetectionRemindInfo = '';
  let checkDetail = checkResult.detail;
  if (!checkResult.result) {
    // 通过TRTC获取详细不支持的信息
    $('#remind-info-container').show();
    // 查看链接是否符合webRtc限制
    if (
      location.protocol !== 'https:' &&
      location.hostname !== 'localhost' &&
      location.origin !== 'file://'
    ) {
      deviceDetectionRemindInfo =
        '请检查链接, webRTC 支持以下三种环境:<br>' +
        '1) localhost 域<br>' +
        '2) 开启了 HTTPS 的域<br>' +
        '3) 使用 file:/// 协议打开的本地文件';
    } else {
      // 获取当前设备推荐的浏览器信息
      deviceDetectionRemindInfo = recommendBrowserInfo;
      if (!checkDetail.isH264Supported) {
        deviceDetectionRemindInfo =
          '当前浏览器尚未完成H264编码支持，请稍等重试或使用其他推荐浏览器打开链接<br>' +
          deviceDetectionRemindInfo;
      }
    }
    $('#browser-remind').show();
    $('#remind-info').html(deviceDetectionRemindInfo);
    return false;
  }
  return true;
}
