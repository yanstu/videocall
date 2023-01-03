/**
 * * 解密获取房间信息
 * @param { string } JMStr 密钥
 */
function authenticate(JMStr) {
  // trtc支持度检测
  trtcPreliminaryDetection();

  let data = { JMStr };
  if (版本.显主小() || 版本.显小()) {
    data.LY = 1;
  }

  ajaxMethod('checkJRHYInfo', data, async (res) => {
    if (!res.Data) {
      alert('不存在的会议或链接失效');
      leave();
    }

    meetInfo = res.Data;

    if (meetInfo.IsZCR && isPC() && meetInfo.YE > -500 && meetInfo.YE <= 0) {
      qianfeitixing();
    }

    chclient = new ChatHubClient({ RoomId: meetInfo.RoomId });

    // 切换为测试的sdk信息
    /*const testSdk = async () => {
      await remoteLoadJs('lib/trtc/lib-generate-test-usersig.min.js');
      meetInfo.SDKAppID = '1400683459';
      // @ts-ignore
      const generator = new LibGenerateTestUserSig(
        parseInt(meetInfo.SDKAppID),
        '593f8802e90e1b8980a03c04b6ed800458f7703ccf35f71b475cd9134793cd88',
        604800
      );
      meetInfo.UserSig = generator.genTestUserSig(meetInfo.CHID);
    };
    await testSdk()*/

    rtc = new RtcClient({
      nickName: meetInfo.XM,
      userId: meetInfo.CHID,
      sdkAppId: parseInt(meetInfo.SDKAppID),
      userSig: meetInfo.UserSig,
      roomId: meetInfo.RoomId,
    });

    try {
      WSLLZWinFromJSHelper.SetSPLXInfo(
        meetInfo.RoomId,
        meetInfo.CHID,
        location.href
      );
    } catch (error) {}

    onlineHeartbeat();

    // PC端才展示在线/总人数
    isPC() && initOnlineNumTimer();

    getToken().then((Token) => {
      huoqutuilaliudizhi(Token);
    });
  });

  function getToken() {
    return new Promise((resolve, reject) => {
      $.ajax({
        type: 'post',
        url: 'https://testvideoapi.gzshifang.com:9011/api/Login/Common',
        dataType: 'json',
        async: false,
        cache: true,
        beforeSend: (XMLHttpRequest) => {
          XMLHttpRequest.setRequestHeader(
            'GUID',
            'CC8C51FC2B224D2195E4DCDE8A3B362B'
          );
        },
        success: (res) => {
          if (res.Code != 0) {
            reject();
          } else {
            const { Token } = res.Data;
            resolve(Token);
          }
        },
      });
    });
  }

  /**
   * 获取推拉流地址并创建推拉流客户端
   */
  function huoqutuilaliudizhi(Token) {
    if (isZhuBo() || 版本.桌直() || 版本.手直()) {
      const url =
        apiBaseUrl +
        (isZhuBo() ? 'VideoConference/GetTLUrl' : 'VideoConference/GetLLUrl');
      $.ajax({
        type: 'post',
        url,
        dataType: 'json',
        data: {
          ID: meetInfo.ID,
        },
        async: false,
        cache: true,
        beforeSend: (XMLHttpRequest) => {
          XMLHttpRequest.setRequestHeader('Token', Token);
        },
        success: async (res) => {
          if (isZhuBo()) {
            await remoteLoadJs('./js/live/Pusher.js');
            await remoteLoadJs('./lib/live/TXLivePusher-2.0.2.min.js');
            live = new Pusher({
              Url: res.Data,
            });
          }
          if (版本.直播端()) {
            live = new Player({
              Url: res.Data,
            });
          }
        },
      });
    }
  }

  /**
   * 在线心跳计时器
   */
  function onlineHeartbeat() {
    if (版本.显示端()) return;
    const workerName = `worker${Math.random()}`;
    const worker = new Worker('./js/HeartbeatWorker.js', {
      name: workerName,
    });
    worker.postMessage(meetInfo.CHID);
  }

  function initOnlineNumTimer() {
    onlineNumTimer && clearInterval(onlineNumTimer);
    onlineNumTimer = setInterval(async () => {
      let memberNum = 0;
      if (roomDetail.IsZBMS == MODE_STATE.开启) {
        rtc.members_.forEach((value, key) => {
          if (!key.includes('_ZS')) {
            memberNum++;
          }
        });
      } else {
        /** @type Array<{userId:string}> */
        const trtcuserlist = await rtc.client_.getUserList();
        trtcuserlist.forEach((item) => {
          if (!item.userId.includes('_ZS')) {
            memberNum++;
          }
        });
      }
      $('#onlineNum-zongrenshu').text(roomDetail.UserList.length.toString());
      $('.onlineDiv').attr(
        'title',
        `当前在线人数：${memberNum}\n总人数：${roomDetail.UserList.length}`
      );
      let countUp = new CountUp('onlineNum-zaixian', memberNum, {
        startVal: preOnlineNum,
      });
      !countUp.error && countUp.start();
      preOnlineNum = memberNum;
    }, 3000);
  }
}

/**
 * 欠费提醒
 */
function qianfeitixing() {
  $('section').append(tipsEl());
  function tipsEl() {
    return `
    <div
    id="arrearage-panel"
    style="
      position: absolute;
      left: 0;
      bottom: 38px;
      padding: 5px 13px;
      background: rgba(244, 234, 42, 0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 51;
      color: black;
    "
    >
      <div style="font-size: 1.2rem" id="arrearage-text">
        您已欠费，请及时充值。
      </div>
      <div style="margin-left: 1.5rem" id="arrearage-close">
        <svg style="font-size: 1.3rem" class="icon" aria-hidden="true">
          <use xlink:href="#icon-guanbi"></use>
        </svg>
      </div>
    </div>
    `;
  }
  $('#arrearage-close').on('click', () => {
    removeTips();
  });
  function removeTips() {
    const 动画时长 = 200;
    $('#arrearage-panel').animate(
      { marginLeft: `-${$('#arrearage-panel').width()}px` },
      动画时长
    );
    setTimeout(() => {
      $('#arrearage-panel').remove();
    }, 动画时长);
  }
}

