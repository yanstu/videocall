/**
 * 对视图进行处理
 */
async function viewsHandle() {
  layoutCompute();
  // 用于翻页、取消主讲人、更改主讲人的处理，清空用户下面再添加进去
  resetViews();
  // 处理布局相关
  sortView();
  // 为当前页用户循环添加至网页上
  addView();
  await rtc.leave();
  await rtc.join();

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
  for (let index = 0; index < roomDetail.UserList_Show.length; index++) {
    const { ID } = roomDetail.UserList_Show[index];
    $('#box_' + ID).hide();
  }
  for (let index = 0; index < display_layout.pageUserList.length; index++) {
    const { ID } = display_layout.pageUserList[index];
    $('#box_' + ID).css('animationDelay', (6 * index) / 100 + 's');
    $('#box_' + ID).show();
  }
  for (const user of display_layout.pageUserList) {
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

async function addView() {
  for (let index = 0; index < roomDetail.UserList_Show.length; index++) {
    const { ID, UserName } = roomDetail.UserList_Show[index];
    const userBox = addVideoView(ID, UserName);
    userBox.attr(
      'class',
      'w-full h-full video-box relative box-border border-[2px] border-[#393e4b]'
    );
    userBox.hide();
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
}

function sortView() {
  $('#video-grid').attr(
    'class',
    `box-border grid w-full h-full items-center justify-center z-10`
  );
  $('#video-grid').attr(
    'style',
    `grid-template-columns: repeat(${display_layout.cols}, minmax(0, 1fr));grid-template-rows: repeat(${display_layout.rows}, minmax(0, 1fr));`
  );
}
