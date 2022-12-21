/* eslint-disable require-jsdoc */
/**
 * 设备检测demo
 */
/* global $ TRTC presetting getOS getBrowser cameraId micId */

// 用于记录检测结果，生成检测报告
// has---Device 是否检测到当前系统有---设备
// has---Connect 是否检测到当前浏览器有---连接
let hasCameraDevice = false,
  hasMicDevice = false,
  hasVoiceDevice = false,
  hasCameraConnect,
  hasVoiceConnect,
  hasMicConnect,
  hasNetworkConnect = true;
let cameraTestingResult = {};
let voiceTestingResult = {};
let micTestingResult = {};

// 记录检测步骤，用于关闭时清空弹窗
let completedTestingPageIdList = [];
let curTestingPageId = '';
let testLocalStream = null;
let client = null;
let timeout = null;

let testVolumeLevelTimer = null;

let micPlayer = null;

let isFirstSwitch = true;

let cameraLength = 0,
  micLength = 0;

let cameraDeviceTimer = null,
  micDeviceTimer = null;

// 设备检测tab页签对应的执行方法
const pageCallbackConfig = {
  'camera-testing-body': 'startCameraTesting',
  'voice-testing-body': 'startVoiceTesting',
  'mic-testing-body': 'startMicTesting',
};

// 判断是否为safari浏览器
const isSafari =
  /Safari/.test(navigator.userAgent) &&
  !/Chrome/.test(navigator.userAgent) &&
  !/CriOS/.test(navigator.userAgent) &&
  !/FxiOS/.test(navigator.userAgent) &&
  !/EdgiOS/.test(navigator.userAgent);
const isFirefox = /Firefox/i.test(navigator.userAgent);

/********************************************************************** */

// safari和firefox浏览器上检测不到扬声器设备
const noVoiceDevice = isSafari || isFirefox;
noVoiceDevice && hideVoiceTesting();
/**
 * safari和firefox浏览器中隐藏扬声器相关检测
 */
function hideVoiceTesting() {
  $('#connect-voice').hide();
  $('#device-voice').hide();
  $('#voice-testing').hide();
  $('#voice-report').hide();
  $('#device-mic').addClass('noVoiceDevice');
  $('#mic-testing').addClass('noVoiceDevice');
}

/**
 * 设备检测初始化
 */
