/**
 * * 根据当前用户权限显示或者隐藏按钮
 * * 如果用户是主讲人，则打开麦克风和摄像头。
 */
function showOrHide() {
  // 是否显示申请发言按钮
  if (
    roomDetail.AllowProposer == 1 &&
    !meetInfo.IsZCR &&
    meetInfo.CHID != roomDetail.SpeakerID
  ) {
    $('#shenqingfayan_foot_btn').show();
  } else {
    $('#shenqingfayan_foot_btn').hide();
  }

  if (roomDetail.CJRLX == 2) {
    $('qiehuanmoshi_foot_btn').hide();
  } else {
    $('qiehuanmoshi_foot_btn').show();
    if (roomDetail.UserList.length > 25) {
      $('#qiehuanxiaoshipin_btn').hide();
    } else {
      $('#qiehuanxiaoshipin_btn').show();
    }
  }

  // 如果是主持人的话主持人相关权限按钮显示
  if (meetInfo.IsZCR) {
    $('#fayanliebiao_foot_btn').show();
    $('#guanbimaikefeng_foot_btn').show();
    hideFanye(false);
    $('#fayanliebiao_foot_btn').show();
    $('#wuzhujiangren_foot_btn').show();
    $('#qiehuanmoshi_foot_btn').show();
  } else {
    $('.tidiao_btn').remove();
    $('.shezhizhujiangren_member_btn').remove();
    $('.quxiaozhujiangren_member_btn').remove();
    $('.faxiaoxi_member_btn').remove();
  }

  // 大屏版不显示以下按钮
  if (window.WSLLZWinFrom) {
    $('#qiehuanquanping_btn').hide();
    $('#xiaoxi_foot_btn').hide();
    hideFanye(true);
    $('#wuzhujiangren_foot_btn').hide();
    $('#guanbimaikefeng_foot_btn').hide();
    $('#shenqingfayan_foot_btn').hide();
    $('#fayanliebiao_foot_btn').hide();
    $('#fanzhuan_btn').hide();
  }

  if (isZhuBo() && roomDetail.IsZBMS == MODE_STATE.开启) {
    $('#kaiqizhibo_btn').show();
  }

  $('.onlineDiv').show();
  changeMemberNameColor(meetInfo.CHID, true);

  if (roomDetail.IsZBMS == MODE_STATE.开启 || roomDetail.UserList.length > 200) {
    // 如果是直播模式或者总人数大于200人不显示参会人员列表按钮和列表，判断大于200人不显示的原因是以防人数太多但是未开启直播模式导致渲染dom太多卡住
    $('#canyuzhe_foot_btn').hide();
  }

  $('#mic_drag').show();

  // 等全部该显示的不该显示的逻辑处理完再显示操作栏
  hideToolBar(
    localStorage.getItem('hideToolBar') == 'true' ||
      !localStorage.getItem('hideToolBar')
  );
}

/**
 * 它将发言人添加到发言人列表中。
 * @param fayanrenId - 说话人的id
 */
function addSpeaker(fayanrenId) {
  let fayanren = $('#fayan_muban').clone();
  fayanren.attr('id', 'fayan_' + fayanrenId);
  fayanren.find('.fayanrenxingming').html(getUserInfo(fayanrenId).UserName);
  fayanren.appendTo($('#speakerList'));
  $('#speakerList').scrollTop(99999999);
  fayanren.show();
  // 绑定允许发言事件，为按钮绑定ID
  fayanren.find('.yunxufayan').on('click', function () {
    chclient.redis.yunxufayan(fayanrenId);
    chclient.redis.shezhizhujiangren(fayanrenId);
    $('#fayan_' + fayanrenId).remove();
  });
  // 绑定不允许发言事件，为按钮绑定ID
  fayanren.find('.buyunxufayan').on('click', function () {
    $('#fayan_' + fayanrenId).remove();
  });
  // 如果申请发言列表为没有打开的状态，显示发言列表的角标提醒
  $('#shenqingfayanliebiao').css('display') == 'none' &&
    $('#fayan_jiaobiao').show();
}

