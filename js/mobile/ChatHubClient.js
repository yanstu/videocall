// @ts-ignore
class ChatHubClient extends BaseChatHubClient {
  #RoomId = 0;

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
    huoquchangkuanbi();
    this.huoquhuiyihuancun();
    this.huoquzhujiangren(viewsHandle);
  }

  /**
   * 收听广播
   * @param {redisData} mess
   * @param {number} channelss
   * @override
   */
  broadcastMessage = (mess, channelss) => {
    if (channelss == this.#RoomId) {
      switch (mess.reCode) {
        // 踢出用户
        case '07':
          if (mess.ReUserid == meetInfo.CHID) {
            layer.alert('您已被强制退出视频连线', { icon: 2 });
            setTimeout(() => {
              leave();
            }, 1000);
          }
          break;
        // 关闭除主讲人和主持人外所有的麦克风
        case '03':
          closeAllMic();
          break;
        // 设置主讲人
        case '01':
        case '20':
        //取消主讲人
        case '29':
          roomDetail.SpeakerID = mess.ReUserid;
          roomDetail.SpeakerName = mess.ReUserName;
          viewsHandle();
          break;
        // 关闭发言申请
        case '15':
        // 获取用户缓存状态
        case '39':
          mess.ReUserid == meetInfo.CHID &&
            gengxinzhuangtaiByCache(mess.Data.HeartbeatList);
          break;
        // 允许发言
        case '17':
          this.huoquhuiyihuancun();
          break;
        //获取会议缓存信息
        case '12':
          this.#handle.huoquhuiyihuancunxinxi(mess);
          break;
        // 打开/关闭用户的摄像头
        case '22':
          if (mess.ReUserid == meetInfo.CHID) {
            if (!mess.Data) {
              switchVideo({ toggle: true });
            } else {
              switchVideo({ on: mess.Data.State == '1' });
            }
          }
          break;
        // 打开/关闭用户的麦克风
        case '23':
          if (mess.ReUserid == meetInfo.CHID) {
            if (!mess.Data) {
              switchMic({ toggle: true });
            } else {
              switchMic({ on: mess.Data.State == '1' });
            }
          }
          break;
        //允许发言
        case '18':
          if (mess.Data.State == '1' && !meetInfo.IsZCR) {
            $('#shenqingfayan_foot_btn').show();
          } else {
            $('#shenqingfayan_foot_btn').hide();
          }
          break;
        // 会议结束
        case '47':
          huiyijieshu();
          break;
        //踢出所有用户
        case '28':
          layer.msg('会议已结束', { icon: 2 });
          setTimeout(() => {
            leave();
          }, 1000);
          break;
        // 改变展示端布局行列显示
        case '33':
          var state = mess.Data.State;
          display_layout.cols = state.split('*')[0];
          display_layout.rows = state.split('*')[0];
          display_layout.pageNo = 0;
          viewsHandle();
          break;
        // 改变展示端当前分页
        case '34':
          var pageNo = mess.Data.State;
          display_layout.pageNo = pageNo - 1;
          layoutCompute();
          tuisong();
          break;
        // 改变参会端当前分页
        case '37':
          var pageNo = mess.Data.State;
          meet_layout.pageNo = pageNo - 1;
          layoutCompute();
          tuisong();
          break;
        // 操作所有用户切换显示模式
        case '35':
          meet_layout.mode = mess.Data.State;
          canhuiduan_mode(meet_layout.mode, '被动');
          break;
        // 更新用户的长宽比
        case '30':
          var AspectRatio = mess.Data.AspectRatio;
          var SendUserID = mess.SendUserID;
          if (AspectRatio) {
            var user = roomDetail.UserList.find(
              (item) => item.ID == SendUserID
            );
            if (user) {
              user.AspectRatio = AspectRatio;
            }
          }
          break;
        // 是否允许非主持人主讲人控制麦克风
        case '38':
          roomDetail.AllowOpenMic = mess.Data.State;
          break;
        //获取消息 所有人接收
        case '08':
        //获取消息 指定接收用户
        case '09':
          this.#handle.huoquxiaoxi(mess);
          break;
        // 广播展示端用户排序
        case '46':
          if (mess.Data.UserList_Show)
            roomDetail.UserList_Show = mess.Data.UserList_Show;
          viewsHandle();
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

  #handle = {
    /**
     * * 接收到获取会议缓存信息
     * @param {redisData | roomDetail} mess
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
      setTitle(roomDetail.Title);

      roomIsAbnormal();
      roomDetail.UserList = roomDetail.UserList.sort(sortData);
      roomDetail.UserList_Show = roomDetail.UserList_Show.sort(sortData);
      ZCRID_ = roomDetail.UserList.find((item) => item.IsZCR == 1).ID;
      meet_layout.mode = roomDetail.CHDModel.Model;
      if (roomDetail.CJRLX == 2) {
        meet_layout.mode = MEET_MODE.小视频;
      }
      canhuiduan_mode(meet_layout.mode, '主动');
      roomDetail.EmblemState == MODE_STATE.开启 &&
        huiyizhunbei({ ready: true });
      canhuihaishikanzhibo();
      viewsHandle();
    },
    /**
     * * 收到别人发送的消息
     * @param {redisData} mess
     */
    huoquxiaoxi(mess) {
      if (
        mess.ReUserid &&
        mess.ReUserid != meetInfo.CHID &&
        mess.SendUserID != meetInfo.CHID
      )
        return;
      addMessage(mess.SendUserID, mess.ReUserid, mess.Content);
    },
  };
}