async function deviceTestingInit() {
  $('#settingBack-btn').on('click', function () {
    $('#device-testing-prepare').show();
    $('#volumeLevelPanel').hide();
    $('#settingBack-btn').css('visibility', 'hidden');
    $('#maikefengpanel').hide();
  });
  $('#contorl-start').on('click', function () {
    $('#contorl-start').addClass('contorl-disable');
    $('#contorl-end').removeClass('contorl-disable');
    $('#contorl-play').addClass('contorl-disable');
  });
  $('#contorl-end').on('click', function () {
    $('#contorl-start').removeClass('contorl-disable');
    $('#contorl-end').addClass('contorl-disable');
    $('#contorl-play').removeClass('contorl-disable');
  });
  $('#contorl-play').on('click', function () {});

  // 点击【设备检测】文字, 点击 【重新连接】按钮
  $('#device-testing-btn, #connect-again-btn').on('click', () => {
    startDeviceConnect();
  });
  // 连接设备错误icon
  $('#connect-attention-icon').on('mouseover', () => {
    $('#connect-attention-info').show();
  });
  // 连接设备错误icon
  $('#connect-attention-icon').on('mouseout', () => {
    $('#connect-attention-info').hide();
  });
  // 【开始检测】开始设备检测按钮
  $('#start-test-btn').on('click', function () {
    if ($(this).hasClass('start-gray')) return;
    $('#device-testing-prepare').hide();
    $('#device-testing').show();
    startCameraTesting();
  });
  // 摄像头检测失败/成功
  $('#camera-fail, #camera-success').on('click', function () {
    cameraTestingResult.statusResult = $(this).attr('id') === 'camera-success';
    $('#camera-testing-body').hide();

    testLocalStream && testLocalStream.close();
    // safari和firefox浏览器跳过扬声器检测
    noVoiceDevice || isIos() ? startMicTesting() : startVoiceTesting();
  });
  $('#reload').on('click', function () {
    location.reload();
  });
  // 播放器检测失败/成功
  $('#voice-fail, #voice-success').on('click', function () {
    voiceTestingResult.statusResult = $(this).attr('id') === 'voice-success';
    $('#voice-testing-body').hide();
    let audioPlayer = document.querySelector('#audio-player');
    if (!audioPlayer.paused) {
      audioPlayer.pause();
    }
    startMicTesting();
  });
  // 点击【重新测试】按钮
  $('#testing-again').on('click', () => {
    $('#device-testing-report').hide();
    startDeviceConnect();
    completedTestingPageIdList = [];
  });
  // 点击【测试完成】按钮 / 点击关闭图标
  $(
    '#testing-finish, #device-testing-close-btn, #testing-close-btn, #start-test-btn-tc'
  ).on('click', () => {
    finishDeviceTesting();
    rtc.resumeStreams && rtc.resumeStreams();
  });
  // 测试tab页切换
  $('#camera-testing, #voice-testing, #mic-testing').on('click', function () {
    let targetPageId = $(this).attr('id') + '-body';
    if (
      targetPageId !== curTestingPageId &&
      completedTestingPageIdList.indexOf(targetPageId) > -1
    ) {
      $(`#${curTestingPageId}`).hide();
      testLocalStream && testLocalStream.close();
      client && client.leave();
      testVolumeLevelTimer && clearInterval(testVolumeLevelTimer);
      // 停止播放器的音乐
      let audioPlayer = document.querySelector('#audio-player');
      if (!audioPlayer.paused) {
        audioPlayer.pause();
      }
      // 展示要切换的设备检测tab页面
      $(`#${targetPageId}`).show();
      window[pageCallbackConfig[targetPageId]] &&
        window[pageCallbackConfig[targetPageId]]();
    }
  });
  $('#mic-refresh').on('click', async () => {
    await updateMicDeviceList();
  });
  $('#camera-refresh').on('click', async () => {
    await updateCameraDeviceList();
  });
  $('#camera-select').click(function (e) {
    e.preventDefault();
  });
  // 摄像头设备切换
  $('#camera-select').change(async function () {
    let newCameraId = $(this).children('option:selected').val();
    cameraTestingResult.device = {
      label: $(this).children('option:selected').text(),
      deviceId: $(this).children('option:selected').val(),
      kind: 'videoinput',
    };
    if ($('#camera-testing-body').is(':visible')) {
      // 创建本地视频流
      setTimeout(async () => {
        await createLocalVideoStream();
      }, 200);
    }
    if (isAndroid()) {
      let cameraDevices = await TRTC.getCameras();
      if (cameraDevices[0].deviceId == newCameraId) {
        androidCameraIndex = 0;
      } else {
        androidCameraIndex = 1;
      }
    }
    cameraId = newCameraId;
    changeCameraId();
  });
  // 扬声器设备切换
  $('#voice-select').change(async function () {
    let newVoiceId = $(this).children('option:selected').val();
    localStorage.setItem('rtc_voiceId', newVoiceId);
    voiceTestingResult.device = {
      label: $(this).children('option:selected').text(),
      deviceId: $(this).children('option:selected').val(),
      kind: 'audiooutput',
    };
    let audioPlayer = document.querySelector('#audio-player');
    await audioPlayer.setSinkId(newVoiceId);
  });
  // 麦克风设备切换
  $('#mic-select').change(async function () {
    try {
      let newMicID = $(this).children('option:selected').val();
      localStorage.setItem('rtc_micId', newMicID);
      micTestingResult.device = {
        label: $(this).children('option:selected').text(),
        deviceId: $(this).children('option:selected').val(),
        kind: 'audioinput',
      };
      try {
        await testLocalStream.switchDevice('audio', newMicID);
      } catch (error) {}
      micId = newMicID;
      await changeMicId(true);
      micPlayer ? micPlayer.reStart() : (micPlayer = await createAmplifier());
    } catch (error) {
      if (error.toString().includes('Device in use')) {
        layer.alert('麦克风不能使用', {
          skin: 'layui-layer-lan',
          closeBtn: 0,
          anim: 4,
        });
      }
    }
  });

  $('body').on('click', function () {
    $('#device-connect-list').hide();
  });

  // 获取设备信息
  await getDevicesInfo();
  // 初始化设备弹窗信息
  deviceDialogInit();
}

