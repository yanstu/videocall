// @ts-ignore
class RtcClient {
  constructor(options) {
    this.sdkAppId_ = options.sdkAppId;
    this.userId_ = options.userId;
    this.userSig_ = options.userSig;
    this.roomId_ = options.roomId;

    this.isPublished_ = false;
    this.isJoined_ = false;
    this.localStream_ = null;
    this.remoteStreams_ = [];
    this.members_ = new Map();

    // 为RTC创建客户端
    this.client_ = TRTC.createClient({
      mode: 'rtc',
      sdkAppId: this.sdkAppId_,
      userId: this.userId_,
      userSig: this.userSig_,
      enableAutoPlayDialog: false,
    });

    // 开始获取音量
    this.startGetAudioLevel();

    // 开始网络监听
    this.startGetNetworkevel();

    // 客户端监听服务
    this.handleEvents();
  }

  /**
   * 加入房间
   */
  async join() {
    await this.client_.join({
      roomId: parseInt(this.roomId_),
    });
    this.isJoined_ = true;

    const streamConfig = await createStreamConfig(this.userId_);

    this.localStream_ = TRTC.createStream(streamConfig);

    try {
      this.shezhifenbianlv();
      // 初始化本地流
      await this.localStream_.initialize().then(() => {
        this.localStream_.setVideoContentHint('detail');
      });
      this.playVideo(this.localStream_, meetInfo.CHID);
    } catch (error) {
      console.error('无法初始化本地流initialize() ', error);
      videoHandle(false, meetInfo.CHID);
    }

    if (!streamConfig.audio || !streamConfig.video) {
      let timer = setInterval(async () => {
        if (deviceUsable.camera && deviceUsable.mic) {
          clearInterval(timer);
          await this.leave();
          await this.join();
        }
      }, 3000);
    }

    // 权限判断按钮显示或隐藏
    showOrHide();
    micRestore();

    // 判断是否推送
    tuisong();
  }

  /**
   * 离开房间
   */
  async leave() {
    // 确保本地流在离开之前取消发布
    await this.unpublish();
    this.localStream_.stop();
    this.localStream_.close();
    this.localStream_ = null;

    videoHandle(false, meetInfo.CHID);

    // 离开房间
    await this.client_.leave();
    this.isJoined_ = false;
    // 停止获取音量
    this.stopGetAudioLevel();
  }

  /**
   * * 推送
   * @param {boolean} reconection
   */
  async publish(reconection = false) {
    if (this.isPublished_) return;
    try {
      if (!this.localStream_.getIsReadyToPublish()) {
        console.warn('not ready');
        throw 'not ready';
      }
      console.warn('ready for publish');
      await this.client_.publish(this.localStream_).then(() => {
        yinshipintongbu();
      });
      this.playVideo(this.localStream_, meetInfo.CHID);
      setVolumeLevel();
      this.isPublished_ = true;

      // 重连后重新设备设备ID
      if (reconection) {
        await sleep(200);
        await updateCameraDeviceList();
        await updateMicDeviceList();
      }
    } catch (error) {
      this.isPublished_ = false;
      if (JSON.stringify(error).includes('timeout')) {
        location.reload();
      }
      if (JSON.stringify(error).includes('Permission denied')) {
        layer.msg('您拒绝了授权，功能将无法正常使用');
        return;
      }
      rePublishTimer && clearTimeout(rePublishTimer);
      rePublishTimer = setTimeout(async () => {
        console.warn('重新尝试推送');
        if (deviceUsable.camera || deviceUsable.mic) {
          try {
            this.localStream_.stop();
            this.localStream_.close();
          } catch (error) {}
          this.localStream_ = null;
          this.localStream_ = TRTC.createStream(
            await createStreamConfig(this.userId_)
          );
        }
        try {
          this.localStream_.initialize().then(() => {
            this.localStream_.setVideoContentHint('detail');
          });
        } catch (error) {}
        this.publish(true);
      }, 3000);
    }
  }

  /**
   * 取消推送
   */
  async unpublish() {
    if (!this.isPublished_) {
      console.warn('还没有推送过');
      return;
    }
    await this.client_.unpublish(this.localStream_);
    this.isPublished_ = false;
  }

  /**
   * 此功能使本地音频流静音。
   */
  muteLocalAudio() {
    this.localStream_.muteAudio();
  }

  /**
   * 此函数取消本地音频流的静音。
   */
  unmuteLocalAudio() {
    this.localStream_.unmuteAudio();
  }

  /**
   * 此功能使本地视频流静音。
   */
  async muteLocalVideo() {
    this.localStream_.muteVideo();
  }

  /**
   * 该功能用于取消本地视频流的静音。
   */
  async unmuteLocalVideo() {
    this.localStream_.unmuteVideo();
  }

  /**
   * 恢复本地流和所有远程流。
   */
  resumeStreams() {
    this.localStream_ && this.localStream_.resume();
    for (let stream of this.remoteStreams_) {
      stream && stream.resume();
    }
  }

  changeCameraId() {
    return this.localStream_.switchDevice('video', cameraId);
  }

  changeMicId() {
    return this.localStream_.switchDevice('audio', micId);
  }

  // 将用户播放到指定div容器
  async playVideo(stream, userId) {
    let objectFit = 'cover';
    if (userId == ZJRID_) {
      objectFit = objectFitHandle(userId);
    }
    let videoEl = 'box_' + userId;
    if (ZJRID_ == userId || roomDetail.SpeakerID == userId)
      videoEl = 'zjr_video';
    setVideoImg(stream);
    stream.play(videoEl, { objectFit, mirror: false }).then(() => {
      if (userId == meetInfo.CHID && isCamOn) {
        videoHandle(true, userId);
      }
    });
    stream.on('error', async (error) => {
      if (error.getCode() === 0x4043) {
        deviceTestingInit();
        startDeviceConnect();
      }
    });
  }

