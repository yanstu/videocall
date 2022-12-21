/**
 * 推送或取消推送
 */
async function isTuisong() {
  const config = {
    audio: true,
    video: true,
    cameraId,
    microphoneId: micId,
    userId: meetInfo.CHID,
    mirror: false, // 是否开启镜像
  };
  if (roomDetail.SpeakerID == meetInfo.CHID || hasMe(meetInfo.CHID)) {
    if (!rtc.isPublished_) {
      if (!rtc.isJoined_) {
        await rtc.join();
      }
      await rtc.setStream(config);
      rtc.publish();
      setVolumeLevel()
    }
    //  如果用户是主讲人的话开启音频，如果只是翻到了用户则关闭音频
    if (roomDetail.SpeakerID == meetInfo.CHID) {
      unmuteAudio()
    } else {
      muteAudio()
    }
  } else {
    // 取消推送并且离开房间
    if (rtc.isPublished_) {
      rtc.leave();
    }
  }
}

/**
 * * 切换横屏播放
 */
function rotateVideo() {
  const myVideo = document.getElementById('container');
  const w = document.documentElement.clientWidth || document.body.clientWidth;
  const h = document.documentElement.clientHeight || document.body.clientHeight;
  const cha = Math.abs(h - w) / 2;
  myVideo.style.width = h + 'px';
  myVideo.style.height = w + 'px';
  myVideo.style.top = 0;
  myVideo.style.transform =
    'translate(-' + cha + 'px,' + cha + 'px) rotate(90deg)';
}
/**
 * * 恢复竖屏播放
 */
function restoreVideo() {
  const myVideo = document.getElementById('container');
  myVideo.style.width = '100%';
  myVideo.style.height = '100%';
  myVideo.style.transform = 'translate(-' + 0 + 'px,' + 0 + 'px) rotate(0deg)';
}

/**
 * * 系统横竖屏控制
 */
function orientationchange() {
  try {
    if (
      document.documentElement.clientHeight <
      document.documentElement.clientWidth
    ) {
      $('header').hide();
      $('section').addClass('h-full');
      restoreVideo();
      live.requestFullscreen();
    } else {
      $('header').show();
      $('section').romoveClass('h-full');
    }
  } catch (error) { }
}
