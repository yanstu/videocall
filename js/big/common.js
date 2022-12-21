/**
 * 对视图进行处理
 */
async function viewsHandle() {
  // 清空所有小视频
  resetViews();
  // 处理布局相关
  layoutCompute();
  // 如果没有设置主讲人，设定主持人为主讲人视角
  ZJRID_ = roomDetail.SpeakerID || ZCRID_;
  // 为当前页用户循环添加至网页上
  addViews(ZJRID_);
  if (!rtc.isJoined_) {
    await rtc.join();
  } else {
    setTimeout(async () => {
      for (const user of display_layout.pageUserList) {
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
    chclient.redis.huoquyonghuzhuangtai();
  }, 100);
}

/**
 * 翻页的处理
 */
async function fanyechuli() {
  // 处理布局相关
  layoutCompute();

  for (let index = 0; index < roomDetail.UserList.length; index++) {
    const { ID } = roomDetail.UserList[index];
    $('#box_' + ID).hide();
  }
  for (let index = 0; index < display_layout.pageUserList.length; index++) {
    const { ID } = display_layout.pageUserList[index];
    $('#box_' + ID).css('animationDelay', (6 * index) / 100 + 's');
    $('#box_' + ID).show();
  }
  for (const user of display_layout.pageUserList) {
    if (ZJRID_ != user.ID) {
      var stream =
        user.ID == meetInfo.CHID ? rtc.localStream_ : rtc.members_.get(user.ID);
      if (stream) {
        try {
          await stream.stop();
        } catch (error) {}
        await stream.play('box_' + user.ID, { mirror: false });
      }
      $('#img_' + user.ID).hide();
    }
  }
}

/**
 * 为当前页用户循环添加至网页上
 */
async function addViews(userId) {
  for (let index = 0; index < roomDetail.UserList_Show.length; index++) {
    const { ID, UserName } = roomDetail.UserList_Show[index];
    const userBox = addVideoView(ID, UserName);
    getUserInfoByDisplay(ID) && userBox.show();
    if (userIsOnlineByHas(ID)) {
      if (!userHasAudio(ID)) {
        zhezhaozhuangtai('audio', ID);
      } else {
        zhezhaozhuangtai(true, ID);
      }
    }
  }
  for (let index = 0; index < display_layout.pageUserList.length; index++) {
    const { ID } = display_layout.pageUserList[index];
    $('#box_' + ID).css('animationDelay', (6 * index) / 100 + 's');
    $('#box_' + ID).show();
  }
  if (getUserInfoByDisplay(userId)) {
    const zjr_streams =
      userId == meetInfo.CHID ? rtc.localStream_ : rtc.members_.get(userId);
    zjr_streams && setVideoImg(zjr_streams);
  }
  updateZJRBox(userId, false);
}

// 取消、修改主讲人的处理
async function change() {
  // 此处的ZJRID_代表上一个主讲人
  // 此处的newZJRID代表新的主讲人ID，没有的话设定主持人为主讲人视角
  const newZJRID = roomDetail.SpeakerID || ZCRID_;
  const oldZJRID = ZJRID_;

  if (newZJRID == oldZJRID) return;

  // 如果切换主讲人还没有完成就又被切换，清除上一个还未完成的，完成当前的
  if (changeZJRTimer) {
    clearTimeout(changeZJRTimer);
    changeZJRTimer = null;
  }

  // 获取将要成为主讲人的那个远程流
  const zjr_streams = rtc.members_.get(newZJRID);
  if (
    zjr_streams &&
    meet_layout.mode != MEET_MODE.主讲人 &&
    getUserInfoByDisplay(newZJRID)
  ) {
    // 如果是主讲人加小视频模式下,在播放之前先截图替换之前的截图,以弥补主讲人播放在小视频区域后会闪一下
    setVideoImg(zjr_streams);
  }

  // 从小视频区域停留一秒再到主讲人区域播放，如果不这样做会因为切换分辨率后卡顿一下，停留一下可以保障用户看到的并不是卡顿的，效果更好一些
  if (rtc.members_.get(newZJRID)) {
    changeZJRTimer = setTimeout(() => {
      callback();
    }, 1300);
  } else {
    // 没有推流的主讲人直接切换
    callback();
  }

  async function callback() {
    clearTimeout(changeZJRTimer);
    changeZJRTimer = null;

    // 先停止上一个主持人的播放
    rePlay(rtc.members_.get(oldZJRID), oldZJRID);

    async function rePlay(stream, ID) {
      if (stream) {
        // 如果是主讲人模式并且上一个主讲人主持人，将取消订阅
        // 主持人如论何时也不能取消订阅
        if (display_layout.mode == MEET_MODE.主讲人 && oldZJRID != ZCRID_) {
          await rtc.client_.unsubscribe(stream);
          return;
        }
        stream
          .play('box_' + ID, { objectFit: 'cover', mirror: false })
          .catch(() => {
            setTimeout(() => {
              stream.play('box_' + ID, { objectFit: 'cover', mirror: false });
            }, 100);
          });
      } else {
        $('#mask_' + ID).show();
      }
    }

    // 移除原主持人的相关信息
    updateZJRBox(newZJRID, true);

    // 如果新的主持人也存在右侧小视频区域，右侧的小视频将显示遮罩
    hasMe(newZJRID) && $('#mask_' + newZJRID).show();

    // 判断是否为手机设备
    const objectFit = objectFitHandle(newZJRID);

    ZJRID_ = newZJRID;

    if (zjr_streams) {
      // 如果是主讲人模式，订阅新的主讲人的流
      if (display_layout.mode == 1) {
        await rtc.client_.subscribe(zjr_streams);
      } else {
        zjr_streams
          .play('zjr_video', { objectFit, mirror: false })
          .then(async () => {
            // 重新播放试一下
            if ($('#zjr_video [id^="player_"]').length == 0) {
              setTimeout(() => {
                zjr_streams
                  .play('zjr_video', { objectFit, mirror: false })
                  .then(async () => {
                    if (zjr_streams) {
                      await setVideoImg(zjr_streams);
                    }
                  });
              }, 100);
            } else {
              if (zjr_streams) {
                await setVideoImg(zjr_streams);
              }
            }
          })
          .catch((err) => {
            location.reload();
          });
      }
      // 如果新主讲人摄像头推送正常
      if (userHasVideo(newZJRID)) {
        $('#zjr_mask').hide();
        // 为新的主讲人取帧
        videoHandle(true, newZJRID);
      } else {
        // 不正常显示音频在线
        // zhezhaozhuangtai(true, newZJRID);
        if (!userHasAudio(newZJRID)) {
          zhezhaozhuangtai('audio', newZJRID);
        } else {
          zhezhaozhuangtai(true, newZJRID);
        }
      }
    } else {
      // 用于判断当前主讲人是不是没有流推送但是在线，如果这样显示音频在线
      const exits = userIsOnlineByHas(newZJRID);
      exits && zhezhaozhuangtai('audio', newZJRID);
      // 主讲人的流有问题的话显示遮罩
      $('#zjr_mask').show();
    }

    // 权限判断按钮显示或隐藏
    showOrHide();
  }
}
