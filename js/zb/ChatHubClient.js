// @ts-ignore
class ChatHubClient extends BaseChatHubClient {
  #RoomId = 0;
  // 如果不是第一次连接成功，说明是重连，一半网络断开了后才会出现重新连接，以此可以判断出网络恢复了
  #isFirstConnected = true;
  // 用户列表在线心跳计时器
  #memberListHeartbeatTimer = null;

  constructor({ RoomId }) {
    super({ RoomId });
    this.#RoomId = RoomId;
    this.startChathub();
  }

  /**
   * * chathub连接成功、重连成功后的执行函数
   * @override
   */
  chatHubConnectedCallback() {
    this.huoquhuiyihuancun();
    this.memberListHeartbeat();

    // signalr重连恢复播放视频
    if (!this.#isFirstConnected) {
      layer.msg('网络连接已恢复，正在恢复视频连线', { icon: 6 });
      console.log('网好咯！signalR恢复咯！');
      live.initPlayer();
      setTimeout(() => {
        live.play();
      }, 500);
    }
    this.#isFirstConnected = false;
  }

  /**
   * 收听广播
   * @param {redisData} mess
   * @param {number} channelss
   * @override
   */
  broadcastMessage = (mess, channelss) => {
    if (channelss == this.#RoomId) {
      mess.SendUserID &&
        mess.SendUserID != meetInfo.CHID &&
        mess.SendUserID != ZCRID_ &&
        (changeMemberNameColor(mess.SendUserID, true) ||
          addNotTRTCUser(mess.SendUserID));
      switch (mess.reCode) {
        // 踢出用户
        case '07':
          if (mess.ReUserid == meetInfo.CHID) {
            layer.msg('您已被强制退出视频连线', { icon: 2 });
            setTimeout(() => {
              leave();
            }, 1000);
          }
          break;
        // 设置主讲人
        case '01':
        case '20':
        //取消主讲人
        case '29':
          roomDetail.SpeakerID = mess.ReUserid;
          roomDetail.SpeakerName = mess.ReUserName;
          const oldZJRID = ZJRID_;
          const newZJRID = roomDetail.SpeakerID;
          if (oldZJRID == meetInfo.CHID) {
            roomDetail.ScreenSaverState == MODE_STATE.开启 && kaiqipingbao();
          }
          if (newZJRID == meetInfo.CHID) {
            roomDetail.ScreenSaverState == MODE_STATE.开启 && guanbipingbao();
          }
          ZJRID_ = newZJRID;
          isTuisong();
          break;
        //获取会议缓存信息
        case '12':
          this.#handle.huoquhuiyihuancunxinxi(mess);
          break;
        // 会议结束
        case '47':
          huiyijieshu();
          break;
        //踢出所有用户
        case '28':
          layer.msg('您已被请离房间', { icon: 2 });
          setTimeout(() => {
            leave();
          }, 1000);
          break;
        // 参会端切换显示模式
        case '35':
          meet_layout.mode = mess.Data.State;
          // 还原到第一页
          meet_layout.pageNo = 0;
          isTuisong();
          break;
        // 改变展示端布局行列显示
        case '33':
          var state = mess.Data.State;
          display_layout.cols = state.split('*')[0];
          display_layout.rows = state.split('*')[0];
          display_layout.pageNo = 0;
          isTuisong();
          break;
        // 改变展示端当前分页
        case '34':
          var pageNo = mess.Data.State;
          display_layout.pageNo = pageNo - 1;
          isTuisong();
          break;
        // 显示端切换显示模式
        case '32':
          display_layout.mode = mess.Data.State;
          if (display_layout.mode == '3') {
            display_layout.cols = '5';
            display_layout.rows = '5';
          }
          // 还原到第一页
          display_layout.pageNo = 0;
          isTuisong();
          break;
        // 改变参会端当前分页
        case '37':
          var pageNo = mess.Data.State;
          meet_layout.pageNo = pageNo - 1;
          isTuisong();
          break;
        // 开启/关闭中场休息
        case '43':
          roomDetail.ScreenSaverState = mess.Data.State;
          if (mess.Data.State == 1) {
            kaiqipingbao();
          } else {
            guanbipingbao();
          }
          break;
        // 广播展示端用户排序
        case '46':
          if (mess.Data.UserList_Show)
            roomDetail.UserList_Show = mess.Data.UserList_Show;
          layoutCompute();
          isTuisong();
          break;
        // 个人刷新或全部人刷新
        case '41':
          if (!mess.ReUserid || mess.ReUserid == meetInfo.CHID) {
            location.reload();
          }
          break;
        // 会标状态 0关闭1打开
        case '48':
          roomDetail.EmblemState = mess.Data.State;
          huiyizhunbei({ ready: mess.Data.State == 1 });
          break;
      }
    }
  };

  /**
   * 发布获取会议缓存
   */
  huoquhuiyihuancun() {
    ajaxMethod(
      'RedisHandler',
      { Infotype: 'GetCache', RoomId: this.#RoomId },
      (res) => {
        this.#handle.huoquhuiyihuancunxinxi(res);
      }
    );
  }

  memberListHeartbeat() {
    this.#memberListHeartbeatTimer &&
      clearInterval(this.#memberListHeartbeatTimer);
    this.#memberListHeartbeatTimer = setInterval(() => {
      this.redisFB({
        reCode: '999',
        ReUserid: '',
        ReUserQYBH: '',
        ReUserName: '',
        SendUserID: meetInfo.CHID,
        SendUserName: meetInfo.XM,
        Content: '',
        Data: {},
      });
    }, 5 * 1000);
  }

  #handle = {
    /**
     * * 接收到获取会议缓存信息
     */
    huoquhuiyihuancunxinxi(mess) {
      if (mess.reCode) {
        if (
          !mess.ReUserid ||
          mess.Data.VideoConferenceMess.UserList.length == 0
        ) {
          location.reload();
        } else if (mess.ReUserid == meetInfo.CHID) {
          roomDetail = mess.Data.VideoConferenceMess;
        } else {
          return;
        }
      } else {
        roomDetail = mess;
      }
      if (roomDetail.IsZBMS == MODE_STATE.关闭) {
        if (isPC()) {
          tiaozhuandao('index');
        } else {
          tiaozhuandao('mobile');
        }
      }
      setTitle(roomDetail.Title);
      roomIsAbnormal();
      roomDetail.UserList = roomDetail.UserList.sort(sortData);
      roomDetail.UserList_Show = roomDetail.UserList_Show.sort(sortData);
      ZCRID_ = roomDetail.UserList.find((item) => item.IsZCR == 1).ID;
      if (roomDetail.ScreenSaverState == MODE_STATE.开启) {
        kaiqipingbao();
      }
      roomDetail.EmblemState == MODE_STATE.开启 &&
        huiyizhunbei({ ready: true });
      ZJRID_ = roomDetail.SpeakerID;
      initFenye();
      isTuisong();
      changeMemberNameColor(meetInfo.CHID, true);
    },
  };
}
