/**
 * 对视图进行处理，用于初始化和网络恢复后重新刷新布局
 */
async function viewsHandle() {
  // 处理布局相关
  layoutCompute();
  // 用于取消主讲人、更改主讲人的处理，清空用户下面再添加进去
  resetViews();
  // 如果没有设置主讲人，将自己设置为假的主讲人
  ZJRID_ = roomDetail.SpeakerID || meetInfo.CHID;
  // 为当前页用户循环添加至网页上
  addViews(ZJRID_);
  if (!rtc.isJoined_) {
    await rtc.join();
  } else {
    tuisong();
    setTimeout(async () => {
      for (const user of meet_layout.pageUserList) {
        if (ZJRID_ != user.ID) {
          const userStream =
            user.ID == meetInfo.CHID
              ? rtc.localStream_
              : rtc.members_.get(user.ID);
          if (userStream) {
            try {
              await userStream.stop();
            } catch (error) {}
            await userStream.play('box_' + user.ID, { mirror: false });
          }
          $('#img_' + user.ID).hide();
        }
      }
    }, 140);
  }

  setTimeout(() => {
    // 开始定时10秒获取更新用户的状态并更新
    chclient.redis.huoquyonghuzhuangtai();
  }, 100);
}

/**
 * 翻页的处理
 */
async function fanyechuli() {
  // 处理布局相关
  layoutCompute();
  tuisong();
  for (let index = 0; index < roomDetail.UserList.length; index++) {
    const { ID } = roomDetail.UserList[index];
    $('#box_' + ID).hide();
  }
  for (let index = 0; index < meet_layout.pageUserList.length; index++) {
    const { ID } = meet_layout.pageUserList[index];
    $('#box_' + ID).css('animationDelay', (6 * index) / 100 + 's');
    $('#box_' + ID).show();
  }
  for (const user of meet_layout.pageUserList) {
    if (ZJRID_ != user.ID) {
      const userStream =
        user.ID == meetInfo.CHID ? rtc.localStream_ : rtc.members_.get(user.ID);
      if (userStream) {
        try {
          await userStream.stop();
        } catch (error) {}
        await userStream.play('box_' + user.ID, { mirror: false });
      }
      $('#img_' + user.ID).hide();
    }
  }
}

/**
 * * 添加当前页用户到页面
 */
async function addViews(userId) {
  for (let index = 0; index < roomDetail.UserList.length; index++) {
    const { ID, UserName } = roomDetail.UserList[index];
    const userBox = addVideoView(ID, UserName);
    userBox.hide();
    if (userIsOnlineByHas(ID)) {
      if (!userHasAudio(ID)) {
        zhezhaozhuangtai('audio', ID);
      } else {
        zhezhaozhuangtai(true, ID);
      }
    }
  }
  for (let index = 0; index < meet_layout.pageUserList.length; index++) {
    const { ID } = meet_layout.pageUserList[index];
    $('#box_' + ID).css('animationDelay', (6 * index) / 100 + 's');
    $('#box_' + ID).show();
  }
  if (getUserInfoByMeet(userId)) {
    const zjr_streams =
      userId == meetInfo.CHID ? rtc.localStream_ : rtc.members_.get(userId);
    if (zjr_streams) {
      await setVideoImg(zjr_streams);
    }
  }
  // 添加用户到参与者列表
  addMember();
  // 主持人左下角添加
  updateZJRBox(userId, false);
}

