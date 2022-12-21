// 小视频区域的class
const video_grid_class =
  'box-border grid w-[9rem] h-[13rem] overflow-hidden absolute top-[0.5%] right-[1%] items-center z-13';
// 主讲人视频区域的class
const zjr_box_class = 'w-full h-full video-box relative';
// 小视频区域里显示的小视频的class
const xiaoshipin_class = 'w-[9rem] h-full video-box relative';

/**
 * 对视图进行处理
 */
async function viewsHandle() {
  layoutCompute();
  // 修改主讲人
  rtc.isJoined_ && change();
  ZJRID_ = roomDetail.SpeakerID || meetInfo.CHID;
  // 初始化
  (!rtc || !rtc.isJoined_) && init();
}

function addView(userId) {
  for (let index = 0; index < roomDetail.UserList.length; index++) {
    const { ID, UserName } = roomDetail.UserList[index];
    if (
      hasMe(ID) || ID == meetInfo.CHID ||
      roomDetail.SpeakerID == ID ||
      roomDetail.UserList.length <= 25
    ) {
      const userBox = addVideoView(ID, UserName);
      userId == ID && userBox.show();
    }
  }
  $('#box_' + userId).attr('class', xiaoshipin_class);
}

async function change() {
  // 还原主讲人与我的位置
  $('#video-grid').attr('class', video_grid_class);
  $('#zjr_box').attr('class', zjr_box_class);

  const newZJRID = roomDetail.SpeakerID || meetInfo.CHID;
  const oldZJRID = ZJRID_

  // 先停止上一个主讲人的远程流
  const old_streams = rtc.members_.get(oldZJRID);
  old_streams && old_streams.stop();

  // 再停止新的主讲人的远程流
  const new_streams =
    newZJRID == meetInfo.CHID ? rtc.localStream_ : rtc.members_.get(newZJRID);
  new_streams && new_streams.stop();

  if (newZJRID == meetInfo.CHID) {
    // 如果新的主讲人是我，清空小视频区域，将主持人添加到小视频区域
    resetViews();
    const zcr_stream = rtc.members_.get(ZCRID_);
    addView(ZCRID_);
    if (zcr_stream) {
      zcr_stream.stop();
      zcr_stream.play('box_' + ZCRID_, { mirror: false });
    } else {
      // 用于判断当前主持人是不是没有流推送但是在线，如果这样显示音频在线
      // const exits = !!trtcuserlist.find(item => item.userId == ZCRID_)
      // exits && zhezhaozhuangtai(true, ZCRID_);
      // if (exits) {
      if (userIsOnlineByHas(ZCRID_)) {
        if (!userHasAudio(ZCRID_)) {
          zhezhaozhuangtai('audio', ZCRID_);
        } else {
          zhezhaozhuangtai(true, ZCRID_);
        }
      }
    }
  } else {
    // 如果上一个主讲人是我
    if (oldZJRID == meetInfo.CHID) {
      resetViews();
      rtc.localStream_.stop();
      addView(meetInfo.CHID);
      $("#video-grid [id^='player_']").remove();
      rtc.localStream_.play('box_' + meetInfo.CHID, { mirror: false });
      $('#mask_' + meetInfo.CHID).hide();
    }
  }

  updateZJRBox(newZJRID, true);

  if (new_streams) {
    // 将新主讲人播放到主讲人容器
    new_streams.play('zjr_video', { mirror: false });
    userHasVideo(newZJRID) && $('#zjr_mask').hide();
  } else {
    $('#zjr_mask').show();
    // 用于判断当前主讲人是不是没有流推送但是在线，如果这样显示音频在线
    const exits = userIsOnlineByHas(newZJRID)
    // const exits = await userIsOnlineByTRTC(newZJRID)
    // exits && zhezhaozhuangtai(true, newZJRID);
    exits && zhezhaozhuangtai('audio', newZJRID);
  }

  for (const stream of rtc.remoteStreams_) {
    rtc.playVideo(stream, stream.userId_);
  }

  tuisong();

  rtc.shezhifenbianlv();

  showOrHide();
  micRestore()

  chclient.redis.huoquyonghuzhuangtai();
}

/**
 * 第一次进入的初始化
 */
async function init() {
  resetViews();
  if (ZJRID_ == meetInfo.CHID) {
    var zcr_streams = rtc.members_.get(ZCRID_);
    zcr_streams && zcr_streams.stop();
    addView(ZCRID_);
  } else {
    addView(meetInfo.CHID);
  }
  updateZJRBox(ZJRID_, true);
  await rtc.join();
}

// 点击小视频切换大视频
// 互相替换样式
$('#video-grid').on('click', () => {
  if ($('#video-grid > div').length > 0) {
    $('#video-grid').attr('class', zjr_box_class);
    $("[id^='box_']").attr('class', zjr_box_class);
    $('#zjr_box').attr(
      'class',
      video_grid_class
    );
    $('#zjr_box .mask div').css('font-size', '1rem');
    $('#video-grid .mask div').css('font-size', '2rem');
  }
});
// 还原
$('#zjr_video').on('click', () => {
  if ($('#video-grid > div').length > 0) {
    $('#video-grid').attr('class', video_grid_class);
    $("[id^='box_']").attr('class', xiaoshipin_class);
    $('#zjr_box').attr('class', zjr_box_class);
    $('#zjr_box .mask div').css('font-size', '2rem');
    $('#video-grid .mask div').css('font-size', '1rem');
  }
});