  /**
   * 客户端监听服务
   */
  handleEvents() {
    this.client_.on('client-banned', () => {
      if (!isHidden()) {
        layer.msg('您已被挤下线', { icon: 2 });
        setTimeout(() => {
          leave();
        }, 1000);
      } else {
        document.addEventListener(
          'visibilitychange',
          () => {
            if (!isHidden()) {
              layer.msg('您已被挤下线', { icon: 2 });
              setTimeout(() => {
                leave();
              }, 1000);
            }
          },
          false
        );
      }
    });

    // 当用户加入房间时触发
    this.client_.on('peer-join', (evt) => {
      const { userId } = evt;
      this.members_.set(userId, null);
      onlineOrOfline(true, userId);
      console.log(
        (getUserInfo(userId) ? getUserInfo(userId).UserName : '显示端') +
          ' 加入了房间'
      );
    });

    // 当远程连接端离开房间时触发
    this.client_.on('peer-leave', (evt) => {
      const { userId } = evt;
      this.members_.delete(userId);
      onlineOrOfline(false, userId);
      console.log(
        (getUserInfo(userId) ? getUserInfo(userId).UserName : '显示端') +
          ' 离开了房间，或者掉线'
      );
    });

    // 推送远程流时触发
    this.client_.on('stream-added', (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      this.members_.set(userId, remoteStream);
      console.log(`${getUserInfo(userId).UserName} 推送远程流`);
      if (
        meet_layout.mode == MEET_MODE.主讲人 &&
        userId != roomDetail.SpeakerID &&
        userId != ZCRID_
      ) {
        this.client_.unsubscribe(remoteStream);
        return;
      }
      this.client_.subscribe(remoteStream);
    });

    // 在订阅远程流时触发
    this.client_.on('stream-subscribed', (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      this.remoteStreams_.push(remoteStream);

      this.playVideo(remoteStream, userId);

      // 如果用户未推送远程流，显示遮罩
      if (!remoteStream) {
        $('#mask_' + userId).show();
        userId == ZJRID_ && $('#zjr_mask').show();
      }

      remoteStream.on('player-state-changed', (event) => {
        console.log(
          `${getUserInfo(userId).UserName} 的 ${
            event.type == 'audio' ? '麦克风' : '摄像头'
          } 状态改变为 ${event.state == 'PAUSED' ? '停止' : '播放'}`
        );
        // 如果能监听到有人恢复播放的通知，说明网络连接已恢复
        if (event.state == 'PLAYING') {
          networkIsDisconnect = false;
        }
        try {
          event.state === 'PAUSED' && this.resumeStreams();
        } catch (error) {}
      });
    });

    // 当远程流被删除时触发，例如：远程用户调用 Client.unpublish()
    /* This code is listening for a stream-removed event. When a stream is removed, it stops the stream
    and removes the stream from the list of remote streams. */
    this.client_.on('stream-removed', (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      const id = remoteStream.getId();
      try {
        remoteStream.stop();
      } catch (error) {}
      this.members_.set(userId, null);
      console.log(`${getUserInfo(userId).UserName} 取消推送远程流`);
      videoHandle(false, userId);
      this.remoteStreams_ = this.remoteStreams_.filter((stream) => {
        return stream.getId() !== id;
      });
    });

    /* This code is listening for a mute-audio event from the client. When it receives the event, it
    calls the audioHandle function with the parameters false and the userId. */
    this.client_.on('mute-audio', ({ userId }) => {
      audioHandle(false, userId);
    });

    /* This code is listening for the "unmute-audio" event and then calling the audioHandle function. */
    this.client_.on('unmute-audio', ({ userId }) => {
      audioHandle(true, userId);
    });

    /* The above code is listening for a mute-video event from the client. When the event is received,
    it calls the videoHandle function with the userId of the user who sent the event. */
    this.client_.on('mute-video', ({ userId }) => {
      videoHandle(false, userId);
    });

    /* Adding an event listener to the client that listens for the "unmute-video" event. When the event
    is triggered, it calls the function videoHandle with the arguments true and userId. */
    this.client_.on('unmute-video', ({ userId }) => {
      videoHandle(true, userId);
    });
  }

  /**
   * 监听音量回调事件，更新每个用户的音量图标
   */
  startGetAudioLevel() {
    this.client_.on('audio-volume', ({ result }) => {
      yinlianghuidiao(result);
    });
    this.client_.enableAudioVolumeEvaluation(300);
  }

  /**
   * 监听自己的网络质量级别，并改变视频画质
   */
  startGetNetworkevel() {
    this.client_.on('network-quality', (event) => {
      wangluohuidiao(event);
      // this.shezhifenbianlv(event.uplinkNetworkQuality);
    });
  }

  /**
   * shezhifenbianlv
   * @param {number?} [uplinkNetworkQuality=2] - 本地用户的上行网络质量。取值范围为1～6的整数，值越小表示网络质量越好。
   * @returns {Promise<void>}
   */
  shezhifenbianlv(uplinkNetworkQuality = NETWORK_QUALITY.较好) {
    if (uplinkNetworkQuality >= NETWORK_QUALITY.差) {
      return 设置分辨率(fenbianlvcanshu(405));
    } else {
      if (roomDetail.SpeakerID == meetInfo.CHID) {
        return 设置分辨率(fenbianlvcanshu(720));
      } else {
        return 设置分辨率(fenbianlvcanshu(405));
      }
    }
  }

  /**
   * 停止获取流音量
   * 此函数停止评估音频电平。
   */
  stopGetAudioLevel() {
    this.client_.enableAudioVolumeEvaluation(-1);
  }
}