/**
 * 获取设备信息及网络连接信息
 */
async function getDevicesInfo() {
  let cameraList = await TRTC.getCameras();
  let micList = await TRTC.getMicrophones();
  let voiceList = await TRTC.getSpeakers();

  hasCameraDevice = cameraList.length > 0;
  hasMicDevice = micList.length > 0;
  hasVoiceDevice = voiceList.length > 0;

  cameraList.forEach((camera) => {
    if (camera.deviceId.length > 0) {
      hasCameraConnect = true;
    }
  });
  micList.forEach((mic) => {
    if (mic.deviceId.length > 0) {
      hasMicConnect = true;
    }
  });
  // 如果是无法进行扬声器检测的浏览器，设置为true
  if (noVoiceDevice || isIos()) {
    hasVoiceDevice = true;
    hasVoiceConnect = true;
  } else {
    hasVoiceConnect = voiceList.length > 0;
  }
  hasNetworkConnect = navigator.onLine;
}

/**
 * 判断是否展示弹窗
 */
function deviceDialogInit() {
  if (!localStorage.getItem('txy_device_testing')) {
    localStorage.setItem('txy_device_testing', Date.now().toString());
    startDeviceConnect();
  } else {
    // 在首页展示设备连接结果
    let showDeviceStatus = function () {
      $('#device-connect-list').show();
      timeout = setTimeout(() => {
        $('#device-connect-list').hide();
      }, 3000);
      $('#connect-camera').css(
        'color',
        `${hasCameraConnect ? 'green' : 'red'}`
      );
      $('#connect-voice').css('color', `${hasVoiceConnect ? 'green' : 'red'}`);
      $('#connect-mic').css('color', `${hasMicConnect ? 'green' : 'red'}`);
      $('#connect-network').css(
        'color',
        `${hasNetworkConnect ? 'green' : 'red'}`
      );
      if (
        !(
          hasCameraConnect &&
          hasVoiceConnect &&
          hasMicConnect &&
          hasNetworkConnect
        )
      ) {
        $('#device-testing-btn').css('color', 'red');
      } else {
        $('#device-testing-btn').css('color', 'green');
      }
    };
    showDeviceStatus();

    if (!(hasCameraConnect && hasMicConnect)) {
      navigator.mediaDevices
        .getUserMedia({ video: hasCameraDevice, audio: hasMicDevice })
        .then(() => {
          if (hasCameraDevice) hasCameraConnect = true;
          if (hasMicDevice) hasMicConnect = true;
          // 展示连接结果
          showDeviceStatus();
        })
        .catch((err) => {
          handleGetUserMediaError(err);
        });
    }
  }
}

/**
 * 返回设备连接信息
 */