/**
 * 判断麦克风该不该打开
 */
function micRestore() {
  // 还原上一个模式下的设备开关状态
  const preState = preDeviceState.getState();
  // 决定麦克风是该关闭还是开启
  if (roomDetail.AllowOpenMic == MODE_STATE.关闭) {
    if (
      roomDetail.SpeakerID != meetInfo.CHID &&
      !meetInfo.IsZCR &&
      (preState ? !preState.micOn : true)
    ) {
      isMicOn && switchMic({ on: false });
    }
  } else {
    if (isFristStartUp) {
      if (meetInfo.IsZCR) {
        switchMic({ on: preState ? preState.micOn : true });
      } else if (roomDetail.SpeakerID != meetInfo.CHID) {
        isMicOn &&
          (preState ? !preState.micOn : true) &&
          switchMic({ on: false });
      }
      isFristStartUp = false;
    }
  }
  if (roomDetail.SpeakerID == meetInfo.CHID && rtc.localStream_) {
    if (!preState) {
      !isMicOn && switchMic({ on: true });
      !isCamOn && switchVideo({ on: true });
    } else {
      switchMic({ on: preState.micOn });
      switchVideo({ on: preState.camOn });
    }
  }
}

/**
 * 将没有加入trtc房间的用户添加到rtc列表
 * @param {string} userId
 */
function addNotTRTCUser(userId) {
  if (!rtc.members_.has(userId)) {
    rtc.members_.set(userId, null);
  }
}

let 版本 = (() => {
  const pathname = location.pathname.toLowerCase();
  return {
    /**
     * 桌面参会端主讲人加小视频模式、主讲人模式
     * @returns {boolean}
     */
    参主小() {
      return pathname.includes('index.aspx');
    },
    /**
     * 桌面参会端小视频模式
     * @returns {boolean}
     */
    参小() {
      return pathname.includes('small.aspx');
    },
    /**
     * 桌面显示端主讲人加小视频模式、主讲人模式
     * @returns {boolean}
     */
    显主小() {
      return pathname.includes('big.aspx');
    },
    /**
     * 桌面显示端小视频模式
     * @returns {boolean}
     */
    显小() {
      return pathname.includes('small2.aspx');
    },
    /**
     * 手机主讲人加小视频模式、主讲人模式
     * @returns {boolean}
     */
    手主小() {
      return pathname.includes('mobile.aspx');
    },
    /**
     * 手机小视频端
     * @returns {boolean}
     */
    手小() {
      return pathname.includes('ms.aspx');
    },
    /**
     * 桌面直播端
     * @returns {boolean}
     */
    桌直() {
      return pathname.includes('/zb.aspx');
    },
    /**
     * 手机直播端
     * @returns {boolean}
     */
    手直() {
      return pathname.includes('mzb.aspx');
    },
    /**
     * 是否是显示端
     * @returns {boolean}
     */
    显示端() {
      return 版本.显小() || 版本.显主小();
    },
    /**
     * 是否是参会端
     * @returns {boolean}
     */
    参会端() {
      return 版本.参小() || 版本.参主小() || 版本.手小() || 版本.手主小();
    },
    /**
     * 是否是直播端
     * @returns {boolean}
     */
    直播端() {
      return 版本.桌直() || 版本.手直();
    },
  };
})();

/**
 * * 推送还是取消推送
 * * 如果用户是演讲者、主持人，或者用户列表小于25，则发布。否则，取消发布
 */
async function tuisong() {
  if (
    hasMe(meetInfo.CHID) ||
    meetInfo.CHID == roomDetail.SpeakerID ||
    meetInfo.IsZCR ||
    roomDetail.UserList.length <= 25
  ) {
    if (!pingbaoshifoujinru) {
      await rtc.publish();
      yinshipintongbu();
    }
  } else {
    await rtc.unpublish();
  }
}

/**
 * * 查询参会端与展示端当前是否包含该用户
 * @param {string?} userId - 您要检查的用户的用户 ID。
 * @returns {boolean} 一个布尔值。
 */
function hasMe(userId = meetInfo.CHID) {
  layoutCompute();
  const findUser =
    meet_layout.pageUserList.find(
      (user) => user.ID.toLowerCase() == userId.trim().toLowerCase()
    ) ||
    display_layout.pageUserList.find(
      (user) => user.ID.toLowerCase() == userId.trim().toLowerCase()
    );
  return !!findUser;
}

/**
 * * 查询用户信息
 * @param {string?} ID 需要查询的用户id
 * @returns {userInfo} 用户对象
 */
function getUserInfo(ID = meetInfo.CHID) {
  return roomDetail.UserList.find(
    (item) => item.ID.toLowerCase() == ID.trim().toLowerCase()
  );
}

/**
 * * It returns the user information for the user with the specified name.
 * @param {string?} UserName - The name of the user you want to get information about.
 * @returns {userInfo} The user object.
 */
function getUserInfoByName(UserName = meetInfo.XM) {
  return roomDetail.UserList.find(
    (item) => item.UserName.toLowerCase() == UserName.trim().toLowerCase()
  );
}

/**
 * * 它返回数组中具有与 ID 参数匹配的 ID 属性的第一项。
 * @param {string?} ID - 您要获取有关信息的用户的 ID。
 * @returns {userInfo} 数组中与条件匹配的第一项。
 */
function getUserInfoByMeet(ID = meetInfo.CHID) {
  return meet_layout.pageUserList.find(
    (item) => item.ID.toLowerCase() == ID.trim().toLowerCase()
  );
}

/**
 * * 它返回数组中与条件匹配的第一项。
 * @param {string?} ID - 您要获取其信息的用户的 ID。
 * @returns {userInfo} 数组中与条件匹配的第一项。
 */
function getUserInfoByDisplay(ID = meetInfo.CHID) {
  return display_layout.pageUserList.find(
    (item) => item.ID.toLowerCase() == ID.trim().toLowerCase()
  );
}

/**
 * * 离开房间并关闭网页
 */
