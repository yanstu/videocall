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
  }

  /**
   * 收听广播
   * @param {redisData} mess
   * @param {number} channelss
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
          const oldZJRID = ZJRID_;
          const newZJRID = roomDetail.SpeakerID;
          if (
            oldZJRID == meetInfo.CHID &&
            roomDetail.ScreenSaverState == MODE_STATE.开启 &&
            !pingbaoshifoujinru
          ) {
            kaiqipingbao();
          }
          if (
            newZJRID == meetInfo.CHID &&
            roomDetail.ScreenSaverState == MODE_STATE.开启
          ) {
            guanbipingbao();
          }
          ZJRID_ = newZJRID;
          showOrHide();
          micRestore();
          break;
        // 关闭发言申请
        case '15':
        // 允许发言
        case '17':
          this.huoquhuiyihuancun();
          break;
        //获取会议缓存信息
        case '12':
          this.#handle.huoquhuiyihuancunxinxi(mess);
          break;
        //获取消息 所有人接收
        case '08':
        //获取消息 指定接收用户
        case '09':
          this.#handle.huoquxiaoxi(mess);
          break;
        //获取申请发言，有人点了申请发言，主持人收到做出处理
        case '10':
          this.#handle.huoqushenqingfayan(mess);
          break;
        // 打开/关闭用户的摄像头
        case '22':
          if (mess.ReUserid == meetInfo.CHID) {
            if (!mess.Data) {
              switchVideo({ toggle: true });
            } else {
              switchVideo({ on: mess.Data.State == MODE_STATE.开启 });
            }
          }
          break;
        // 打开/关闭用户的麦克风
        case '23':
          if (mess.ReUserid == meetInfo.CHID) {
            if (!mess.Data) {
              switchMic({ toggle: true });
            } else {
              switchMic({ on: mess.Data.State == MODE_STATE.开启 });
            }
          }
          break;
        // 允许发言
        case '18':
          if (mess.Data.State == MODE_STATE.开启 && !meetInfo.IsZCR) {
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
          layer.msg('您已被请离房间', { icon: 2 });
          setTimeout(() => {
            leave();
          }, 1000);
          break;
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
        // 更新参与者列表用户麦克风状态
        case '06':
          xiugaicanyuzhemaikefeng(
            mess.Data == MODE_STATE.开启,
            mess.SendUserID
          );
          break;
        // 更新参与者列表用户摄像头状态
        case '05':
          xiugaicanyuzheshexiangtou(
            mess.Data == MODE_STATE.开启,
            mess.SendUserID
          );
          break;
        // 获取用户缓存状态
        case '39':
          mess.ReUserid == meetInfo.CHID &&
            gengxinzhuangtaiByCache(mess.Data.HeartbeatList);
          break;
        // 个人刷新或全部人刷新
        case '41':
          if (!mess.ReUserid || mess.ReUserid == meetInfo.CHID) {
            location.reload();
          }
          break;
        // 开启/关闭中场休息
        case '43':
          roomDetail.ScreenSaverState = mess.Data.State;
          if (mess.Data.State == MODE_STATE.开启) {
            kaiqipingbao();
          } else {
            guanbipingbao();
          }
          break;
        // 会标状态 0关闭1打开
        case '48':
          roomDetail.EmblemState = mess.Data.State;
          huiyizhunbei({ ready: mess.Data.State == MODE_STATE.开启 });
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
     * * 收到申请发言的请求
     * @param {redisData} mess
     */
    huoqushenqingfayan(mess) {
      // 发言列表中不存在此用户的申请
      if (!($('#fayan_' + mess.SendUserID).length > 0)) {
        addSpeaker(mess.SendUserID);
      } else {
        // 重复提交发言提醒
        meetInfo.IsZCR &&
          layer.msg(getUserInfo(mess.SendUserID).UserName + '再次申请发言');
      }
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

    /**
     * * 接收到获取会议缓存信息
     * @param {redisData} mess
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
        canhuiduan_mode(meet_layout.mode, '主动');
      } else {
        if (meet_layout.mode != MEET_MODE.小视频) {
          canhuiduan_mode(meet_layout.mode, '主动');
        }
      }
      if (roomDetail.ScreenSaverState == MODE_STATE.开启) {
        kaiqipingbao();
      }
      roomDetail.EmblemState == MODE_STATE.开启 &&
        huiyizhunbei({ ready: true });
      canhuihaishikanzhibo();
      if (rtc.isPublished_) {
        return;
      }
      viewsHandle();
    },
  };
}