function getDeviceConnectInfo() {
  let connectInfo = '连接出错，请重试';
  // 第一步：浏览器未检测到摄像头/麦克风/扬声器设备的提示
  if (!(hasCameraDevice && hasMicDevice && hasVoiceDevice)) {
    connectInfo = `未检测到${hasCameraDevice ? '' : '【摄像头】'}${
      hasVoiceDevice ? '' : '【扬声器】'
    }${hasMicDevice ? '' : '【麦克风】'}设备，请检查设备连接`;
    return connectInfo;
  }
  ``;
  // 第二步：浏览器未拿到摄像头/麦克风权限的提示
  if (!(hasCameraConnect && hasMicConnect)) {
    connectInfo = hasNetworkConnect
      ? '请允许浏览器及网页访问摄像头/麦克风设备'
      : '请允许浏览器及网页访问摄像头/麦克风设备，并检查网络连接';
    // 显示设备连接失败引导
    $('#connect-attention-container').show();
    $('#connect-attention-info').html(
      '1. 若浏览器弹出提示，请选择“允许”<br>' +
        '2. 若杀毒软件弹出提示，请选择“允许”<br>' +
        '3. 检查系统设置，允许浏览器访问摄像头及麦克风<br>' +
        '4. 检查浏览器设置，允许网页访问摄像头及麦克风<br>' +
        '5. 检查摄像头/麦克风是否正确连接并开启<br>' +
        '6. 尝试重新连接摄像头/麦克风<br>' +
        '7. 尝试重启设备后重新检测'
    );
    return connectInfo;
  }
  // 第三步：浏览器检测未连接网络的提示
  if (!hasNetworkConnect) {
    connectInfo = '网络连接失败，请检查网络连接';
    // 显示设备连接失败引导
    $('#connect-attention-container').show();
    $('#connect-attention-info').html(
      '1. 请检查设备是否联网<br>' +
        '2. 请刷新网页后再次检测<br>' +
        '3. 请尝试更换网络后再次检测'
    );
    return connectInfo;
  }
  return connectInfo;
}

/**
 * 弹窗-设备连接检查
 */
async function startDeviceConnect() {
  // 重新获取连接信息
  await getDevicesInfo();

  // 显示设备检测弹窗
  $('#device-testing-root').fadeIn();
  // 设备检测弹窗-设备连接页
  $('#device-testing-prepare').show();

  curTestingPageId = 'device-testing-prepare';
  initTestingTabTitle();

  // 在设备检测弹窗显示设备连接信息
  let showDeviceConnectInfo = function () {
    if (
      !(
        hasCameraConnect &&
        hasVoiceConnect &&
        hasMicConnect &&
        hasNetworkConnect
      )
    ) {
      $('#device-testing-btn').css('color', 'red');
    } else {
      $('#device-testing-btn').css('color', 'green');
    }
    // 隐藏设备连接失败提示
    $('#connect-attention-container').hide();

    // 设备连接中
    $('#device-loading').show();
    $('#connect-info').text('设备正在连接中，请稍等').css('color', '#cccccc');
    $('#device-camera, #device-voice, #device-mic').removeClass(
      'connect-success connect-fail'
    );
    $('#connect-again-btn').hide();
    $('#start-test-btn').addClass('start-gray').show();

    // 设备连接结束，展示连接结果
    setTimeout(() => {
      $('#device-loading').hide();
      $('#device-camera')
        .removeClass('connect-success connect-fail')
        .addClass(`${hasCameraConnect ? 'connect-success' : 'connect-fail'}`);
      $('#device-voice')
        .removeClass('connect-success connect-fail')
        .addClass(`${hasVoiceConnect ? 'connect-success' : 'connect-fail'}`);
      $('#device-mic')
        .removeClass('connect-success connect-fail')
        .addClass(`${hasMicConnect ? 'connect-success' : 'connect-fail'}`);

      let connectInfo = '';
      // 设备检测结果（包括麦克风检测，摄像头检测，扬声器检测，网络检测）
      const connectResult =
        hasCameraConnect &&
        hasVoiceConnect &&
        hasMicConnect &&
        hasNetworkConnect;
      if (connectResult) {
        $('#connect-info')
          .text('设备及网络连接成功，请开始设备检测')
          .css('color', '#32CD32');
        $('#connect-again-btn').hide();
        $('#start-test-btn').removeClass('start-gray').show();
      } else {
        // 有设备或者网络连接不成功，展示连接失败提示
        connectInfo = getDeviceConnectInfo();
        $('#connect-info').text(connectInfo).css('color', 'red');
        // 切换按钮状态
        $('#start-test-btn').removeClass('start-gray').show();
      }
    }, 2000);
  };
  showDeviceConnectInfo();

  // 如果有设备未连接，唤起请求弹窗
  if (!(hasCameraConnect && hasMicConnect)) {
    navigator.mediaDevices
      .getUserMedia({ video: hasCameraDevice, audio: hasMicDevice })
      .then(() => {
        if (hasCameraDevice) hasCameraConnect = true;
        if (hasMicDevice) hasMicConnect = true;
        // 显示设备连接信息
        showDeviceConnectInfo();
      })
      .catch((err) => {
        handleGetUserMediaError(err);
      });
  }
}