/**
 * 增加消息到消息列表
 *
 * 它接受三个参数，然后克隆一个模板，设置一些属性，然后将其附加到 DOM
 * @param fasongren - 发件人
 * @param jieshouren - 接收消息的人
 * @param neirong - 消息的内容
 */
function addMessage(fasongren, jieshouren, neirong) {
  const message = $('#message_muban').clone();
  message.attr('id', 'message_' + fasongren);
  message.find('.message_xingming').html(getUserInfo(fasongren).UserName);
  message.find('.message_time').html(getNowTime());
  message
    .find('.message_neirong')
    .html(
      neirong +
        ' (发送到：' +
        (fasongren == ZCRID_
          ? jieshouren
            ? getUserInfo(jieshouren).UserName
            : '全部人'
          : '主持人') +
        ')'
    );
  message.appendTo($('#messageList'));
  if (fasongren != meetInfo.CHID) {
    var touxiang = message.find('.message_touxiang');
    touxiang.prev().insertAfter(touxiang);
    message
      .find('.message_info')
      .removeClass('justify-end')
      .addClass('justify-start');
  }
  message.fadeIn();
  $('#messageList').scrollTop(99999999);

  if (
    $('#xiaoxiliebiao').css('display') == 'none' &&
    !neirong.includes('我的麦克风状态')
  ) {
    $('#xiaoxi_jiaobiao').fadeIn();
    $('.gundongxiaoxi').html(neirong);
    $('.gundongxiaoxi').fadeIn();
    setTimeout(() => {
      $('.gundongxiaoxi').fadeOut();
    }, 7 * 1000);
  }
}

/**
 * 添加用户到参与者列表中
 */
function addMember() {
  if (roomDetail.IsZBMS == MODE_STATE.开启 || roomDetail.UserList.length > 200) return;
  // 当主持人永远显示第一个位置
  if (roomDetail.SpeakerID != ZCRID_) {
    let memberEl = addMemberView(ZCRID_, getUserInfo(ZCRID_).UserName);
    memberEl.appendTo($('#member-list'));
  }
  // 主讲人显示第二个位置
  if (roomDetail.SpeakerID) {
    let memberEl = addMemberView(
      roomDetail.SpeakerID,
      getUserInfo(roomDetail.SpeakerID).UserName
    );
    memberEl.appendTo($('#member-list'));
  }
  for (let user of roomDetail.UserList) {
    // 跳过主持人和主讲人
    if (user.ID == ZCRID_ || user.ID == roomDetail.SpeakerID) {
      userIsOnline(user.ID) && changeMemberNameColor(user.ID, true);
      continue;
    }
    const { ID, UserName } = user;
    let memberEl = addMemberView(ID, UserName);
    memberEl.appendTo($('#member-list'));
    userIsOnline(user.ID) && changeMemberNameColor(user.ID, true);
  }
  // 添加人数统计
  $('.canyuzhe-title').html(`参与者列表（${roomDetail.UserList.length}）`);
}

/**
 * * 参会端和显示端布局和页面用户列表计算，手机端不改变小视频区域网格布局
 */