function leave() {
  chclient.tongjixintiaoTimer && clearInterval(chclient.tongjixintiaoTimer);
  try {
    rtc.leave();
  } catch (error) {}
  let hasPre = false;
  if (window.history.length > 1) hasPre = true;
  function closeWindow() {
    if (window.WeixinJSBridge) {
      window.WeixinJSBridge.call('closeWindow');
    } else {
      if (
        navigator.userAgent.indexOf('Firefox') != -1 ||
        navigator.userAgent.indexOf('Chrome') != -1
      ) {
        window.location.href = 'about:blank';
        window.close();
      } else {
        try {
          window.opener = null;
          window.open('', '_self');
          window.close();
        } catch (error) {
          window.open(location, '_self').close();
        }
      }
    }
    window.top.close();
  }
  hasPre ? window.history.go(0 - (window.history.length - 1)) : closeWindow();
}

/**
 * * 此功能使本地音频流静音。 stream
 */
function muteAudio() {
  isMicOn = false;
  chclient.redis.fasongmaikefengzhuangtai();
  try {
    rtc.muteLocalAudio();
  } catch (error) {}
}

/**
 * * 此函数取消本地音频流的静音。
 */
function unmuteAudio() {
  isMicOn = true;
  chclient.redis.fasongmaikefengzhuangtai();
  try {
    rtc.unmuteLocalAudio();
  } catch (error) {}
}

/**
 * * 此功能使本地视频流静音。
 */
function muteVideo() {
  isCamOn = false;
  chclient.redis.fasongshexiangtouzhuangtai();
  try {
    rtc.muteLocalVideo();
  } catch (error) {}
}

/**
 * * Un此功能使本地视频流静音。
 */
function unmuteVideo() {
  isCamOn = true;
  chclient.redis.fasongshexiangtouzhuangtai();
  try {
    rtc.unmuteLocalVideo();
  } catch (error) {}
}

/**
 * * 防止频繁点击和防止断网点击
 * @param {function} callback - 延迟时间后要执行的功能。
 * @param {number?} [delay=500] - 两个事件之间的最小时间间隔。
 * @returns {function} 接受事件并返回接受回调和延迟的函数的函数。
 */
function clickProof(callback, delay = 500) {
  let pre = 0;
  return function (event) {
    if (networkIsDisconnect || !navigator.onLine) {
      layer.msg('当前网络已断开');
    } else {
      // 节流函数/真正的事件回调函数   this是发生事件的标签
      const current = Date.now();
      if (current - pre > delay) {
        // 只有离上一次调用callback的时间差大于delay
        // 调用真正处理事件的函数, this是事件源, 参数是event
        callback.call(this, event);
        // 记录此次调用的时间
        pre = current;
      } else {
        layer.msg('请勿频繁操作');
      }
    }
  };
}

/**
 * * 通过缓存更新所有用户麦克风摄像头的状态
 * @param {state[]} stateList - 状态列表
 */
async function gengxinzhuangtaiByCache(stateList) {
  const zjrid =
    roomDetail.SpeakerID || (版本.显主小() ? ZCRID_ : meetInfo.CHID);
  const trtcuserlist = await rtc.client_.getUserList();
  rtc.members_.forEach((value, key) => {
    const UserID = key;
    const userState = stateList.find((item) => item.UserID == UserID);
    if (!userState || !getUserInfo(UserID)) return;
    let { CameraState, MicState } = userState;

    const remoteStrame = rtc.members_.get(UserID);
    if (zjrid != UserID) $('#img_' + UserID).hide();
    videoHandle(
      UserID != meetInfo.CHID
        ? CameraState != DEVICE_STATE.错误
          ? CameraState == DEVICE_STATE.开启
          : false
        : isCamOn,
      UserID,
      true
    );
    audioHandle(
      UserID != meetInfo.CHID
        ? MicState != DEVICE_STATE.错误
          ? MicState == DEVICE_STATE.开启
          : false
        : isMicOn,
      UserID,
      true
    );
    if (版本.手小() && remoteStrame && !remoteStrame.isSubscribed) {
      videoHandle(false, UserID, true);
    }

    if (CameraState == DEVICE_STATE.错误) {
      xiugaicanyuzheshexiangtou('error', UserID);
    }
    if (MicState == DEVICE_STATE.错误) {
      xiugaicanyuzhemaikefeng('error', UserID);
      zhezhaozhuangtai('audio', UserID);
    }

    // 显不显示参与者列表中的操作按钮
    const 用户列表操作按钮 = `#member_${UserID} .member-right`;
    let xianshi = false;
    if (roomDetail.IsZBMS == MODE_STATE.开启) {
      xianshi =
        rtc.members_.get(UserID) ||
        CameraState != DEVICE_STATE.开启 ||
        MicState != DEVICE_STATE.开启;
    } else {
      try {
        xianshi = !!trtcuserlist.find((item) => item.userId == UserID);
      } catch (error) {
        // 如果获取TRTC用户列表失败了，将默认True
        xianshi = true;
      }
    }
    if (xianshi) {
      $(用户列表操作按钮).css('display', 'flex');
    } else {
      $(用户列表操作按钮).hide();
    }
  });

  !deviceUsable.camera && videoHandle(false, meetInfo.CHID);
  !deviceUsable.camera && xiugaicanyuzheshexiangtou('error', meetInfo.CHID);
  !deviceUsable.mic && xiugaicanyuzhemaikefeng('error', meetInfo.CHID);
  !deviceUsable.mic && zhezhaozhuangtai('audio', meetInfo.CHID);
}

/**
 * * 如果主讲人是手机端则对主讲人区域处理
 * * 如果用户的纵横比大于1，则设置object-fit为contain，否则设置为cover。
 * @param {string} userId - 用户的标识。
 * @returns {'contain'|'cover'} 返回值是最后评估的表达式的值。
 */
function objectFitHandle(userId) {
  const objectFit =
    getUserInfo(userId) && getUserInfo(userId).AspectRatio > 1
      ? 'contain'
      : 'cover';
  return objectFit;
}

/**
 * * 它按 XUHAO 属性对数据进行排序。
 * @param a - 要比较的第一个项目。
 * @param b - 第二个要比较的对象
 * @returns 表达式 a.XUHAO - b.XUHAO 的值。
 */
function sortData(a, b) {
  return a.XUHAO - b.XUHAO;
}