/**
 * 摄像头检测页-检测展示摄像头设备选择列表
 */
async function updateCameraDeviceList() {
  console.log('[updateCameraDeviceList]');
  let cameraDevices = await TRTC.getCameras();

  if (isAndroid() && cameraDevices.length > 2) {
    cameraDevices = [cameraDevices[0], cameraDevices[1]];
  }

  // 清空设备选择列表，重新添加
  $('#camera-select').empty();
  cameraDevices.forEach((camera) => {
    let option = $('<option></option>');
    option.attr('value', camera.deviceId);
    option.html(camera.label);
    option.appendTo('#camera-select');
  });

  // 如果没有检测到设备将显示没有设备的警告
  try {
    deviceIsNormal(!(cameraDevices.length == 0), 'camera');
  } catch (error) {}

  if (cameraDevices.length == 1) {
    const cameraDevice = cameraDevices[0];
    $('#camera-select').val(cameraDevice.deviceId);
    cameraTestingResult.device = cameraDevice;
    cameraId = '';
    await changeCameraId(false);
    return;
  }

  const cameraStorage = localStorage.getItem('rtc_cameraId');
  let cacheCameraDevice = cameraDevices.filter(
    (camera) => camera.deviceId === cameraStorage
  );
  // 如果缓存中的摄像头ID存在于当前摄像头设备列表中，就将当前测试的摄像头ID设置为缓存中的
  if (cacheCameraDevice.length > 0) {
    $('#camera-select').val(cameraStorage);
    cameraTestingResult.device = cacheCameraDevice[0];
    cameraId = cameraStorage;
    await changeCameraId();
    replay();
  } else {
    if (cameraDevices.length == 0) {
      videoHandle(false, meetInfo.CHID);
    } else {
      const cameraDevice = cameraDevices[0];
      $('#camera-select').val(cameraDevice.deviceId);
      cameraTestingResult.device = cameraDevice;
      cameraId = cameraDevice.deviceId;
      await changeCameraId(false);
    }
  }
  function replay() {
    try {
      if (isPC() && rtc.localStream_) {
        try {
          rtc.localStream_.stop();
        } catch (error) {}
        let videoEl = 'box_' + meetInfo.CHID;
        if (ZJRID_ == meetInfo.CHID || roomDetail.SpeakerID == meetInfo.CHID) {
          videoEl = 'zjr_video';
        }
        let objectFit = 'cover';
        if (meetInfo.CHID == ZJRID_) {
          objectFit = objectFitHandle(meetInfo.CHID);
        }
        let failCount = 0;
        async function streamPlay() {
          await rtc.localStream_.play(videoEl, { objectFit, mirror: false });
          if (rtc.localStream_.isPlaying_) {
            if (meetInfo.CHID == meetInfo.CHID && isCamOn) {
              videoHandle(true, meetInfo.CHID);
            }
          } else {
            setTimeout(() => {
              streamPlay();
            }, 100);
          }
        }
        streamPlay();
      }
    } catch (error) {
      console.log('replay', error);
    }
  }
}

/**
 * 摄像头设备测试
 */
async function startCameraTesting() {
  $('#camera-testing-body').show();
  curTestingPageId = 'camera-testing-body';
  $('#camera-testing')
    .removeClass('icon-normal')
    .addClass('icon-blue complete');
  completedTestingPageIdList.push('camera-testing-body');
  completedTestingPageIdList = [...new Set(completedTestingPageIdList)];
  await updateCameraDeviceList();
  // 创建本地视频流
  await createLocalVideoStream();
}

/**
 * 初始化/更新扬声器设备数组
 */