function layoutCompute() {
  if (display_layout.mode == 2) {
    display_layout.cols = meet_layout.cols;
    display_layout.rows = meet_layout.rows;
  }
  if (display_layout.mode == 1) {
    display_layout.cols = 0;
    display_layout.rows = 0;
  }
  if (meet_layout.mode == MEET_MODE.主讲人加小视频) {
    meet_layout.rows = roomDetail.CHRY_ShowRows;
    meet_layout.cols = roomDetail.CHRY_ShowCols;
  }
  if (meet_layout.mode == MEET_MODE.主讲人 && !版本.手主小()) {
    meet_layout.cols = 0;
    meet_layout.rows = 0;
  }
  if (meet_layout.mode == MEET_MODE.小视频) {
    meet_layout.cols = 5;
    meet_layout.rows = 5;
  }
  if (版本.手小() && meet_layout.mode == MEET_MODE.小视频) {
    meet_layout.rows = 3;
    meet_layout.cols = 2;
  }

  const meetPageSize = meet_layout.rows * meet_layout.cols;
  meet_layout.pageCount = Math.ceil(roomDetail.UserList.length / meetPageSize);
  meet_layout.pageUserList = roomDetail.UserList.slice(
    meet_layout.pageNo * meetPageSize,
    (meet_layout.pageNo + 1) * meetPageSize
  );

  const displayPageSize = display_layout.rows * display_layout.cols;
  display_layout.pageCount = Math.ceil(
    roomDetail.UserList.length / displayPageSize
  );
  display_layout.pageUserList = roomDetail.UserList_Show.slice(
    display_layout.pageNo * displayPageSize,
    (display_layout.pageNo + 1) * displayPageSize
  );

  // 参会端主讲人加小视频、显示端主讲人加小视频、手机端小视频
  if (版本.参主小() || 版本.显主小() || 版本.手小()) {
    const percentage = 100 / meet_layout.rows;
    $('#video-grid')
      .css('grid-template-columns', 'repeat(' + meet_layout.cols + ', 1fr)')
      .css(
        'grid-template-rows',
        'repeat(' + meet_layout.rows + ', ' + percentage + '%)'
      );

    // 有多余的视频的时候让左边空出来的而不是右边空出来的代码
    /*const userCount = roomDetail.UserList.length;
    // 一页的余数
    const pageRemainder = userCount % meetPageSize;
    // 横向的余数
    const yushu = userCount % meet_layout.cols;
    let yi =
      meet_layout.rows -
      Math.floor((meetPageSize - pageRemainder) / meet_layout.cols);
    let er = meet_layout.cols;
    let si = meet_layout.cols;
    for (let index = 1; index <= yushu; index++) {
      let document = $('#video-grid > div')[userCount - index];
      $(document).css('grid-area', `${yi}/${er--}/${yi}/${si--}`);
    }*/
  }
}

/**
 * 清空小视频和主讲人盒子
 *
 * 它从 DOM 中删除 ID 为“profile_”、“box_”、“mask_”、“profile_”和“member_”的所有元素。
 */
function resetViews() {
  for (let user_ of roomDetail.UserList) {
    const { ID } = user_;
    $('#box_' + ID).remove();
    $('#mask_' + ID).remove();
    $('#profile_' + ID).remove();
    $('#member_' + ID).remove();
  }
}

/**
 * * 麦克风开关状态控制
 * * 如果用户打开，则将图像更改为打开，否则将图像更改为关闭。
 * @param {boolean} on - true/false，麦克风是打开还是关闭
 * @param {string} userId - 正在讲话的用户的用户 ID
 * @param {boolean} [noLog=false] - 是否记录操作
 */
function audioHandle(on, userId, noLog = false) {
  !noLog &&
    console.log(
      `${getUserInfo(userId) ? getUserInfo(userId).UserName : '显示端'} ${
        on ? '打开' : '关闭'
      }了麦克风`
    );
  // 更改参与者列表里面的麦克风状态
  if (userId == meetInfo.CHID && !deviceUsable.mic) {
    xiugaicanyuzhemaikefeng('error', userId);
  } else {
    xiugaicanyuzhemaikefeng(on, userId);
  }
  $(`#mic_main_${userId} .audio_member_btn`).attr(
    'src',
    `img/mic-${on ? 'on' : 'off'}.png`
  );
}

/**
 * * 视频开关状态控制
 * * 如果用户是演讲者，则显示视频，否则隐藏它
 * @param {boolean} on - 真/假，相机是打开还是关闭
 * @param {string} userId - 打开或关闭摄像头的用户的用户 ID。
 * @param {boolean} noLog - 是否记录操作
 */
