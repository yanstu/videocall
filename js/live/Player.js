class Player {
  #player = null;
  #playUrl = '';
  container = 'container';

  // https://cloud.tencent.com/document/product/881/30820
  constructor(options) {
    this.#playUrl = options.Url;
    this.initPlayer();
    // 在初始化视频播放器后，sdk会将id改成追加[_html5_api]的名字
    this.container += '_html5_api';
    this.handleEvents();
    setInterval(() => {
      // 不知道为什么手机端突然需要循环play才能保持重连
      this.play();
    }, 1000);
  }

  initPlayer() {
    if (!$(`#${this.container}`).length) {
      this.container = 'container';
      const videoElement = `
      <video  
        style="
          width: 100%;
          height: 100%;
          playsinline
          webkit-playsinline
          x5-playsinline
          object-fit: ${版本.手直() ? 'contain' : 'fill'};
          background-color: #25292f;
        "
        id="${this.container}"
        preload="auto"
      ></video>
      `;
      $('#playerbox').append(videoElement);
    }

    this.#player = TCPlayer(this.container, {
      autoplay: true,
      controls: false,
      controlBar: {
        playToggle: false,
        progressControl: false,
        currentTimeDisplay: false,
        durationDisplay: false,
        timeDivider: false,
        playbackRateMenuButton: false,
        QualitySwitcherMenuButton: false,
      },
      webrtcConfig: {
        connectRetryCount: 999,
        receiveAudio: true,
        showLog: true,
        receiveVideo: true,
      },
    });
    this.#player.src(this.#playUrl);
    this.#player.play();
  }

  handleEvents() {
    this.#player.on('error', (error) => {
      const { code } = error.data;
      // console.error('playerError', error.data);
      switch (code) {
        case -2002:
          if (error.data.source.message == 'Failed to fetch') {
            console.error('断网咯！');
            layer.msg('当前网络已断开');
          }
          break;
        case 14:
        case -2004:
          // 直播未开始或结束，无限重连
          this.initPlayer();
          break;
      }
    });
    this.#player.on('webrtcevent', function (event) {
      // console.log(event);
    });
  }

  /**
   * * 播放以及恢复播放
   */
  play() {
    this.#player.play && this.#player.play();
  }
  /**
   * * 暂停播放
   */
  pause() {
    this.#player.pause && this.#player.pause();
  }
  /**
   * * 进入全屏模式
   */
  requestFullscreen() {
    this.#player.requestFullscreen && this.#player.requestFullscreen();
  }
  /**
   * * 销毁播放器
   */
  dispose() {
    this.#player.dispose && this.#player.dispose();
  }
}
