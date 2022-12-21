/**
 * 对视图进行处理
 */
async function viewsHandle() {
  layoutCompute();
  // 处理布局相关
  sortView();
  ZJRID_ = roomDetail.SpeakerID;
  // 为当前页用户循环添加至网页上
  addView();
  await rtc.join();

  setTimeout(() => {
    // 开始定时10秒获取更新用户的状态并更新
    chclient.redis.huoquyonghuzhuangtai();
  }, 100);
}

async function addView() {
  // const trtcuserlist = await rtc.client_.getUserList()
  for (let index = 0; index < roomDetail.UserList.length; index++) {
    const user_ = roomDetail.UserList[index];
    const { ID, UserName } = user_;
    const userBox = addVideoView(ID, UserName);
    userBox.attr(
      'class',
      'w-full h-full video-box relative box-border border-[2px] border-[#393e4b]'
    );
    userBox.css('animationDelay', (6 * index) / 100 + 's');
    getUserInfoByMeet(ID) && userBox.show();
    if (userIsOnlineByHas(ID)) {
      if (!userHasAudio(ID)) {
        zhezhaozhuangtai('audio', ID);
      } else {
        zhezhaozhuangtai(true, ID);
      }
    }
  }
  addMember();
}

function sortView() {
  for (let index = 4; index >= 0; index--) {
    if (roomDetail.UserList.length > index * index) {
      $('#video-grid').attr(
        'class',
        `box-border grid w-full h-full items-center justify-center z-10`
      );
      $('#video-grid').attr(
        'style',
        `grid-template-columns: repeat(${
          index + 1
        }, minmax(0, 1fr));grid-template-rows: repeat(${
          index + 1
        }, minmax(0, 1fr));`
      );
      break;
    }
  }
}

// 查询房间是否包含该用户
function RoomhasMe(userId) {
  var exist = roomDetail.UserList.find((user) => user.ID == userId);
  return !!exist;
}