function videoHandle(on, userId, noLog = false) {
  var zjr = roomDetail.SpeakerID || (版本.显主小() ? ZCRID_ : meetInfo.CHID);

  !noLog &&
    console.log(
      `${getUserInfo(userId) ? getUserInfo(userId).UserName : '显示端'} ${
        on ? '打开' : '关闭'
      }了摄像头`
    );

  // 更改参与者列表里面的摄像头状态
  if (userId == meetInfo.CHID && !deviceUsable.camera) {
    xiugaicanyuzheshexiangtou('error', userId);
  } else {
    xiugaicanyuzheshexiangtou(on, userId);
  }

  // 如果关闭摄像头，将摄像头改为绿色
  if (userId == meetInfo.CHID || rtc.members_.get(userId)) {
    $(`#mask_${userId} img`).attr('src', `./img/camera-green.png`);
    // zhezhaozhuangtai(true, userId);
    if (!userHasAudio(userId)) {
      zhezhaozhuangtai('audio', userId);
    } else {
      zhezhaozhuangtai(true, userId);
    }
  }

  if (userId == zjr) {
    if (on && userHasVideo(userId)) {
      if (版本.参主小() || 版本.显主小()) {
        jiequtuxiang(userId);
      } else {
        $('#mask_' + userId).hide();
      }
      $('#zjr_mask').hide();
    } else {
      videoImgTimer && clearInterval(videoImgTimer);
      $('#img_' + userId).hide();
      $('#zjr_mask').show();
    }
    userIsOnline(userId) &&
      $(`#zjr_mask img`).attr('src', `./img/camera-green.png`);
  } else {
    $('#img_' + userId).hide();
  }

  on && userHasVideo(userId)
    ? $('#mask_' + userId).hide()
    : $('#mask_' + userId).show();
}

/**
 * * 截取主讲人一帧图片作为小视频封面
 * @param {string} userId - 用户ID
 */
function jiequtuxiang(userId) {
  // 隔多久截一次
  const 间隔时间 = 4 * 1000;
  const stream =
    userId == meetInfo.CHID ? rtc.localStream_ : rtc.members_.get(userId);

  $('#mask_' + userId).hide();
  $('#img_' + userId).show();

  let videoFrame = '';
  videoImgTimer && clearInterval(videoImgTimer);
  function getVideoFrame() {
    if (!stream.isPlaying_) {
      return;
    }
    setTimeout(() => {
      videoFrame = stream.getVideoFrame();
      if (videoFrame && videoFrame != 'data:,') {
        // $('#mask_' + userId).hide();
        $('#img_' + userId)
          .attr('src', videoFrame)
          .show();
      } else {
        getVideoFrame();
      }
    }, 30);
  }
  getVideoFrame();
  videoImgTimer = setInterval(() => {
    ((版本.参主小() && meet_layout.mode == MEET_MODE.主讲人加小视频) ||
      (版本.显主小() && display_layout.mode == MEET_MODE.主讲人加小视频)) &&
      !changeZJRTimer &&
      getVideoFrame();
  }, 间隔时间);
}

/**
 * * 设置网页标题、网页页头标题
 * @param {string} Title - 房间的标题。
 */
function setTitle(Title) {
  $('title').html(Title);
  $('#roomTitle').html(Title);
  $('#roomTitle').attr('title', Title);
  changeTitleFontSize();
}

/**
 * * 添加成员列表
 * @param {string} ID - The ID of the member to add.
 * @param {string} UserName - The name of the user to add to the member list.
 * @returns {JQuery<HTMLElement>}
 */