/**
 * * 获取主讲人的长宽比并
 */
function huoquchangkuanbi() {
  meet_layout.aspectRatio = $('#zjr_video').height() / $('#zjr_video').width();
  chclient.redis.fasongchangkuanbi();
}

/**
 * * 初始化赋值翻页
 */
function initFenye() {
  meet_layout.rows = roomDetail.CHRY_ShowRows;
  meet_layout.cols = roomDetail.CHRY_ShowCols;
  meetInfo.mode = roomDetail.CHDModel.Model;
  meet_layout.pageNo = roomDetail.CHDModel.Page - 1;
  display_layout.pageNo = roomDetail.XSDModel.Page - 1;
  display_layout.mode = roomDetail.XSDModel.Model;
  if (roomDetail.XSDModel.Model != MEET_MODE.小视频) {
    display_layout.cols = roomDetail.CHRY_ShowCols;
    display_layout.rows = roomDetail.CHRY_ShowRows;
  } else {
    const hanglie = parseInt(roomDetail.XSDModel.XSPFormat.split('*')[0]);
    display_layout.cols = hanglie;
    display_layout.rows = hanglie;
  }
}

/**
 * * 跳转封装
 * @param {string} url - 您要重定向到的页面
 */
function tiaozhuandao(url) {
  location.replace(url + '.aspx');
}

/**
 * * 16:9分辨率参数列表
 * @param {number} params - 视频的分辨率。
 * @returns {TRTC.Profile}
 */
function fenbianlvcanshu(params) {
  switch (params) {
    case 405:
      return {
        width: 720, // 视频宽度
        height: 405, // 视频高度
        frameRate: 15, // 帧率
        bitrate: 550, // 比特率 kbps
      };
    case 720:
      return {
        width: 1280, // 视频宽度
        height: 720, // 视频高度
        frameRate: 25, // 帧率
        bitrate: 1250, // 比特率 kbps
      };
  }
}

/**
 * * 它创建一个流配置对象。
 * @param {string} userId - 流的用户 ID。
 * @returns {TRTC.StreamConfig} 配置
 */
async function createStreamConfig(userId) {
  const streamConfig = {
    audio: true,
    video: true,
    cameraId,
    microphoneId: micId,
    userId,
    mirror: false,
  };
  const cam = await TRTC.getCameras();
  const mic = await TRTC.getMicrophones();
  if (cam.length == 0 && mic.length == 0) {
    return streamConfig;
  }
  if (cam.length == 0) {
    streamConfig.video = false;
    delete streamConfig.cameraId;
  }
  if (mic.length == 0) {
    streamConfig.audio = false;
    delete streamConfig.microphoneId;
  }
  return streamConfig;
}

/**
 * * 判断用户是否加入房间，是否在线
 * * 根据用户是否推流
 * @param {string} userId - 您要检查的用户的用户 ID。
 * @returns {boolean} 一个布尔值。
 */
function userIsOnline(userId) {
  if (userId == meetInfo.CHID) {
    return true;
  }
  return !!rtc.members_.get(userId) && !!rtc;
}

/**
 * * 判断用户是否加入过房间
 * * 根据用户心跳
 * @param {string} userId - 您要检查的用户的用户 ID。
 * @returns {boolean} 一个布尔值。
 */
function userIsOnlineByHas(userId) {
  if (userId == meetInfo.CHID) {
    return true;
  }
  return rtc.members_.has(userId) && !!rtc;
}

/**
 * * 判断用户是否加入了TRTC的房间
 * * 根据trtc房间内用户列表
 * @param {string} userId - 您要检查的用户的用户 ID。
 * @returns {Promise<boolean>} 一个布尔值。
 */
async function userIsOnlineByTRTC(userId) {
  if (userId == meetInfo.CHID) {
    return true;
  }
  const trtcuserlist = await rtc.client_.getUserList();
  return !!trtcuserlist.find((item) => item.userId == userId);
}

/**
 * * 用户是否有视频
 * @param {string} userId - 您要检查其音频的用户的用户 ID。
 * @returns {boolean} 一个布尔值。
 */
function userHasVideo(userId = meetInfo.CHID) {
  if (userId == meetInfo.CHID) {
    return (
      rtc.localStream_ && rtc.localStream_.hasVideo() && deviceUsable.camera
    );
  } else {
    var stream = rtc.members_.get(userId);
    if (!stream) {
      return false;
    }
    return stream.hasVideo();
  }
}

/**
 * * 用户是否有音频
 * @param {string} userId - 您要检查其音频的用户的用户 ID。
 * @returns {boolean} 一个布尔值。
 */
function userHasAudio(userId = meetInfo.CHID) {
  if (userId == meetInfo.CHID) {
    return rtc.localStream_ && rtc.localStream_.hasAudio() && deviceUsable.mic;
  } else {
    const userStream = rtc.members_.get(userId);
    if (!userStream) {
      return false;
    }
    return userStream.hasAudio();
  }
}

/**
 * * 如果用户不是扬声器也不是主持人，那么如果用户有本地流，则从本地流中获取音轨并关闭麦克风。
 */
function closeAllMic() {
  if (roomDetail.SpeakerID != meetInfo.CHID && !meetInfo.IsZCR) {
    var audio = rtc.localStream_.getAudioTrack();
    if ((audio && audio.enabled) || isMicOn) {
      switchMic({ on: false });
    }
  }
}

/**
 * * 音视频与缓存中的状态同步
 */
function yinshipintongbu() {
  try {
    if (!isMicOn) {
      muteAudio();
    } else {
      unmuteAudio();
    }
    switchMic({ on: isMicOn });
    audioHandle(isMicOn, meetInfo.CHID);
    if (!isCamOn) {
      muteVideo();
    } else {
      unmuteVideo();
    }
    switchVideo({ on: isCamOn });
    if (userHasVideo(meetInfo.CHID)) {
      videoHandle(isCamOn, meetInfo.CHID);
    }
  } catch (error) {}
}

/**
 * * 监听网络质量回调
 * @param {TRTC.NetworkQuality} event
 */
