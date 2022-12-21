// https://docs.microsoft.com/zh-cn/javascript/api/@microsoft/signalr
class BaseChatHubClient {
  /** signalr实例 */
  chatHub = null;
  #RoomId = 0;
  /** 获取用户列表状态定时器 */
  stateListTimer = null;
  /** 获取主讲人定时器 */
  getZJRTimer = null;
  /** 展示端心跳计时器 */
  zhanshixintiaoTimer = null;
  /** 统计费用、心跳连接计时器 */
  tongjixintiaoTimer = null;

  constructor({ RoomId }) {
    this.#RoomId = RoomId;
    if (window.signalR) {
      this.chatHub = new window.signalR.HubConnectionBuilder()
        .withUrl(hubsUrl)
        .build();
    }

    if (!this.chatHub || !window.signalR) {
      alert('请检查服务端是否启动');
      setTimeout(() => {
        location.reload();
      }, 2000);
      return;
    }

    this.handleEvents();
  }

  /**
   * * chathub连接成功、重连成功后的执行函数
   * @function
   */
  chatHubConnectedCallback() {}

  /**
   * * 收听广播的处理
   * @param {redisData} mess mssage
   * @param {number} channelss 通道
   * @function
   */
  broadcastMessage(mess, channelss) {}

  /**
   * * 连接chathub
   * * 执行回调chatHubConnectedCallback
   * @function
   */
  startChathub() {
    this.chatHub
      .start()
      .then(() => {
        this.chatHub.invoke('createRedis', this.#RoomId);
        this.redis.xintiaolianjie();
        this.chatHubConnectedCallback();
      })
      .catch((error) => {
        console.error('[startChathub] 断网了，没法重连...', error);
      });
  }

  /**
   * 调用signalr断开连接，并且不再重连
   */
  stop() {
    try {
      this.chatHub.connection.stop();
    } catch (error) {}
    isManualOperation = true;
  }

  /**
   * * 发布redis消息
   * @param {redisData} data
   */
  redisFB(data) {
    this.chatHub
      .invoke('redisFB', this.#RoomId, JSON.stringify(data))
      .catch(() => {
        if (this.chatHub.state == 'Disconnected' && !isManualOperation) {
          console.warn('[redisFB] 网络断开了，没法发消息，尝试重新连接！');
          this.reConnect();
        }
      });
  }

  /**
   * * chathub重连
   */
  reConnect() {
    console.log('[reConnect] 断开尝试重新连接！');
    this.startChathub();
  }

  /**
   * * 定时获取主讲人
   * @param {function} callback
   */
  huoquzhujiangren(callback) {
    return;
    this.getZJRTimer && clearInterval(this.getZJRTimer);
    this.getZJRTimer = setInterval(() => {
      $.post(
        '/Handler/RedisHandler.ashx',
        { Infotype: 'GetInfo', RoomId: this.#RoomId },
        (res) => {
          if (res == 'GetInfo访问出错！') {
            return;
          }
          if (localStorage.getItem('ZJRID') != res) {
            localStorage.setItem('ZJRID', res);
            if (res != roomDetail.SpeakerID) {
              roomDetail.SpeakerID = res;
              roomDetail.SpeakerName = getUserInfo(res)
                ? getUserInfo(res).UserName
                : '';
              callback();
            }
          }
        }
      );
    }, 5 * 1000);
  }

  /**
   * * 展示端心跳连接
   */
  zhanshiduanxintiao() {
    this.zhanshixintiaoTimer && clearInterval(this.zhanshixintiaoTimer);
    this.zhanshixintiaoTimer = setInterval(() => {
      ajaxMethod('LoginHandler', { type: 'Heartbeat' }, (res) => {
        if (res.Code != 0) console.error('[zhanshiduanxintiao] 展示端心跳掉线');
      });
    }, 1000 * 60 * 1);
  }

  /**
   * 客户端监听服务
   */
  handleEvents() {
    // 断开后处理
    this.chatHub.connection.onclose(() => {
      this.reConnect();
    });
    // https://docs.microsoft.com/zh-cn/javascript/api/@microsoft/signalr/hubconnection?view=signalr-js-latest#@microsoft-signalr-hubconnection-on
    this.chatHub.on('broadcastMessage', (message, channelss) => {
      if (channelss == meetInfo.RoomId) {
        // console.log(JSON.parse(message));
      }
      this.broadcastMessage(JSON.parse(message), channelss);
    });
    // 连接成功重新连接时将调用的处理程序
    this.chatHub.onreconnected(() => {
      console.log('[onreconnected] 重新连接连接成功~！');
    });
  }

  redis = {
    /**
     * * 发送自己的麦克风状态
     * @function
     */
    fasongmaikefengzhuangtai: () => {
      this.redisFB({
        reCode: '06',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: isMicOn ? 1 : 0,
      });
    },

    /**
     * * 发送自己的摄像头状态
     * @function
     */
    fasongshexiangtouzhuangtai: () => {
      this.redisFB({
        reCode: '05',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: isCamOn ? 1 : 0,
      });
    },

    /**
     * * 向redis发布申请发言人
     * @function
     */
    shenqingfayan: () => {
      this.redisFB({
        reCode: '10',
        ReUserid: meetInfo.CHID,
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {},
      });
    },

    /**
     * * 发送消息
     * @function
     * @param {string} Content
     */
    fasongxiaoxi: (Content = $('#xiaoxineirong').val().toString()) => {
      this.redisFB({
        reCode: meetInfo.IsZCR ? '08' : '09',
        ReUserid: meetInfo.IsZCR ? fasonggeishei || '' : ZCRID_,
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content,
        Data: {},
      });
      $('#xiaoxineirong').val('');
    },

    /**
     * * 设置主讲人
     * @function
     * @param {string} ReUserid
     */
    shezhizhujiangren: (ReUserid) => {
      this.redisFB({
        reCode: '01',
        ReUserid,
        ReUserQYBH: '',
        ReUserName: getUserInfo(ReUserid).UserName,
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {},
      });
    },

    /**
     * * 取消主讲人
     * @function
     */
    quxiaozhujiangren: () => {
      this.redisFB({
        reCode: '29',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: ZCRID_,
        SendUserName: getUserInfo(ZCRID_).UserName,
        Content: '',
        Data: {
          State: '',
        },
      });
    },

    /**
     * * 允许发言
     * @function
     * @param {string} ReUserid
     */
    yunxufayan: (ReUserid) => {
      this.redisFB({
        reCode: '18',
        ReUserid,
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {
          State: 1,
        },
      });
    },

    /**
     * * 关闭所有人麦克风
     * @function
     */
    guanbisuoyourenmaifekeng: () => {
      this.redisFB({
        reCode: '03',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {},
      });
    },

    /**
     * * 踢掉某人
     * @function
     * @param {string} ReUserid
     */
    tidiao: (ReUserid) => {
      this.redisFB({
        reCode: '07',
        ReUserid,
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {},
      });
    },

    /**
     * * 切换参会端模式
     * @function
     * @param {number} mode
     */
    qiehuancanhuimoshi: (mode) => {
      this.redisFB({
        reCode: '35',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {
          State: mode,
        },
      });
    },

    /**
     * * 获取用户列表，以更新状态
     * @function
     **/
    huoquyonghuzhuangtai: () => {
      const func = () => {
        this.redisFB({
          reCode: '40',
          ReUserid: '',
          ReUserQYBH: '',
          ReUserName: '',
          SendUserID: meetInfo.CHID,
          SendUserName: meetInfo.XM,
          Content: '',
          Data: {},
        });
      };
      this.stateListTimer && clearInterval(this.stateListTimer);
      func();
      this.stateListTimer = setInterval(func, 10 * 1000);
    },

    /**
     * * 打开/关闭
     * @function
     * @param {string} ReUserid 控制谁的摄像头
     */
    dakaiguanbishexiangtou: (ReUserid) => {
      this.redisFB({
        reCode: '22',
        ReUserid,
        ReUserQYBH: '',
        ReUserName: getUserInfo(ReUserid).UserName,
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: null,
      });
    },

    /**
     * * 打开/关闭 麦克风
     * @function
     * @param {string} ReUserid 控制谁的麦克风
     */
    dakaiguanbimaikefeng: (ReUserid) => {
      this.redisFB({
        reCode: '23',
        ReUserid,
        ReUserQYBH: '',
        ReUserName: getUserInfo(ReUserid).UserName,
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: null,
      });
    },

    /**
     * * 心跳连接
     * @function
     */
    xintiaolianjie: () => {
      this.tongjixintiaoTimer && clearInterval(this.tongjixintiaoTimer);
      this.tongjixintiaoTimer = setInterval(() => {
        huoqudingyueshu().then((Data) => {
          // 用自己的服务器测试心跳用
          /*window.LibGenerateTestUserSig &&
            $.ajax({
              type: 'post',
              url: 'https://114.132.78.52:8081/api/xintiao',
              data: Data,
              dataType: 'json',
              async: false,
              cache: false,
              contentType: 'application/x-www-form-urlencoded',
            });*/
          !window.LibGenerateTestUserSig &&
            this.redisFB({
              reCode: '25',
              ReUserid: meetInfo.CHID,
              ReUserQYBH: meetInfo.QYBH,
              ReUserName: meetInfo.UserName,
              SendUserID: meetInfo.CHID,
              SendUserName: meetInfo.XM,
              Content: '',
              Data,
            });
        });
      }, 1500);

      async function huoqudingyueshu() {
        // 视频连线前端心跳增加参数：订阅音频数（Audio）、订阅标清视频数（SD）、订阅高清视频数（HD）
        // const manzu =  rtc && rtc.isJoined_ &&  (hasMe() || isZhuBo() || roomDetail.SpeakerID == meetInfo.CHID);
        let CameraState = 0;
        let MicState = 0;
        let ZB = 0;

        if (
          !deviceUsable.camera ||
          (rtc && rtc.localStream_ && !rtc.localStream_.hasVideo())
        ) {
          CameraState = 2;
        } else {
          CameraState = isCamOn ? 1 : 0;
        }
        if (
          !deviceUsable.mic ||
          (rtc && rtc.localStream_ && !rtc.localStream_.hasAudio())
        ) {
          MicState = 2;
        } else {
          MicState = isMicOn ? 1 : 0;
        }
        if (
          roomDetail.IsZBMS == MODE_STATE.开启 &&
          !meetInfo.IsZCR &&
          !isZhuBo() &&
          !existFirstPage()
        ) {
          ZB = 1;
        }

        let Data = {
          State: 0,
          CameraState,
          MicState,
          Audio: 0,
          SD: 0,
          HD: 0,
          FullHD: 0,
          ZB,
        };

        if (rtc && rtc.isJoined_) {
          let userlist = [];
          try {
            // userlist = await rtc.client_.getUserList()
          } catch (error) {}
          // if (userlist.length > 1) {
          if (rtc.members_.size > 0) {
            try {
              const remoteStats = await rtc.client_.getRemoteVideoStats('main');
              Object.keys(remoteStats).forEach((value, key) => {
                const fbl =
                  remoteStats[value].frameWidth *
                  remoteStats[value].frameHeight;
                if (fbl > 1280 * 720) {
                  Data.FullHD++;
                } else if (fbl > 640 * 480) {
                  Data.HD++;
                } else if (fbl > 1) {
                  Data.SD++;
                } else {
                  Data.Audio++;
                }
              });
              // 如果没有订阅任何人的音视频，将产生音频时长
              if (Object.keys(remoteStats).length == 0) {
                Data.Audio++;
              }
            } catch (error) {
              console.error('[getRemoteVideoStats] ', error);
            }
          } else {
            Data.Audio++;
          }
        }

        window.showXintiao &&
          console.log(
            `------------------------\n`,
            { ...Data },
            `\n------------------------\n`
          );
        return Data;
      }
    },

    /**
     * * 发送长宽比
     * @function
     */
    fasongchangkuanbi: () => {
      this.redisFB({
        reCode: '30',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {
          AspectRatio: meet_layout.aspectRatio,
        },
      });
    },

    /**
     * * 参会端翻页
     * @function
     * @param {number} no
     */
    fanyeCanhuiduan: (no) => {
      this.redisFB({
        reCode: '37',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.UserName,
        Content: '',
        Data: { State: no + 1 },
      });
    },

    /**
     * * 显示端翻页
     * @function
     * @param {number} no
     */
    fanyeXianshiduan: (no) => {
      this.redisFB({
        reCode: '34',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.UserName,
        Content: '',
        Data: { State: no + 1 },
      });
    },
  };
}