function addMemberView(ID, UserName) {
  // meetInfo.IsZCR = true;
  let member = $('#member-me').clone();
  member.attr('id', 'member_' + ID);
  member.find('.member-id').html(
    (ID == roomDetail.SpeakerID && !版本.参小()
      ? `<svg class="icon text-[0.9rem] text-[#ffa500] mr-1" aria-hidden="true">
          <use xlink:href="#icon-zhujiangren"></use>
        </svg>`
      : `<span class="mr-[1.15rem]"></span>`) + UserName
  );

  if (ID == ZCRID_) {
    member.find('.faxiaoxi_member_btn').remove();
    member.find('.tidiao_btn').remove();
  } else {
    member.find('.tidiao_btn').on({
      click: clickProof(async () => {
        if (!userIsOnlineByHas(ID)) {
          layer.msg('不能对离线用户进行操作');
          return;
        }
        chclient.redis.tidiao(ID);
      }),
    });
    member.find('.faxiaoxi_member_btn').on({
      click: async () => {
        if (!userIsOnlineByHas(ID)) {
          layer.msg('不能对离线用户进行操作');
          return;
        }
        fasonggeishei = ID;
        $('#xiaoxi_foot_btn').click();
      },
    });
  }

  if (ID == roomDetail.SpeakerID) {
    member.find('.shezhizhujiangren_member_btn').remove();
    member.find('.quxiaozhujiangren_member_btn').on({
      click: clickProof(() => {
        chclient.redis.quxiaozhujiangren();
      }, 1200),
    });
  } else {
    member.find('.quxiaozhujiangren_member_btn').remove();
    member.find('.shezhizhujiangren_member_btn').on({
      click: clickProof(async () => {
        if (!userIsOnlineByHas(ID)) {
          layer.msg('不能对离线用户进行操作');
          return;
        }
        chclient.redis.shezhizhujiangren(ID);
      }, 1200),
    });
  }

  member.find('.video_member_btn').on({
    click: clickProof(async () => {
      if (!meetInfo.IsZCR) {
        return;
      }
      if (member.find('.video_member_btn').attr('src').includes('error')) {
        layer.msg('该用户没有摄像头');
        return;
      }
      if (!userIsOnlineByHas(ID)) {
        layer.msg('不能对离线用户进行操作');
        return;
      }
      chclient.redis.dakaiguanbishexiangtou(ID);
      xiugaicanyuzheshexiangtou(
        member.find('.video_member_btn').attr('src') == 'img/camera-off.png',
        ID
      );
    }),
  });
  member.find('.audio_member_btn').on({
    click: clickProof(async () => {
      if (!meetInfo.IsZCR) {
        return;
      }
      if (member.find('.audio_member_btn').attr('src').includes('error')) {
        layer.msg('该用户没有麦克风');
        return;
      }
      if (!userIsOnlineByHas(ID)) {
        layer.msg('不能对离线用户进行操作');
        return;
      }
      chclient.redis.dakaiguanbimaikefeng(ID);
      xiugaicanyuzhemaikefeng(
        member.find('.audio_member_btn').attr('src') == 'img/mic-off.png',
        ID
      );
    }),
  });

  // 如果不在线就不显示操作栏
  !userIsOnlineByHas(ID) && member.find('.member-right').hide();

  member.show();
  return member;
}

/**
 * * 添加视频占位
 * @param {string} ID - The user ID of the user you want to add.
 * @param {string} NickName - the nickName of the user
 * @returns {JQuery<HTMLElement>} 用户div
 */
function addVideoView(ID, NickName) {
  const template = $(videoBoxTemplateElement(ID, NickName));
  $('#video-grid').append(template);
  zhezhaozhuangtai(userIsOnline(ID), ID, template.find(`#mask_${ID} div`));
  return template;
}

/**
 * * 其他用户在线或者离线后页面的改变，不包括自己
 * @param {boolean} online 在线还是离线
 * @param {string} userId 用户id
 */
function onlineOrOfline(online, userId) {
  const zjr = roomDetail.SpeakerID || meetInfo.CHID;

  // 针对主讲人在线或离线时的状态改变
  if (userId == zjr) {
    if (!online) {
      videoImgTimer && clearInterval(videoImgTimer);
      $('#img_' + userId).hide();
      $('#mask_' + userId).show();
    }
  }

  changeMemberNameColor(userId, online);
  if (online) {
    $(`#member_${userId} .member-right`).css('display', 'flex');
  } else {
    $(`#mic_main_${userId} .audio_member_btn`).attr('src', 'img/mic-on.png');
    xiugaicanyuzhemaikefeng(true, userId);
    xiugaicanyuzheshexiangtou(true, userId);
    $(`#mic_main_${userId} .volume-level`).css('height', '0%');
    $(`#fayan_${userId}`).remove();
    if ($('#speakerList > div').length == 1) {
      $('#fayan_jiaobiao').hide();
    }
    $(`#member_${userId} .member-right`).hide();
  }

  zhezhaozhuangtai(online, userId);
}

/**
 * 设置视频图像
 * @param {TRTC.RemoteStream|TRTC.LocalStream} stream
 * @returns {Promise<void> | boolean}
 */