function wangluohuidiao(event) {
  const networkQualityName = {
    0: '未知',
    1: '极佳',
    2: '较好',
    3: '一般',
    4: '差',
    5: '极差',
    6: '断开',
  };
  $(`#network-down`)
    .attr(
      'src',
      `./img/network/down/network_${
        event.downlinkNetworkQuality == NETWORK_QUALITY.断开 ||
        networkIsDisconnect
          ? NETWORK_QUALITY.断开
          : event.downlinkNetworkQuality
      }.png`
    )
    .attr(
      'title',
      '下行速度：' + networkQualityName[event.downlinkNetworkQuality]
    );
  $(`#network-up`)
    .attr(
      'src',
      `./img/network/up/network_${
        event.uplinkNetworkQuality == NETWORK_QUALITY.断开 ||
        networkIsDisconnect
          ? NETWORK_QUALITY.断开
          : event.uplinkNetworkQuality
      }.png`
    )
    .attr(
      'title',
      '上行速度：' + networkQualityName[event.uplinkNetworkQuality]
    );

  networkIsDisconnect = event.downlinkNetworkQuality == NETWORK_QUALITY.断开;
}

/**
 * * 取消订阅除主讲人和主持人之外的所有流。
 */
async function allUnSubscribe() {
  for (const stream of rtc.remoteStreams_) {
    if (stream.userId_ != roomDetail.SpeakerID && stream.userId_ != ZCRID_) {
      try {
        await stream.stop();
      } catch (error) {}
      await rtc.client_.unsubscribe(stream);
    }
  }
}

/**
 * * 订阅除主讲人和主持人之外的所有流。
 */
async function allSubscribe() {
  const canhuiList = [
    ...display_layout.pageUserList,
    ...meet_layout.pageUserList,
  ];
  let subscribeList = [];
  for (const user of canhuiList) {
    if (!subscribeList.find((item) => item.ID === user.ID)) {
      subscribeList.push(user);
    }
  }
  var userList =
    roomDetail.UserList.length > 25 ? subscribeList : roomDetail.UserList;
  for (const user of userList) {
    let { ID } = user;
    if (ID != roomDetail.SpeakerID && ID != ZCRID_) {
      var stream = rtc.members_.get(ID);
      if (stream) {
        await rtc.client_.subscribe(stream);
      }
    }
  }
}

/**
 * * 切换摄像头ID
 * @param {boolean?=} save [save=true] 是否保存到缓存
 */
async function changeCameraId(save = true) {
  if (!rtc || (!rtc.localStream_ && !rtc.changeCameraId)) {
    console.error('changeCameraId error');
    return;
  }
  try {
    save && localStorage.setItem('rtc_cameraId', cameraId);
    isAndroid() &&
      localStorage.setItem('androidCameraIndex', androidCameraIndex.toString());
    await rtc.changeCameraId();
    console.log('[changeCameraId] 切换摄像头成功');
    // 推测切换摄像头后麦克风应该是开启状态，如果缓存中的麦克风状态为静音，那将同步
    yinshipintongbu();
  } catch (error) {
    if (isPC()) {
      if (JSON.stringify(error).includes('Cannot read properties of null'))
        layer.msg(
          '暂时无法访问摄像头，请确保系统授予当前浏览器摄像头权限，并且没有其他应用占用摄像头。'
        );
      if (JSON.stringify(error).includes('Constraints could be not satisfied'))
        layer.alert(
          `您的浏览器不兼容切换摄像头，请更换浏览器。
          <br>
          推荐使用<谷歌浏览器>、<360极速浏览器>`
        );
    }
    console.error('[changeCameraId] 切换摄像头失败：' + error);
  }
}

/**
 * * 切换麦克风ID
 * @param {boolean?=} save [save=true] 是否保存到缓存
 */
async function changeMicId(save = true) {
  if (!rtc || (!rtc.localStream_ && !rtc.changeMicId)) {
    return;
  }
  try {
    save && localStorage.setItem('rtc_micId', micId);
    await rtc.changeMicId();
    console.log('[changeMicId] 切换麦克风成功');
    yinshipintongbu();
  } catch (error) {
    if (isPC()) {
      if (JSON.stringify(error).includes('Cannot read properties of null'))
        layer.msg(
          '暂时无法访问麦克风，请确保系统授予当前浏览器麦克风权限，并且没有其他应用占用麦克风。'
        );
    }
    console.log('[changeMicId] 切换麦克风失败：' + micId);
  }
}

/**
 * * 该用户是否是主播人员
 * @param {string?} userId
 * @returns {boolean}
 */
function isZhuBo(userId = meetInfo.CHID) {
  return getUserInfo(userId) && getUserInfo(userId).IsZBRY == 1;
}

/**
 * * 参会还是看直播
 */
function canhuihaishikanzhibo() {
  if (roomDetail.IsZBMS == MODE_STATE.关闭) return;
  if (版本.显小() || 版本.显主小() || 版本.手小() || 版本.参小()) return;
  if (existFirstPage() || isZhuBo() || meetInfo.IsZCR) return;
  if (!isPC() && !版本.手直()) {
    tiaozhuandao('mzb');
  }
  if (isPC() && !版本.桌直()) {
    tiaozhuandao('zb');
  }
}

/**
 * * 该用户是否存在参会端第一页
 * @param {string?} userId
 * @returns {boolean}
 */
function existFirstPage(userId = meetInfo.CHID) {
  const pageSize = meet_layout.rows * meet_layout.cols;
  const fitstPageUserList = roomDetail.UserList.slice(0, pageSize);
  const findUser = fitstPageUserList.find((user) => user.ID == userId);
  return !!findUser;
}

/**
 * * 开启中场休息/屏保，进入中场休息页面
 */