async function updateVoiceDeviceList() {
  // 获取扬声器设备并展示在界面中
  let voiceDevices = await TRTC.getSpeakers();

  $('#voice-select').empty();
  voiceDevices.forEach((voice) => {
    let option = $('<option></option>');
    option.attr('value', voice.deviceId);
    option.html(voice.label);
    option.appendTo('#voice-select');
  });

  const voiceStorage = localStorage.getItem('rtc_voiceId');

  // 如果有用户设备选择缓存，优先使用缓存的deviceId
  let cacheVoiceDevice = voiceDevices.filter(
    (mic) => mic.deviceId === voiceStorage
  );
  if (cacheVoiceDevice.length > 0) {
    $('#voice-select').val(voiceStorage);
    voiceTestingResult.device = cacheVoiceDevice[0];
  } else {
    if (voiceDevices[0]) {
      $('#voice-select').val(voiceDevices[0].deviceId);
      voiceTestingResult.device = voiceDevices[0];
    }
  }
}

/**
 * 播放器设备测试
 */
async function startVoiceTesting() {
  $('#voice-testing-body').show();
  curTestingPageId = 'voice-testing-body';
  $('#voice-testing').removeClass('icon-gray').addClass('icon-blue complete');
  completedTestingPageIdList.push('voice-testing-body');
  completedTestingPageIdList = [...new Set(completedTestingPageIdList)];

  await updateVoiceDeviceList();
}

/**
 * 更新/初始化麦克风设备
 */
async function updateMicDeviceList() {
  console.log('updateMicDeviceList');
  // 展示麦克风设备选择
  let micDevices = await TRTC.getMicrophones();
  if (isPC()) {
    micDevices = micDevices.filter((item) => item.deviceId != 'default');
  }
  // 如果是安卓设备，不允许切换麦克风(切换麦克风存在获取不到音量的情况)，TRTC说的
  if (isAndroid()) {
    micDevices = [].concat(micDevices[0]);
  }

  $('#mic-select').empty();
  micDevices.forEach((mic) => {
    let option = $('<option></option>');
    option.attr('value', mic.deviceId);
    option.html(mic.label);
    option.appendTo('#mic-select');
  });

  // 如果没有检测到设备将显示没有设备的警告
  deviceIsNormal(micDevices.length > 0, 'mic');

  if (micDevices.length == 1) {
    const micDevice = micDevices[0];
    $('#mic-select').val(micDevice.deviceId);
    micTestingResult.device = micDevice;
    micId = '';
    await changeMicId(false);
    return;
  }

  const micStorage = localStorage.getItem('rtc_micId');
  let cacheMicDevice = micDevices.filter((mic) => mic.deviceId === micStorage);
  if (isAndroid() || cacheMicDevice.length === 0) {
    if (micDevices.length == 0) {
      zhezhaozhuangtai('audio', meetInfo.CHID);
    } else {
      const micDevice = micDevices[0];
      $('#mic-select').val(micDevice.deviceId);
      micTestingResult.device = micDevice;
      micId = micDevice.deviceId;
      await changeMicId(false);
    }
  } else {
    $('#mic-select').val(micStorage);
    micTestingResult.device = cacheMicDevice[0];
    micId = micStorage;
    await changeMicId(true);
  }
}

/**
 * 麦克风设备测试
 */
async function startMicTesting() {
  $('#mic-testing-body').show();
  curTestingPageId = 'mic-testing-body';
  $('#mic-testing').removeClass('icon-gray').addClass('icon-blue complete');
  completedTestingPageIdList.push('mic-testing-body');
  completedTestingPageIdList = [...new Set(completedTestingPageIdList)];

  await updateMicDeviceList();

  try {
    initSetAudioVolume();
  } catch (error) {
    console.error('initSetAudioVolume', error);
  }

  micPlayer ? micPlayer.reStart() : (micPlayer = await createAmplifier());

  // 创建本地音频流
  try {
    await createLocalAudioStream();
  } catch (error) {
    console.error('createLocalAudioStream', error);
  }

  // 展示麦克风的声音大小显示
  if ($('#mic-bar-container').children().length === 0) {
    for (let index = 0; index < 28; index++) {
      $('<div></div>').addClass('mic-bar').appendTo('#mic-bar-container');
    }
  }

  // 监听音量，并量化显示出来
  testVolumeLevelTimer = setInterval(() => {
    const volumeNum = testLocalStream.getAudioLevel();
    let num = Math.ceil(28 * volumeNum);
    $('#mic-bar-container').children('.active').removeClass('active');
    for (let i = 0; i < num; i++) {
      $('#mic-bar-container').children().slice(0, i).addClass('active');
    }
  }, 100);

  /**
   * 初始化设置音量大小节点
   */
  function initSetAudioVolume() {
    const value = localStorage.getItem('rtc_volumeLevel')
      ? parseInt(localStorage.getItem('rtc_volumeLevel'))
      : 100;
    const options = {
      elem: '#volumeSizeEl',
      value,
      input: false,
      theme: '#006EFF',
      step: 20,
      showstep: true,
      max: 300,
      setTips: (value) => {
        return value + '%';
      },
      change: (value) => {
        setVolumeLevel(parseInt(value));
      },
    };
    const slider = layui.slider.render(options);
    $('#resetvolumeSizeEl-btn').on('click', () => {
      setVolumeLevel(100);
      initSetAudioVolume();
    });
  }
}

