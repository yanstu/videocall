/**
 * 对视图进行处理
 */
async function viewsHandle() {
  layoutCompute();
  // 清空所有盒子
  resetViews();
  // 为当前页用户循环添加至网页上
  addView();
  if (rtc.isJoined_) {
    qiehuanyemian();
  } else {
    await rtc.join();
    videoHandle(isCamOn, meetInfo.CHID);
  }

  setTimeout(() => {
    // 开始定时10秒获取更新用户的状态并更新
    chclient.redis.huoquyonghuzhuangtai();
  }, 100);
}

/**
 * * 切换页面
 */
async function qiehuanyemian() {
  if (!getUserInfoByMeet(meetInfo.CHID)) {
    await rtc.localStream_.stop();
  } else {
    rtc.playVideo(rtc.localStream_, meetInfo.CHID);
    videoHandle(isCamOn, meetInfo.CHID);
  }

  for (const user of roomDetail.UserList) {
    const { ID } = user;
    if (ID == meetInfo.CHID) {
      continue;
    }
    const userStream = rtc.members_.get(ID);
    if (userStream) {
      await userStream.stop();
      await rtc.client_.unsubscribe(userStream);
      await rtc.client_.subscribe(userStream, {
        audio: true,
        video: !!getUserInfoByMeet(ID), // 在当前页的才订阅视频
      });
    } else {
      if (userIsOnlineByHas(ID)) {
        if (!userHasAudio(ID)) {
          zhezhaozhuangtai('audio', ID);
        } else {
          zhezhaozhuangtai(true, ID);
        }
      }
    }
  }

  setTimeout(() => {
    chclient.redis.huoquyonghuzhuangtai();
  }, 100);
}

/**
 * 它将视频视图添加到页面
 */
async function addView() {
  for (let index = 0; index < roomDetail.UserList.length; index++) {
    const { ID, UserName } = roomDetail.UserList[index];
    const userBox = addVideoView(ID, UserName);
    userBox.attr(
      'class',
      'w-full h-full video-box relative box-border border-[1px] border-[#393e4b]'
    );
    $(`#video_${ID}`).on({
      click: clickProof(async () => {
        const stream = rtc.members_.get(ID);
        if (!stream) {
          layer.msg('用户离线');
          return;
        }
        const isbofang = userBox.find('video').length == 0;
        try {
          await stream.stop();
        } catch (error) {}
        await rtc.client_.unsubscribe(stream);
        await rtc.client_
          .subscribe(stream, {
            audio: true,
            video: isbofang,
          })
          .then(() => {
            $(`#video_${ID} > img`).attr(
              'src',
              `./img/video-${isbofang ? 'on' : 'off'}.png`
            );
          });
        setTimeout(async () => {
          let video = await rtc.client_.getRemoteVideoStats('main');
          Object.getOwnPropertyNames(video).forEach(function (key) {
            if (key == ID) {
              videoHandle(isbofang && video[key].bytesReceived != 0, ID);
            }
          });
        }, 100);
      }, 3000),
    });
    userBox.hide();
  }
  for (let index = 0; index < meet_layout.pageUserList.length; index++) {
    const { ID } = meet_layout.pageUserList[index];
    $('#box_' + ID).css('animationDelay', (8 * index) / 100 + 's');
    $('#box_' + ID).show();
  }
}

let startX = 0;
let startY = 0;

/* 当用户触摸屏幕时调用的函数。 */
$('#mic_drag').on('touchstart', function (event) {
  const element = event.targetTouches[0];
  // 初始化位置
  startX = element.pageX - this.offsetLeft;
  startY = element.pageY - this.offsetTop;
  return false;
});

/**
 * 如果用户正在拖动麦克风，则将麦克风移动到用户的手指位置。
 * @param event - 事件对象。
 * @returns 错误的。
 */
function touchMove(event) {
  const element = event.targetTouches[0];
  var x = element.clientX - startX;
  var y = element.clientY - startY;
  const dragWidth = $('#mic_drag').innerWidth();
  const dragHeight = $('#mic_drag').innerHeight();
  const parentWidth = $('body').innerWidth();
  const parentHeight = $('body').innerHeight();
  if (y <= 0) {
    y = 1;
  }
  if (y >= parentHeight - dragHeight) {
    y = parentHeight - dragHeight;
  }
  if (x <= 0) {
    x = 1;
  }
  if (x >= parentWidth - dragWidth) {
    x = parentWidth - dragWidth - 1;
  }
  $('#mic_drag').css({
    left: x + 'px',
    top: y + 'px',
  });
  return false;
}

/**
 * 当用户停止触摸屏幕时，停止监听 mousemove 和 mouseup 事件。
 * @param event - 事件对象。
 */
function touchEnd(event) {
  $('body').unbind('mousemove');
  $('body').unbind('mouseup');
}