function kaiqipingbao() {
  if (
    isZhuBo() ||
    meetInfo.IsZCR ||
    roomDetail.SpeakerID == meetInfo.CHID ||
    roomDetail.ScreenSaverState == MODE_STATE.关闭 ||
    roomDetail.EmblemState == MODE_STATE.开启
  ) {
    pingbaoTimer.count = 0;
    return;
  }
  pingbaoTimer.timer && clearInterval(pingbaoTimer.timer);
  pingbaoTimer.timer = setInterval(() => {
    {
      pingbaoTimer.count++;
      if (pingbaoTimer.count >= pingbaoTimer.time) {
        pingbaoTimer.count = 0;
        jinrupingbao();
        clearInterval(pingbaoTimer.timer);
      }
    }
  }, 1000);

  async function jinrupingbao() {
    pingbaoshifoujinru = true;
    $('#pingbao').fadeIn();
    pingbaoTimeTimer && clearInterval(pingbaoTimeTimer);
    pingbaoTimeTimer = setInterval(() => {
      $('.pingbao-time')[0].innerHTML = getTime();
    }, 1000);
    if (rtc.isJoined_) {
      await rtc.leave();
    }
    if (版本.直播端()) {
      live.dispose();
    }
  }

  function getTime() {
    var dateObj = new Date();
    var year = dateObj.getFullYear(); //年
    var month = dateObj.getMonth() + 1; //月  (注意：月份+1)
    var date = dateObj.getDate(); //日
    var day = dateObj.getDay();
    var weeks = [
      '星期日',
      '星期一',
      '星期二',
      '星期三',
      '星期四',
      '星期五',
      '星期六',
    ];
    var week = weeks[day]; //根据day值，获取星期数组中的星期数。
    var hours = dateObj.getHours(); //小时
    var minutes = dateObj.getMinutes(); //分钟
    var seconds = dateObj.getSeconds(); //秒
    if (month < 10) month = '0' + month;
    if (date < 10) date = '0' + date;
    if (hours < 10) hours = '0' + hours;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;
    var newDate =
      year +
      '年' +
      month +
      '月' +
      date +
      '日&nbsp' +
      hours +
      ':' +
      minutes +
      ':' +
      seconds +
      '&nbsp &nbsp' +
      week;
    return newDate;
  }
}

/**
 * * 关闭屏保
 */
async function guanbipingbao() {
  pingbaoTimer.count = 0;
  pingbaoshifoujinru = false;
  pingbaoTimer.timer && clearInterval(pingbaoTimer.timer);
  $('#pingbao').fadeOut();
  clearInterval(pingbaoTimeTimer);
  if (版本.直播端()) {
    isTuisong();
    live.initPlayer();
  } else {
    if (!rtc.isJoined_ && roomDetail.EmblemState == MODE_STATE.关闭) {
      await rtc.join();
    }
  }
  kaiqipingbao();
}

/**
 * * 订阅远程流集中处理
 * @param {TRTC.RemoteStream} remoteStream
 * @returns {Promise<void>}
 */
async function subscribeHandle(remoteStream) {
  return new Promise((resolve, reject) => {
    rtc.client_
      .subscribe(remoteStream)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error('[subscribeHandle] ', error);
        setTimeout(() => {
          subscribeHandle(remoteStream);
        }, 100);
      });
  });
}

/**
 * * 切换视频开关
 * @param {switchVideoParams} switchVideo
 */
function switchVideo({ on = false, toggle = false }) {
  if (!deviceUsable.camera) return;
  if (toggle) {
    isCamOn ? 关闭() : 开启();
  } else {
    on ? 开启() : 关闭();
  }
  function 关闭() {
    // 切换到关闭摄像头状态
    $('#video_foot_btn svg').html(
      `<use xlink:href="#icon-guanbixiangji"></use>`
    );
    muteVideo();
    videoHandle(false, meetInfo.CHID);
  }
  function 开启() {
    // 切换到打开摄像头状态
    $('#video_foot_btn svg').html(`<use xlink:href="#icon-xiangji"></use>`);
    unmuteVideo();
    videoHandle(true, meetInfo.CHID);
  }
}

/**
 * * 切换麦克风开关
 * @param {switchVideoParams} switchMic
 */
function switchMic({ on = false, toggle = false }) {
  if (toggle) {
    isMicOn ? 关闭() : 开启();
  } else {
    on ? 开启() : 关闭();
  }
  function 关闭() {
    $('#mic_foot_btn svg').html(`<use xlink:href="#icon-jingyin"></use>`);
    muteAudio();
    audioHandle(false, meetInfo.CHID);
  }
  function 开启() {
    $('#mic_foot_btn svg').html(`<use xlink:href="#icon-maikefeng"></use>`);
    unmuteAudio();
    audioHandle(true, meetInfo.CHID);
  }
}

/**
 * * 设置音量大小
 * @param {number?=} value
 */
function setVolumeLevel(value) {
  if (value != 0) {
    value = value || parseInt(localStorage.getItem('rtc_volumeLevel')) || 100;
  }
  localStorage.setItem('rtc_volumeLevel', value.toString());
  if (rtc.localStream_) {
    try {
      rtc.localStream_.setAudioCaptureVolume(value);
      micPlayer && micPlayer.setAmplify(value / 100);
      testLocalStream && testLocalStream.setAudioCaptureVolume(value);
      $('#volumeSizeText').html(value + '%');
    } catch (error) {
      console.error('[setVolumeLevel] ', error);
    }
  }
}

/*let videoStream1 = null;
let videoStream2 = null;
(async () => {
  const streamConfig = await createStreamConfig(meetInfo.CHID);
  videoStream1 = TRTC.createStream(streamConfig);
  try {
    await videoStream1.initialize();
    await videoStream1.setVideoProfile({
      width: 1280,
      height: 720,
      frameRate: 25,
      bitrate: 1500,
    });
  } catch (error) {
    console.log('[设置分辨率] ', error);
  }
  videoStream2 = TRTC.createStream(streamConfig);
  try {
    await videoStream2.initialize();
    await videoStream2.setVideoProfile({
      width: 320,
      height: 180,
      frameRate: 15,
      bitrate: 500,
    });
  } catch (error) {
    console.log('[设置分辨率] ', error);
  }
})();*/

/**
 * 设置分辨率
 * @param {TRTC.Profile} config
 * @returns {Promise<void>}
 */