function setVideoImg(stream) {
  if (
    !stream ||
    (stream.name_ != 'LocalStream' && !stream.isSubscribed) ||
    !stream.hasVideo()
  ) {
    return false;
  }
  return new Promise(async (resolve, reject) => {
    const userId = stream.getUserId();
    await sleep(25);
    const videoFrame = stream.getVideoFrame();
    if (videoFrame && videoFrame != 'data:,') {
      $('#img_' + userId).attr('src', videoFrame);
      setVideoImgFailCount = 0;
      resolve();
    } else {
      if (setVideoImgFailCount <= 10) {
        setVideoImgFailCount++;
        return setVideoImg(stream);
      } else {
        setVideoImgFailCount = 0;
        resolve();
      }
    }
  });
}

/**
 * * 改变用户列表用户在线状态颜色
 * * 更改会议中参会用户列表
 * @param {string} userId
 * @param {boolean} online
 */
async function changeMemberNameColor(userId, online) {
  $('#member_' + userId)
    .find('.member-id')
    .attr('style', `color: ${online ? '#ffffff;' : '#7c7f85;'};`);
}

/**
 * * 隐藏或取消隐藏header
 * @param {boolean} hide
 */
function hideHeaderAndToolBar(hide = true) {
  if (hide) {
    $('header').fadeOut();
    $('section').removeClass('section-heght');
    $('section').addClass('h-full');
    hideToolBar(true);
  } else {
    $('header').fadeIn();
    $('section').removeClass('h-full');
    $('section').addClass('section-heght');
    hideToolBar(false);
  }
}

/**
 * * 修改标题字体大小
 * * 它获取标题的宽度，如果它大于正文宽度的 75%，它将字体大小减小 0.05rem，直到小于正文宽度的 75%。
 */
function changeTitleFontSize() {
  if (isPC()) {
    let fontSize = 1.9;
    const 百分比 = 0.75;
    $('#roomTitle').css('font-size', fontSize + 'rem');
    while ($('#roomTitle').width() / $('body').width() >= 百分比) {
      fontSize = fontSize - 0.05;
      $('#roomTitle').css('font-size', fontSize + 'rem');
      if (fontSize <= 0.1) {
        break;
      }
    }
  }
}

/**
 * 是否隐藏菜单栏翻页按钮
 * @param {boolean} hide
 */
function hideFanye(hide = true) {
  if (meet_layout.mode == MEET_MODE.主讲人 && !hide) return;
  if (hide) {
    $('#xiayiye_foot_btn').hide();
    $('#shangyiye_foot_btn').hide();
  } else {
    $('#xiayiye_foot_btn').show();
    $('#shangyiye_foot_btn').show();
  }
}

/**
 * * 修改遮罩里的图标、文字状态
 * @param {boolean|'audio'} online - 在线
 * @param {string} userId - 用户标识
 * @param {JQuery<HTMLElement>?} maskDom
 */
function zhezhaozhuangtai(online, userId, maskDom = null) {
  const zjr = roomDetail.SpeakerID || (版本.显主小() ? ZCRID_ : meetInfo.CHID);
  const maskDomTemp = maskDom || $(`#mask_${userId} div`);

  maskDomTemp.html(online ? '音频在线' : '离线');
  if (online == 'audio') {
    // 没有麦克风的状态
    maskDomTemp.attr('style', `color: #8E919A; font-weight: bold;`);
  } else {
    maskDomTemp.attr(
      'style',
      `color: ${online ? '#337c33' : '#3e414b'}; font-weight: bold;`
    );
  }
  // maskDomTemp.attr('style', `color: ${online ? '#337c33' : '#3e414b'}; font-weight: bold;`);

  // 改变遮罩摄像头图片颜色
  $(`#mask_${userId} img`).attr(
    'src',
    `./img/camera-${online ? 'green' : 'gray'}.png`
  );

  if (userId == zjr) {
    // 改变主讲人遮罩摄像头图片颜色
    $(`#zjr_mask img`).attr(
      'src',
      `./img/camera-${online ? 'green' : 'gray'}.png`
    );
    $(`#zjr_mask div`).html(online ? '音频在线' : '离线');
    if (online == 'audio') {
      // 没有麦克风的状态
      $(`#zjr_mask div`).attr(
        'style',
        `color: #8E919A; font-weight: bold; font-size: 30px;`
      );
    } else {
      $(`#zjr_mask div`).attr(
        'style',
        `color: ${
          online ? '#337c33' : '#3e414b'
        }; font-weight: bold; font-size: 30px;`
      );
    }
    // $(`#zjr_mask div`).attr('style', `color: ${online ? '#337c33' : '#3e414b'}; font-weight: bold; font-size: 30px;`);
  }
}