/**
 * * 音量调节并播放
 */
async function createAmplifier() {
  /** @type AudioContext */
  let context = new (window.AudioContext || window.webkitAudioContext)();
  let vstream = await navigator.mediaDevices.getUserMedia({
    audio: {
      deviceId: micId,
    },
  });
  const volumeValue =
    (localStorage.getItem('rtc_volumeLevel')
      ? parseInt(localStorage.getItem('rtc_volumeLevel'))
      : 100) / 100;
  let result = {
    context,
    source: context.createMediaStreamSource(vstream),
    gain: context.createGain(),
    setAmplify: function (multiplier) {
      result.gain.gain.value = multiplier;
    },
    getAmpLevel: function () {
      return result.gain.gain.value;
    },
    reStart: async function () {
      result.source.disconnect(result.gain);
      result.gain.disconnect(context.destination);

      const newVolumeValue =
        (localStorage.getItem('rtc_volumeLevel')
          ? parseInt(localStorage.getItem('rtc_volumeLevel'))
          : 100) / 100;
      vstream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: micId },
      });
      result.source = context.createMediaStreamSource(vstream);
      result.gain = context.createGain();

      result.source.connect(result.gain);
      result.gain.connect(context.destination);
      result.setAmplify(newVolumeValue);
    },
    stop: function () {
      result.setAmplify(0);
    },
  };
  result.source.connect(result.gain);
  result.gain.connect(context.destination);
  result.setAmplify(volumeValue);
  return result;
}

/**
 * 恢复检测页面头部图标的状态
 */
function initTestingTabTitle() {
  ['camera', 'voice', 'mic', 'network'].forEach((item) => {
    $(`#${item}-testing`)
      .removeClass('icon-blue complete')
      .addClass('icon-gray');
  });
}
/**
 * 展示检测报告
 */
function showTestingReport() {
  $('#device-testing').hide();
  $('#device-testing-report').show();
  curTestingPageId = 'device-testing-report';

  // 摄像头检测结果
  $('#camera-name').text(cameraTestingResult.device.label);
  if (cameraTestingResult.statusResult) {
    $('#camera-testing-result').text('正常').css('color', 'green');
  } else {
    $('#camera-testing-result').text('异常').css('color', 'red');
  }

  // 扬声器检测结果(safari和firefox浏览器不显示扬声器检测结果)
  if (!noVoiceDevice) {
    $('#voice-name').text(voiceTestingResult.device.label);
    if (voiceTestingResult.statusResult) {
      $('#voice-testing-result').text('正常').css('color', 'green');
    } else {
      $('#voice-testing-result').text('异常').css('color', 'red');
    }
  }

  // 麦克风检测结果
  $('#mic-name').text(
    micTestingResult.device ? micTestingResult.device.label : ''
  );
  if (micTestingResult.statusResult) {
    $('#mic-testing-result').text('正常').css('color', 'green');
  } else {
    $('#mic-testing-result').text('异常').css('color', 'red');
  }
}

/**
 * 结束设备检测，隐藏设备检测弹窗
 */
