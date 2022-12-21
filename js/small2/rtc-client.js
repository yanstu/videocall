// @ts-ignore
class RtcClient {
  constructor(options) {
    this.sdkAppId_ = options.sdkAppId;
    this.userId_ = options.userId;
    this.userSig_ = options.userSig;
    this.roomId_ = options.roomId;

    this.isJoined_ = false;
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

    // 开始监听网咯质量
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

    // 权限判断按钮显示或隐藏
    showOrHide();
  }

  /**
   * 离开房间
   */
  async leave() {
    // 离开房间
    await this.client_.leave();
    this.isJoined_ = false;
    this.client_.enableAudioVolumeEvaluation(-1);
  }

  playVideo(stream, userId) {
    const objectFit =
      getUserInfo(userId) && getUserInfo(userId).AspectRatio > 1
        ? 'contain'
        : 'cover';
    stream.play('box_' + userId, { objectFit, mirror: false });
    stream.on('error', (error) => {
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
        getUserInfo(userId)
          ? getUserInfo(userId).UserName
          : '显示端' + ' 加入了房间'
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
      this.client_.subscribe(remoteStream);
    });

    // 在订阅远程流时触发
    this.client_.on('stream-subscribed', (evt) => {
      const remoteStream = evt.stream;
      const userId = remoteStream.getUserId();
      this.remoteStreams_.push(remoteStream);

      this.playVideo(remoteStream, userId);

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
      remoteStream.stop();
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

  resumeStreams() {
    for (let stream of this.remoteStreams_) {
      stream && stream.resume();
    }
  }

  getUidByStreamId(streamId) {
    for (let [uid, stream] of this.members_) {
      if (stream.getId() == streamId) {
        return uid;
      }
    }
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
    });
  }
}