/**
 * * 修改参与者麦克风状态
 * @param {boolean|'error'} on 麦克风是打开还是关闭或者错误
 * @param {string} userId 正在打开或关闭其麦克风的用户的用户 ID。
 */
function xiugaicanyuzhemaikefeng(on, userId) {
  let icon = '';
  if (on == 'error') {
    icon = 'error';
  } else {
    icon = on ? 'on' : 'off';
  }
  $('#member_' + userId)
    .find('.audio_member_btn')
    .attr('src', `img/mic-${icon}.png`);
}

/**
 * * 修改参与者摄像头状态
 * @param {boolean|'error'} on 相机是打开还是关闭或者错误
 * @param {string} userId 正在打开或关闭其相机的用户的用户 ID。
 */
function xiugaicanyuzheshexiangtou(on, userId) {
  let icon = '';
  if (on == 'error') {
    icon = 'error';
  } else {
    icon = on ? 'on' : 'off';
  }
  $('#member_' + userId)
    .find('.video_member_btn')
    .attr('src', `img/camera-${icon}.png`);
}

/**
 * * 更新主讲人信息
 * * 移除原主讲人相关信息、添加新的主讲人相关信息
 * @param {string} newZJRID - 视频要在主视频区域显示的用户的用户ID。
 * @param {boolean?} clear 清除视频播放容器
 */
async function updateZJRBox(newZJRID, clear = true) {
  // 这里的ZJRID_是原主讲人，上一个主讲人
  // o比作上一个主讲人
  // 重置上一个人在参与者列表的位置和主讲人标识
  const oldZJRID = ZJRID_;

  // 重置上一个主讲人的参与者列表状态
  if (版本.参主小() || 版本.参小()) {
    const oldZjrEl = $('#member_' + oldZJRID);
    $('#member_' + oldZJRID).remove();
    let oldZjrMemberEl = addMemberView(
      oldZJRID,
      getUserInfo(oldZJRID).UserName
    );
    let o的序号 = getUserInfo(oldZJRID).XUHAO;
    if (oldZJRID == ZCRID_) {
      $('#member-list').prepend(oldZjrMemberEl);
    } else {
      const o的上一个人的ID = roomDetail.UserList.find(
        (item) => item.XUHAO == o的序号 - 1
      ).ID;
      $('#member_' + o的上一个人的ID).after(oldZjrMemberEl);
    }
    const oldZjrElVSrc = oldZjrEl.find('.video_member_btn').attr('src');
    if (oldZjrElVSrc && oldZjrElVSrc.includes('error')) {
      xiugaicanyuzheshexiangtou('error', oldZJRID);
    }
    const oldZjrElASrc = oldZjrEl.find('.audio_member_btn').attr('src');
    if (oldZjrElASrc && oldZjrElASrc.includes('error')) {
      xiugaicanyuzhemaikefeng('error', oldZJRID);
    }
  }
  // 在线的话就改变颜色
  userIsOnlineByHas(oldZJRID) && changeMemberNameColor(oldZJRID, true);

  // 还原原主讲人小视频区域的音量高度
  $(`#box_${newZJRID} .volume-level`).css('height', '0%');
  if (clear) {
    $("#zjr_video [id^='profile_']").remove();
    $("#zjr_video [id^='player_']").remove();
  }
  $(`#zjr_mask img`).attr('src', `./img/camera-gray.png`);
  $(`#zjr_mask div`)
    .html('离线')
    .css('color', '#3e414b')
    .css('font-weight', 'bold');

  // const exits = await userIsOnlineByTRTC(newZJRID)
  const exits = userIsOnlineByHas(newZJRID);
  // 添加新的主讲人的信息
  $('#zjr_video').append(
    userInfoTemplateElement(
      newZJRID,
      getUserInfo(newZJRID) ? getUserInfo(newZJRID).UserName : '显示端'
    )
  );
  // exits && zhezhaozhuangtai(true, newZJRID);
  if (exits) {
    if (!userHasAudio(newZJRID)) {
      zhezhaozhuangtai('audio', newZJRID);
    } else {
      zhezhaozhuangtai(true, newZJRID);
    }
  }

  // 修改新主讲人的参与者列表状态
  if (版本.参主小() || 版本.参小()) {
    // 将新的主讲人添加到参与者列表
    let newZjrEl = $('#member_' + newZJRID);
    $('#member_' + newZJRID).remove();
    let newZjrMemberEl = addMemberView(
      newZJRID,
      getUserInfo(newZJRID).UserName
    );
    if (newZJRID == ZCRID_) {
      $('#member-list').prepend(newZjrMemberEl);
    } else {
      $('#member_' + ZCRID_).after(newZjrMemberEl);
    }
    const newZjrElVSrc = newZjrEl.find('.video_member_btn').attr('src');
    if (newZjrElVSrc && newZjrElVSrc.includes('error')) {
      xiugaicanyuzheshexiangtou('error', newZJRID);
    }
    const newZjrElASrc = newZjrEl.find('.audio_member_btn').attr('src');
    if (newZjrElASrc && newZjrElASrc.includes('error')) {
      xiugaicanyuzhemaikefeng('error', newZJRID);
    }
  }
  // 在线的话就改变颜色
  userIsOnlineByHas(newZJRID) && changeMemberNameColor(newZJRID, true);
}