// 设置取消主讲人的处理
async function changeZJR() {
  // 此处的ZJRID_代表上一个主讲人
  // 此处的newZJRID代表新的主讲人ID，没有的话设定自己为假主讲人
  const newZJRID = roomDetail.SpeakerID || meetInfo.CHID;
  const oldZJRID = ZJRID_;

  if (
    roomDetail.SpeakerID == meetInfo.CHID &&
    roomDetail.ScreenSaverState == MODE_STATE.开启
  ) {
    if (pingbaoshifoujinru) {
      location.reload();
    } else {
      guanbipingbao();
    }
  }

  if (
    oldZJRID == meetInfo.CHID &&
    roomDetail.ScreenSaverState == MODE_STATE.开启 &&
    !pingbaoshifoujinru
  ) {
    kaiqipingbao();
  }

  // 如果切换主讲人还没有完成就又被切换，清除上一个还未完成的，完成当前的
  if (changeZJRTimer) {
    clearTimeout(changeZJRTimer);
    changeZJRTimer = null;
  }

  /**
   * 获取将要成为主讲人的那个远程流
   * @type {TRTC.RemoteStream}
   */
  const zjr_streams =
    newZJRID == meetInfo.CHID ? rtc.localStream_ : rtc.members_.get(newZJRID);
  if (
    zjr_streams &&
    meet_layout.mode != MEET_MODE.主讲人 &&
    getUserInfoByMeet(newZJRID)
  ) {
    // 如果是主讲人加小视频模式下,在播放之前先截图替换之前的截图,以弥补主讲人播放在小视频区域后会出现上一次的截图导致视觉效果不好
    setVideoImg(zjr_streams);
  }

  // 从小视频区域停留一秒再到主讲人区域播放，如果不这样做会因为切换分辨率后卡顿一下，停留一下可以保障用户看到的并不是卡顿的，效果更好一些
  if (newZJRID == meetInfo.CHID) {
    rtc.shezhifenbianlv(2);
    changeZJRTimer = setTimeout(() => {
      callback();
    }, 500);
    callback();
  } else {
    // 没有推流的主讲人直接切换
    if (rtc.members_.get(newZJRID)) {
      changeZJRTimer = setTimeout(() => {
        callback();
      }, 1200);
    } else {
      callback();
    }
  }

  async function callback() {
    clearTimeout(changeZJRTimer);
    changeZJRTimer = null;

    // 先停止上一个主持人的播放
    if (oldZJRID == meetInfo.CHID) {
      // 上一个主讲人是我，停止本地流
      rePlay(rtc.localStream_, meetInfo.CHID);
      // 在容器内播放完毕再调整分辨率
      setTimeout(() => {
        rtc.shezhifenbianlv(2);
      }, 400);
    } else {
      // 上一个主讲人是其他人，停止他的远程流
      rePlay(rtc.members_.get(oldZJRID), oldZJRID);
    }

    async function rePlay(stream, ID) {
      // 如果是主讲人模式并且上一个主讲人不是我或主持人，将取消订阅
      // * 主持人如论何时也不能取消订阅
      if (
        meet_layout.mode == MEET_MODE.主讲人 &&
        oldZJRID != meetInfo.CHID &&
        oldZJRID != ZCRID_
      ) {
        if (stream) {
          await rtc.client_.unsubscribe(stream);
        }
        return;
      }
      if (stream) {
        stream
          .play('box_' + ID, { objectFit: 'cover', mirror: false })
          .catch(() => {
            setTimeout(() => {
              stream.play('box_' + ID, { objectFit: 'cover', mirror: false });
            }, 100);
          });
        hasMe(ID) && userHasVideo(ID) && $('#mask_' + ID).hide();
      } else {
        $('#mask_' + ID).show();
      }
    }

    // 移除原主讲人的相关信息
    updateZJRBox(newZJRID, true);

    // 如果新的主持人也存在右侧小视频区域，右侧的小视频将显示遮罩
    hasMe(newZJRID) && $('#mask_' + newZJRID).show();

    // 判断是否为手机设备
    const objectFit = objectFitHandle(newZJRID);

    tuisong();

    ZJRID_ = newZJRID;

    // 如果是主讲人模式，订阅新的主讲人的流
    if (meet_layout.mode == MEET_MODE.主讲人 && newZJRID != meetInfo.CHID) {
      if (zjr_streams) {
        try {
          zjr_streams.stop();
        } catch (error) {}
        await subscribeHandle(zjr_streams);
      }
    } else {
      if (zjr_streams) {
        zjr_streams
          .play('zjr_video', { objectFit, mirror: false })
          .then(async () => {
            // 重新播放试一下
            if ($('#zjr_video [id^="player_"]').length == 0) {
              setTimeout(() => {
                zjr_streams.play('zjr_video', { objectFit, mirror: false });
              }, 100);
            }
          });
      }
    }

    // 如果新主讲人推送成功了
    if (zjr_streams) {
      // 如果新主讲人摄像头推送正常
      if (userHasVideo(newZJRID)) {
        $('#zjr_mask').hide();
        // 为新的主讲人取帧
        videoHandle(true, newZJRID);
      } else {
        // 不正常显示音频在线
        if (!userHasAudio(newZJRID)) {
          zhezhaozhuangtai('audio', newZJRID);
        } else {
          zhezhaozhuangtai(true, newZJRID);
        }
      }
    } else {
      // 用于判断当前主讲人是不是没有流推送但是在线，如果这样显示音频在线
      const exits = await userIsOnlineByHas(newZJRID);
      exits && zhezhaozhuangtai('audio', newZJRID);
      // 主讲人的流有问题的话显示遮罩
      $('#zjr_mask').show();
    }

    // 权限判断按钮显示或隐藏
    showOrHide();
    micRestore();
  }
}