function finishDeviceTesting() {
  $('#volumeLevelPanel').hide();
  $('#settingBack-btn').css('visibility', 'hidden');
  $('#device-testing').hide();
  curTestingPageId && $(`#${curTestingPageId}`).hide();
  $('#maikefengpanel').hide();
  $('#contorl-start').removeClass('contorl-disable');
  $('#contorl-end').addClass('contorl-disable');
  $('#contorl-play').addClass('contorl-disable');
  $('#device-testing-root').fadeOut();

  curTestingPageId = '';
  completedTestingPageIdList = [];
  // 停止摄像头/麦克风的流采集并释放摄像头/麦克风设备
  testLocalStream && testLocalStream.close();
  client && client.leave();
  // 停止播放器的音乐
  let audioPlayer = document.querySelector('#audio-player');
  if (!audioPlayer.paused) {
    audioPlayer.pause();
  }
  micPlayer && micPlayer.stop();
  audioPlayer.currentTime = 0;
  testVolumeLevelTimer && clearInterval(testVolumeLevelTimer);
}

/**
 * 监听设备变化
 */
navigator.mediaDevices.ondevicechange = async function (event) {
  let cameras = await TRTC.getCameras();
  if (cameraLength != cameras.length) {
    cameraLength = cameras.length;
    setTimeout(() => {
      updateCameraDeviceList();
    }, 1000);
  }
  let microphones = await TRTC.getMicrophones();
  if (micLength != microphones.length) {
    micLength = microphones.length;
    setTimeout(() => {
      updateMicDeviceList();
    }, 1000);
  }
  // 当前在扬声器检测页
  if (curTestingPageId === 'voice-testing-body') {
    await updateVoiceDeviceList();
    return;
  }
};

/**
 * 它创建一个本地视频流，对其进行初始化，并在页面上播放
 */
async function createLocalVideoStream() {
  testLocalStream && testLocalStream.close();
  testLocalStream = TRTC.createStream({
    audio: false,
    video: true,
    cameraId: cameraTestingResult.device
      ? cameraTestingResult.device.deviceId
      : '',
    mirror: false,
  });
  try {
    await testLocalStream.initialize();
  } catch (error) {
    handleGetUserMediaError(error);
  }
  testLocalStream.play('camera-video', { mirror: false }).catch(() => {
    setTimeout(() => {
      testLocalStream.play('camera-video', { mirror: false });
    }, 100);
  });
}

/**
 * 它创建一个本地流，初始化它，然后在音频容器元素中播放它
 */
async function createLocalAudioStream() {
  testLocalStream && testLocalStream.close();
  testLocalStream = TRTC.createStream({
    audio: true,
    microphoneId: micTestingResult.device
      ? micTestingResult.device.deviceId
      : '',
    video: false,
  });
  try {
    await testLocalStream.initialize();
  } catch (error) {
    handleGetUserMediaError(error);
  }
  testLocalStream.play('audio-container', { mirror: false });
}

/**
 * 处理getUserMedia的错误
 * @param {Error} error
 */
function handleGetUserMediaError(error) {
  let msg = '';
  switch (error.name) {
    case 'NotReadableError':
      // 当系统或浏览器异常的时候，可能会出现此错误，您可能需要引导用户重启电脑/浏览器来尝试恢复。
      msg =
        '暂时无法访问摄像头/麦克风，请确保系统授予当前浏览器摄像头/麦克风权限，并且没有其他应用占用摄像头/麦克风。';
      break;
    case 'NotAllowedError':
      msg = '用户/系统已拒绝授权访问摄像头或麦克风。';
      break;
    case 'NotFoundError':
      // 找不到摄像头或麦克风设备
      msg = '找不到摄像头或麦克风设备。';
      break;
    case 'OverConstrainedError':
      msg =
        '采集属性设置错误，如果您指定了 cameraId/microphoneId，请确保它们是一个有效的非空字符串。';
      break;
    default:
      msg = '初始化本地流时遇到未知错误, 请重试。';
  }
  !版本.显小() && 版本.显主小() && layer.msg(msg);
}