/**
 * * 如果浏览器支持全屏API，则请求全屏
 */
function requestFullscreen() {
  const docElm = document.documentElement;
  if (docElm.requestFullscreen) {
    docElm.requestFullscreen();
  } else if (docElm.msRequestFullscreen) {
    docElm.msRequestFullscreen();
  } else if (docElm.mozRequestFullScreen) {
    docElm.mozRequestFullScreen();
  } else if (docElm.webkitRequestFullScreen) {
    docElm.webkitRequestFullScreen();
  }
}

/**
 * * 如果浏览器支持退出全屏模式，则退出全屏模式
 */
function exitFullScreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
}

/**
 * * 隐藏或取消隐藏小视频区域
 * @param {boolean} hide
 */
function hideXiaoshipin(hide = true) {
  const 动画时长 = 200;
  return new Promise((resolve, reject) => {
    if (hide) {
      $('#zjr_box').animate({ width: '100%' }, 动画时长);
      $('#video-grid').animate({ marginRight: '-20%' }, 动画时长);
    } else {
      $('#zjr_box').animate({ width: '80%' }, 动画时长);
      $('#video-grid').animate({ marginRight: '0%' }, 动画时长);
    }
    setTimeout(() => {
      resolve();
    }, 动画时长);
  });
}

/**
 * * 隐藏或取消隐藏底部操作栏
 * @param {boolean} hide
 */
function hideToolBar(hide = true) {
  if (hide) {
    $('#toolbar').fadeOut();
  } else {
    $('#toolbar').fadeIn();
  }
  localStorage.setItem('hideToolBar', hide.toString());
}

/**
 * * 监听音量回调
 */
function yinlianghuidiao(result) {
  result.forEach(({ userId, audioVolume, stream }) => {
    if (audioVolume >= 5) {
      $(`#mic_main_${userId}`)
        .find('.volume-level')
        .css('height', `${audioVolume * 2.5}%`);
      $(`#mic_drag`)
        .find('.nickname')
        .html(getUserInfo(userId).UserName + ' 正在讲话');
    } else {
      $(`#mic_main_${userId}`).find('.volume-level').css('height', `0%`);
    }
  });
}

/**
 * 设备是否正常
 * @param {boolean} normal
 * @param {'mic'|'camera'} state
 */
function deviceIsNormal(normal, state) {
  if (normal) {
    $('#testing_btn').attr('src', './img/check-mic.png');
  } else {
    $('#testing_btn').attr('src', './img/warning.png');
    state == 'camera' && xiugaicanyuzheshexiangtou('error', meetInfo.CHID);
    state == 'mic' && xiugaicanyuzhemaikefeng('error', meetInfo.CHID);
  }
  state == 'mic' && (deviceUsable.mic = normal);
  state == 'camera' && (deviceUsable.camera = normal);
}