async function 设置分辨率({
  width, // 视频宽度
  height, // 视频高度
  frameRate, // 帧率
  bitrate, // 比特率 kbps
}) {
  if (pingbaoshifoujinru) return;
  return rtc.localStream_.setVideoProfile({
    width,
    height,
    frameRate,
    bitrate,
  });
  if (正在设置分辨率 || !rtc.localStream_) return;
  正在设置分辨率 = true;
  const 相差 = 100;
  const videoStats = await rtc.client_.getLocalVideoStats();
  const myVideoStats = videoStats[meetInfo.CHID];
  let fromFrameWidth = myVideoStats.frameWidth;
  let fromFrameHeight = myVideoStats.frameHeight;
  if (fromFrameWidth == 0) {
    await rtc.localStream_.setVideoProfile(fenbianlvcanshu(405));
    fromFrameWidth = fenbianlvcanshu(405).width;
    fromFrameHeight = fenbianlvcanshu(405).height;
  }
  if (fromFrameHeight == height) {
    正在设置分辨率 = false;
  }
  let times = 0;
  if (fromFrameHeight > height) {
    times = Math.ceil((fromFrameWidth - width) / 相差);
  } else {
    times = Math.ceil((width - fromFrameWidth) / 相差);
  }
  let changeWidth = fromFrameWidth;
  for (let index = 1; index <= times; index++) {
    if (fromFrameHeight > height) {
      changeWidth -= 相差;
    } else {
      changeWidth += 相差;
    }
    let changeHeight = Math.ceil((9 / 16) * changeWidth);
    if (index == times) {
      changeWidth = width;
      changeHeight = height;
    }
    const config = {
      width: changeWidth,
      height: changeHeight,
      frameRate,
      bitrate,
    };
    await sleep(300);
    try {
      await rtc.localStream_.setVideoProfile(config);
    } catch (error) {}
    if (index == times) {
      正在设置分辨率 = false;
    }
  }
  if (times == 0) {
    正在设置分辨率 = false;
  }
}

/**
 * * 根据用户的姓名获取用户分辨率宽、高
 * @param {string} userName
 */
async function getFblByUserName(userName = meetInfo.XM) {
  let videoState = null;
  if (userName == meetInfo.XM) {
    const videoStats = await rtc.client_.getLocalVideoStats();
    videoState = videoStats[meetInfo.CHID];
  } else {
    const userId = getUserInfoByName(userName).ID;
    const remoteStats = await rtc.client_.getRemoteVideoStats('main');
    Object.keys(remoteStats).forEach((value, key) => {
      if (value == userId) {
        videoState = remoteStats[value];
      }
    });
  }
  videoState &&
    console.log(
      `高：${videoState.frameHeight}    宽：${videoState.frameWidth}`
    );
}

/**
 * 结束会议提示
 */
async function huiyijieshu() {
  $('#pingbao').fadeOut();
  huiyizhunbei({ ready: false });
  chclient.tongjixintiaoTimer && clearInterval(chclient.tongjixintiaoTimer);
  try {
    rtc.leave();
  } catch (error) {}
  chclient.stateListTimer && clearInterval(chclient.stateListTimer);
  rtc.members_.clear();
  for (const user of roomDetail.UserList) {
    await videoHandle(false, user.ID);
    await onlineOrOfline(false, user.ID);
    zhezhaozhuangtai(false, user.ID);
  }
  chclient.stop();

  const 放大动画时长 = 400;

  $('section').append(endMeetEl());
  $('footer').remove();

  $('#huiyijieshu-content').css('height', '0px');
  $('#huiyijieshu-content').css('width', '0px');
  roomDetail.HBBGColor &&
    $('#huiyijieshu-content').css('background', roomDetail.HBBGColor);
  $('#huiyijieshu-content').css('border-radius', '15px');
  if (isPC()) {
    $('.huiyijieshu-content-title').css('font-size', '88px');

    $('#huiyijieshu-content').animate(
      { width: '100%', height: '100%' },
      放大动画时长
    );
    $('#huiyijieshu-content').animate({ borderRadius: '0px' }, 放大动画时长);
  } else {
    $('.huiyijieshu-content-title').css('font-size', '25px');

    $('#huiyijieshu-content').animate(
      { width: '100%', height: '100%' },
      放大动画时长
    );
    $('#huiyijieshu-content').animate({ borderRadius: '0px' }, 放大动画时长);
  }
  function endMeetEl() {
    return /*html*/ `
    <div
      id="huiyijieshu"
      style="
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 998;
      "
    >
      <div
        id="huiyijieshu-content"
        style="
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          background: #0033CC;
        "
      >
        <div class="huiyijieshu-content-title" style="color: #F3F1F1;">
          会议已结束，谢谢大家参与！
        </div>
        <!-- <div 
          class="huiyijieshu-content-leave"
          style="height: 30px; color: #c9645d; "
          onclick="leave()"
        >
          <svg class="icon-tuichu2 icon" aria-hidden="true">
            <use xlink:href="#icon-tuichu2"></use>
          </svg>
          <span>退出会议</span>
        </div> -->
      </div>
    </div>
    `;
  }
}

/**
 * 会议准备完毕，显示会标
 * @param {{ready: boolean}} param0
 */
async function huiyizhunbei({ ready }) {
  await guanbipingbao();
  const 放大动画时长 = 400;
  if (ready) {
    if (isPC()) {
      $('body').append(readyEl());
    } else {
      $('section').append(readyEl());
      $('footer').hide();
    }

    roomDetail.HBBGColor &&
      $('#huiyizhunbei-card').css('background', roomDetail.HBBGColor);
    $('#huiyizhunbei-content').html(roomDetail.HBNR);

    $('#huiyizhunbei-card').css('height', '0%');
    $('#huiyizhunbei-card').css('width', '0%');
    if (isPC()) {
      $('#huiyizhunbei-box').addClass('scale_3');
    }
    $('#huiyizhunbei-card').animate(
      { width: '100%', height: '100%' },
      放大动画时长
    );
    $('#huiyizhunbei-card').animate({ borderRadius: '0px' }, 放大动画时长);
  } else {
    if (isPC()) {
      $('#huiyizhunbei-box').removeClass('scale_3');
      $('#huiyizhunbei-box').addClass('scale_1');
    }
    $('#huiyizhunbei-card').animate(
      { width: '0%', height: '0%' },
      放大动画时长
    );
    $('#huiyizhunbei-card').animate({ borderRadius: '20px' }, 放大动画时长);
    setTimeout(() => {
      $('#huiyizhunbei-root').remove();
      if (!isPC()) {
        $('footer').show();
      }
    }, 放大动画时长);
  }

  function readyEl() {
    return /*html*/ `
    <!-- 全屏div -->
    <div
      id="huiyizhunbei-root"
      style="
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;                
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
      "
    >
      <!-- 提供会标放大动画的div -->
        <div 
          id="huiyizhunbei-card"
          style="
          width: 0%;
          height: 0%;                 
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 20px;
          background: #0033CC;
        "
        >
          <!-- 装会标有固定大小的盒子 -->
          <div id="huiyizhunbei-box" class="scale_transform" style="width: 640px; height: 360px;overflow: hidden;">
            <div id="huiyizhunbei-content">
              <!-- 会标内容区域 -->
            </div>
          </div>
        </div>
    </div>
    `;
  }
}

