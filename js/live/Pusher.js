// @ts-ignore
class Pusher {
  pusher = null;
  #pushUrl = null;

  // https://cloud.tencent.com/document/product/454/56500

  constructor(options) {
    this.pusher = new TXLivePusher();
    this.#pushUrl = options.Url;
    this.initPusher();
    // 客户端监听服务
    this.handleEvents();
  }

  initPusher() {
    // this.pusher.setRenderView('renderView')
    // 屏幕的分辨率
    const width = Math.floor(window.screen.width * window.devicePixelRatio);
    const height = Math.floor(window.screen.height * window.devicePixelRatio);
    // 设置视频的分辨率
    this.pusher.setProperty('setVideoResolution', {
      width,
      height,
    });
    // 设置视频的帧率
    this.pusher.setProperty('setVideoFPS', 30);
    // 设置视频的码率
    this.pusher.setProperty('setVideoBitrate', 8000);
    // 设置音频的采样率
    // this.pusher.setProperty('setAudioSampleRate', 44100)
    // 设置音频的码率
    // this.pusher.setProperty('setAudioBitrate', 200)
    // 设置视频的码率
    // this.pusher.setProperty('setVideoBitrate', 8000);
    // 设置连接重试次数
    this.pusher.setProperty('setConnectRetryCount', 3);

    // 必须取消这三项
    // 启用回声消除
    this.pusher.setProperty('enableAudioAEC', false);
    // 启用自动增益
    this.pusher.setProperty('enableAudioAGC', false);
    // 启用噪声抑制
    this.pusher.setProperty('enableAudioANS', false);

    // 设置画质优先
    this.pusher.setVideoContentHint('detail');

    const audioEffectManager = this.pusher.getAudioEffectManager();
    audioEffectManager.setVolume(100);
  }

  /**
   * 开始发起直播
   */
  start() {
    if (this.isPushing()) return;

    this.pusher
      .startScreenCapture(true)
      .then(() => {
        hideHeaderAndToolBar(true);
        this.stopPush();
        this.pusher.startPush(this.#pushUrl).then(() => {
          layer.msg('开始推送直播', { icon: 6 });
        });
      })
      .catch((err) => {
        console.error('startScreenCapture----', err);
        if (JSON.stringify(err).includes('Permission denied')) {
          layer.msg('取消了直播', { icon: 2 });
        }
      });
  }

  /**
   * * 停止推送音视频数据，关闭 WebRTC 连接
   */
  async stopPush() {
    await this.pusher.stopPush();
  }

  /**
   * 查询当前推流器是否正在推流中
   * @returns {boolean}
   */
  isPushing() {
    return this.pusher.isPushing();
  }

  /**
   * * 关闭屏幕采集
   */
  async stopScreenCapture() {
    await this.pusher.stopScreenCapture();
  }

  /**
   * * 离开页面或者退出时，清理 SDK 实例，避免可能会产生的内存泄露，调用前先执行 stop 方法
   */
  destroy() {
    hideHeaderAndToolBar(false);
    this.pusher.destroy();
  }

  /**
   * 事件监听处理
   */
  handleEvents() {
    this.pusher.setObserver({
      // 直播推流器错误通知，推流器出现错误时，会回调该通知。
      onError: (code, msg) => {
        hideHeaderAndToolBar(false);
        layer.msg('出错了', { icon: 2 });
        console.error('onError----', code, msg);
        if (code == '-2') {
          this.stopPush();
          this.stopScreenCapture();
        }
      },
      // 直播推流器警告通知。
      onWarning: (code, msg) => {
        hideHeaderAndToolBar(false);
        console.error('onWarning----', code, msg);
        // 屏幕录制被中断（Chrome 浏览器单击自带的停止共享按钮）
        if (code == '-1007') {
          layer.msg('停止了直播', { icon: 2 });
          this.stopPush();
          this.stopScreenCapture();
        }
      },
      // 推流统计数据
      onStatisticsUpdate: (data) => {
        // https://webrtc-demo.myqcloud.com/push-sdk/v2/docs/TXLivePusher.html#~onStatisticsUpdate
        data.audio.bitrate > 1300 && console.log('音频：', data.audio);
      },
    });
  }
}
