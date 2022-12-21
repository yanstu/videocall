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
    this.huoquhuiyihuancun();
    this.zhanshiduanxintiao();
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
          break;
        //获取会议缓存信息
        case '12':
          this.#handle.huoquhuiyihuancunxinxi(mess);
          break;
        // 会议结束
        case '47':
          huiyijieshu();
          break;
        // 改变布局行列显示
        case '33':
          var state = mess.Data.State;
          display_layout.cols = state.split('*')[0];
          display_layout.rows = state.split('*')[0];
          display_layout.pageNo = 0;
          sortView();
          fanyechuli();
          break;
        // 改变当前分页
        case '34':
          var pageNo = mess.Data.State;
          display_layout.pageNo = pageNo - 1;
          // viewsHandle();
          fanyechuli();
          break;
        // 改变参会端当前分页
        case '37':
          var pageNo = mess.Data.State;
          meet_layout.pageNo = pageNo - 1;
          break;
        // 操作所有用户切换显示模式
        case '35':
          break;
        // 操作显示端切换显示模式
        case '32':
          display_layout.mode = mess.Data.State;
          zhanshiduan_mode(mess.Data.State);
          break;
        // 更新用户的长宽比
        case '30':
          var AspectRatio = mess.Data.AspectRatio;
          var SendUserID = mess.SendUserID;
          if (AspectRatio) {
            var sendUserInfo = getUserInfo(SendUserID);
            if (sendUserInfo) {
              sendUserInfo.AspectRatio = AspectRatio;
            }
          }
          break;
        // 获取用户缓存状态
        case '39':
          mess.ReUserid == meetInfo.CHID &&
            gengxinzhuangtaiByCache(mess.Data.HeartbeatList);
          break;
        // 广播展示端用户排序
        case '46':
          if (mess.Data.UserList_Show)
            roomDetail.UserList_Show = mess.Data.UserList_Show;
          viewsHandle();
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
      roomDetail.UserList = roomDetail.UserList.sort(sortData);
      roomDetail.UserList_Show = roomDetail.UserList_Show.sort(sortData);
      ZCRID_ = roomDetail.UserList.find((item) => item.IsZCR == 1).ID;
      if (roomDetail.ScreenSaverState == MODE_STATE.开启) {
        kaiqipingbao();
      }
      roomDetail.EmblemState == MODE_STATE.开启 &&
        huiyizhunbei({ ready: true });
      initFenye();
      zhanshiduan_mode(roomDetail.XSDModel.Model);
      viewsHandle();
    },
  };
}