/**
 * * 参会端切换显示模式
 * * 当用户点击按钮时，该函数会将视频源更改为函数中指定的视频源。
 * @param {meetMode} State - 1 =>主讲人模式，2 =>参会人模式，3 =>小视频模式
 * @param {('主动'|'被动')?=} option
 * @returns {Promise<void>}
 */
function canhuiduan_mode(State, option) {
  const pcEnd = (() => {
    return {
      /**
       * 参会端切换到主讲人+小视频模式
       */
      主加小模式PC() {
        return new Promise(async (resolve, reject) => {
          if (版本.参主小()) {
            allSubscribe();
            await hideXiaoshipin(false);
            meetInfo.IsZCR && hideFanye(false);
          } else {
            option == '被动' && preDeviceState.setState();
            tiaozhuandao('index');
          }
          resolve();
        });
      },
      /**
       * 参会端切换到主讲人模式
       */
      主讲人模式PC() {
        return new Promise(async (resolve, reject) => {
          if (版本.参主小()) {
            await hideXiaoshipin(true);
            allUnSubscribe();
            meetInfo.IsZCR && hideFanye(true);
          } else {
            option == '被动' && preDeviceState.setState();
            tiaozhuandao('index');
          }
          resolve();
        });
      },
      /**
       * 参会端切换到小视频模式
       */
      小视频模式PC() {
        return new Promise(async (resolve, reject) => {
          if (!版本.参小()) {
            option == '被动' && preDeviceState.setState();
            tiaozhuandao('small');
          }
          resolve();
        });
      },
    };
  })();

  const mobileEnd = (() => {
    return {
      /**
       * 手机端切换到小视频模式
       */
      小视频模式手机() {
        return new Promise((resolve, reject) => {
          if (!版本.手小()) {
            option == '被动' && preDeviceState.setState();
            tiaozhuandao('ms');
          }
          resolve();
        });
      },
      /**
       * 手机端切换到主讲人模式或主讲人加小视频模式
       */
      主加小或主讲人模式手机() {
        return new Promise((resolve, reject) => {
          if (!版本.手主小()) {
            option == '被动' && preDeviceState.setState();
            tiaozhuandao('mobile');
          }
          resolve();
        });
      },
    };
  })();

  if (isPC()) {
    switch (State) {
      case MEET_MODE.主讲人:
        return pcEnd.主讲人模式PC();
      case MEET_MODE.主讲人加小视频:
        return pcEnd.主加小模式PC();
      case MEET_MODE.小视频:
        return pcEnd.小视频模式PC();
    }
  } else {
    switch (State) {
      case MEET_MODE.主讲人:
      case MEET_MODE.主讲人加小视频:
        return mobileEnd.主加小或主讲人模式手机();
      case MEET_MODE.小视频:
        return mobileEnd.小视频模式手机();
    }
  }
}

/**
 * * 展示端切换显示模式
 * @param {meetMode} state - 1 = 主讲人模式，2 = 主讲人 + 小视频模式，3 = 小视频模式
 */
async function zhanshiduan_mode(state) {
  display_layout.mode = state;
  switch (state) {
    // 展示端切换到主讲人模式
    case 1:
      display_layout.rows = roomDetail.CHRY_ShowRows;
      display_layout.cols = roomDetail.CHRY_ShowCols;
      if (版本.显主小()) {
        allUnSubscribe();
        await hideXiaoshipin(true);
        hideToolBar(true);
      } else {
        tiaozhuandao('big');
      }
      break;
    // 展示端切换到主讲人+小视频模式
    case 2:
      display_layout.rows = roomDetail.CHRY_ShowRows;
      display_layout.cols = roomDetail.CHRY_ShowCols;
      if (版本.显主小()) {
        await hideXiaoshipin(false);
        hideToolBar(false);
        allSubscribe();
      } else {
        tiaozhuandao('big');
      }
      break;
    // 展示端切换到小视频模式
    case 3:
      if (!版本.显小()) {
        tiaozhuandao('small2');
      }
      break;
  }
}

/**
 * 上一个模式下的设备开启关闭状态
 * @returns {object|null}
 */
const preDeviceState = (() => {
  const storageKey = 'preDeviceState';
  return {
    setState() {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          timestamp: Math.floor(new Date().getTime() / 1000),
          micOn: isMicOn,
          camOn: isCamOn,
        })
      );
    },
    /**
     * 上一次的设备状态
     * @returns {preDeviceStateData}
     */
    getState() {
      let preDeviceStateData = JSON.parse(localStorage.getItem(storageKey));
      const 相差多少秒 = 20;
      if (!preDeviceStateData) {
        return null;
      }
      let nowTime = Math.floor(new Date().getTime() / 1000);
      if (nowTime > preDeviceStateData.timestamp + 相差多少秒) {
        return null;
      }
      return preDeviceStateData;
    },
  };
})();

/**
 * 房间状态不正常的处理
 */
function roomIsAbnormal() {
  roomDetail.UserList.length == 0 && location.reload();
  if (!getUserInfo()) {
    layer.alert('您已被强制退出视频连线', { icon: 2 });
    setTimeout(() => {
      leave();
    }, 1000);
  }
  if (!roomDetail.CHDModel || !roomDetail.CHDModel.Model) {
    alert('房间状态异常');
  }
}
