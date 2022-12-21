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

    // 客户端监听服务
    this.handleEvents();
  }

  /**
   * * 创建流
   * @param {TRTC.StreamConfig} config
   */
  async setStream(config) {
    this.localStream_ = TRTC.createStream(config);
    try {
      // 初始化本地流
      await this.localStream_.initialize().then(() => {
        this.localStream_.setVideoContentHint('detail');
      });
      this.localStream_.play('publishBox', { mirror: false });
    } catch (error) {
      console.error('无法初始化本地流initialize() ', error);
    }
  }

  /**
   * 加入房间
   */
  async join() {
    await this.client_.join({
      roomId: parseInt(this.roomId_),
    });
    this.isJoined_ = true;
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
  }

  /**
   * 推送
   */
  async publish() {
    if (this.isPublished_ || !this.isJoined_ || !this.localStream_) return;
    try {
      if (roomDetail.SpeakerID == meetInfo.CHID) {
        设置分辨率(fenbianlvcanshu(720));
      } else {
        设置分辨率(fenbianlvcanshu(405));
      }
      await this.client_.publish(this.localStream_).then(() => {
        yinshipintongbu();
      });
      setVolumeLevel();
      this.isPublished_ = true;
    } catch (error) {
      console.error('推送本地流失败publish()', error);
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
    await this.client_.unpublish(this.localStream_).then((res) => {
      console.log('*****取消推送', res);
    });
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

  changeCameraId() {
    return this.localStream_.switchDevice('video', cameraId);
  }

  changeMicId() {
    return this.localStream_.switchDevice('audio', micId);
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
  }
}
