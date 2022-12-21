(() => {
  window.onload = function () {
    JSON.parse(localStorage.getItem('enableVconsole')) && enableEruda();

    // 追加节点
    $('body').append(jiancetanchuangElement());
    $('body').append(buzhichiRTCElement());
    $('body').append(imgLodingElement());
    $('body').append(pingbaoElement());
  };

  window.onresize = function () {
    changeTitleFontSize();
  };

  window.addEventListener('online', function () {
    layer.msg('网络连接已恢复，正在恢复视频连线', { icon: 6 });
    console.log('网好咯！');
  });
  window.addEventListener('offline', function () {
    console.error('断网咯！');
    networkIsDisconnect = true;
  });

  (() => {
    window.setInterval(() => {
      {
        menuHideTimer.count++;
        if (menuHideTimer.count >= menuHideTimer.time) {
          !版本.手小() && !版本.手主小() && hideToolBar(true);
        }
      }
    }, 1000);

    //监听鼠标
    document.onmousemove = function (event) {
      var x1 = event.screenX;
      var y1 = event.screenY;
      if (menuHideTimer.x != x1 || menuHideTimer.y != y1) {
        hideToolBar(false);
        menuHideTimer.count = 0;
      }
      if (pingbaoTimer.x != x1 || pingbaoTimer.y != y1) {
        pingbaoTimer.count = 0;
      }
      menuHideTimer.x = x1;
      menuHideTimer.y = y1;
      pingbaoTimer.x = x1;
      pingbaoTimer.y = y1;
    };
    //监听鼠标点击
    document.onclick = function () {
      menuHideTimer.count = 0;
      pingbaoTimer.count = 0;
      !$('#toolbar').is(':visible') && hideToolBar(false);
    };
    //监听键盘
    document.onkeydown = function () {
      menuHideTimer.count = 0;
      pingbaoTimer.count = 0;
      hideToolBar(false);
    };
  })();

  $('#testing_btn').on('click', (e) => {
    deviceTestingInit();
    startDeviceConnect();
  });

  $('#kaiqizhibo_btn').on('click', (e) => {
    live.start();
  });

  //回车事件绑定
  $('#xiaoxineirong').bind('keyup', function (event) {
    if (event.keyCode == '13') {
      $('#fasongxiaoxi').click();
    }
  });

  // 切换全屏
  $('#qiehuanquanping_btn').on('click', () => {
    //当前全屏状态
    let isFullSceen = !(!window.screenTop && !window.screenY);
    // 火狐浏览器是相反的
    if (document.documentElement.mozRequestFullScreen) {
      isFullSceen = !isFullSceen;
    }
    isFullSceen ? exitFullScreen() : requestFullscreen();
  });

  // 关闭列表
  $('.box-close').on('click', () => {
    $('#yonghuliebiao').fadeOut();
    $('#shenqingfayanliebiao').fadeOut();
    if ($('#xiaoxiliebiao').css('display') != 'none') {
      // 不能由js直接关闭，需要调用点击事件，关闭前处理一些
      $('#xiaoxi_foot_btn').click();
    }
  });

  // 点击其他区域关闭各个列表
  $(document).mouseup(function (e) {
    const boxList = [
      {
        anniu: $('#xiaoxi_foot_btn'),
        box: $('#xiaoxiliebiao'),
      },
      {
        anniu: $('#canyuzhe_foot_btn'),
        box: $('#yonghuliebiao'),
      },
      {
        anniu: $('#fayanliebiao_foot_btn'),
        box: $('#shenqingfayanliebiao'),
      },
    ];
    if (boxList.filter((item) => item.box.is(':visible')).length == 0) {
      return;
    }
    for (const item of boxList) {
      item.anniu = $('#toolbar');
      if (
        !item.anniu.is(e.target) &&
        item.anniu.has(e.target).length === 0 &&
        !item.box.is(e.target) &&
        item.box.has(e.target).length === 0
      ) {
        if (
          item.box.attr('id') === 'xiaoxiliebiao' &&
          item.box.is(':visible')
        ) {
          // 不能由js直接关闭，需要调用点击事件，关闭前处理一些
          $('#xiaoxi_foot_btn').click();
        }
        item.box.fadeOut();
      }
    }
  });

  // 用户列表点击事件
  $('#canyuzhe_foot_btn').on('click', () => {
    $('#yonghuliebiao').fadeToggle(100);
  });

  // 申请发言列表按钮点击事件
  $('#fayanliebiao_foot_btn').on('click', () => {
    $('#shenqingfayanliebiao').fadeToggle(100);
    $('#fayan_jiaobiao').fadeOut();
  });

  // 消息列表按钮点击事件
  $('#xiaoxi_foot_btn').on('click', () => {
    meetInfo.IsZCR
      ? $('#fasong_tip').html('发向所有人')
      : $('#fasong_tip').html('发向管理员');
    $('#yonghuliebiao').hide();
    $('#xiaoxiliebiao').toggle();
    $('#xiaoxi_jiaobiao').fadeOut();
    $('.gundongxiaoxi').fadeOut();
    if ($('#xiaoxiliebiao').css('display') == 'none') {
      fasonggeishei = '';
      $('#xiaoxiliebiao')
        .find('.modalbox-title .xiaoxi-title')
        .html('消息列表');
      meetInfo.IsZCR
        ? $('#fasong_tip').html('发向所有人')
        : $('#fasong_tip').html('发向管理员');
    } else {
      if (fasonggeishei) {
        $('#xiaoxiliebiao')
          .find('.modalbox-title .xiaoxi-title')
          .html(`消息列表 (${getUserInfo(fasonggeishei).UserName})`);
        $('#fasong_tip').fadeOut();
      }
    }
  });

  // 发送消息
  $('#fasongxiaoxi').on({
    click: clickProof(() => {
      if ($('#xiaoxineirong').val()) {
        chclient.redis.fasongxiaoxi();
      }
    }),
  });

  // 主持人关闭所有麦克风
  $('#guanbimaikefeng_foot_btn').on({
    click: clickProof(() => {
      if (meetInfo.IsZCR) {
        chclient.redis.guanbisuoyourenmaifekeng();
      } else {
        layer.msg('您不是主持人');
      }
    }),
  });

  // 主持人取消当前主讲人
  $('#wuzhujiangren_foot_btn').on({
    click: clickProof(() => {
      if (meetInfo.IsZCR) {
        chclient.redis.quxiaozhujiangren();
      } else {
        layer.msg('您不是主持人');
      }
    }),
  });

  // 切换模式
  $('#qiehuanmoshi_foot_btn').on('click', () => {
    $('#qiehuanshitu_mianban').fadeIn(200);
  });

  // 切换视图关闭按钮点击事件
  $('#qiehuanshitu_close_btn').on('click', () => {
    $('#qiehuanshitu_mianban').fadeOut(200);
  });

  // 参会端切换到主讲人+小视频模式
  $('#qiehuanchangguishipin_btn').on('click', () => {
    $('#qiehuanshitu_mianban').fadeOut(200);
    if (MEET_MODE.主讲人加小视频 == meet_layout.mode) {
      layer.msg('当前已是<主讲人加小视频>模式');
      return;
    }
    chclient.redis.qiehuancanhuimoshi(MEET_MODE.主讲人加小视频);
    meet_layout.mode = MEET_MODE.主讲人加小视频;
    canhuiduan_mode(MEET_MODE.主讲人加小视频, '被动');
  });

  // 参会端切换到主讲人模式
  $('#qiehuandashipin_btn').on('click', () => {
    $('#qiehuanshitu_mianban').fadeOut(200);
    if (MEET_MODE.主讲人 == meet_layout.mode) {
      layer.msg('当前已是<主讲人>模式');
      return;
    }
    chclient.redis.qiehuancanhuimoshi(MEET_MODE.主讲人);
    meet_layout.mode = MEET_MODE.主讲人;
    canhuiduan_mode(MEET_MODE.主讲人, '被动');
  });

  // 参会端切换到小视频模式
  $('#qiehuanxiaoshipin_btn').on('click', () => {
    $('#qiehuanshitu_mianban').fadeOut(200);
    if (MEET_MODE.小视频 == meet_layout.mode) {
      layer.msg('当前已是<小视频>模式');
      return;
    }
    chclient.redis.qiehuancanhuimoshi(MEET_MODE.小视频);
    meet_layout.mode = MEET_MODE.小视频;
    canhuiduan_mode(MEET_MODE.小视频, '被动');
  });

  // 翻页
  (() => {
    // PC端点击上一页
    $('#shangyiye_foot_btn').on('click', () => {
      if (!fanyeHandler.timer) {
        if (版本.显小() || 版本.显主小()) {
          if (display_layout.pageNo == 0) {
            layer.msg('不能再向上翻了');
          } else {
            chclient.redis.fanyeXianshiduan(display_layout.pageNo - 1);
            doLoop();
          }
        } else {
          if (meet_layout.pageNo == 0) {
            layer.msg('不能再向上翻了');
          } else {
            chclient.redis.fanyeCanhuiduan(meet_layout.pageNo - 1);
            doLoop();
          }
        }
      }
    });

    // PC端点击下一页
    $('#xiayiye_foot_btn').on('click', () => {
      if (!fanyeHandler.timer) {
        if (版本.显小() || 版本.显主小()) {
          if (display_layout.pageNo + 1 == display_layout.pageCount) {
            layer.msg('不能再向下翻了');
          } else {
            chclient.redis.fanyeXianshiduan(display_layout.pageNo + 1);
            doLoop();
          }
        } else {
          if (meet_layout.pageNo + 1 == meet_layout.pageCount) {
            layer.msg('不能再向下翻了');
          } else {
            chclient.redis.fanyeCanhuiduan(meet_layout.pageNo + 1);
            doLoop();
          }
        }
      }
    });

    // 手机端小视频点击上一页
    $('#shangyiye_ms_btn').on('click', () => {
      if (!fanyeHandler.timer) {
        if (meet_layout.pageNo == 0) {
          layer.msg('不能再向上翻了');
        } else {
          meet_layout.pageNo--;
          viewsHandle();
          doLoop();
        }
      }
    });

    // 手机端小视频点击下一页
    $('#xiayiye_ms_btn').on('click', () => {
      if (!fanyeHandler.timer) {
        if (meet_layout.pageNo + 1 == meet_layout.pageCount) {
          layer.msg('不能再向下翻了');
        } else {
          meet_layout.pageNo++;
          viewsHandle();
          doLoop();
        }
      }
    });

    function doLoop() {
      loop();
      fanyeHandler.timer = setInterval(loop, 1000);
      function loop() {
        if (fanyeHandler.num > 0) {
          $('#shangyiye_foot_btn span').html(`上一页(${fanyeHandler.num})`);
          $('#xiayiye_foot_btn span').html(`下一页(${fanyeHandler.num})`);
          $('#shangyiye_ms_btn span').html(`上页(${fanyeHandler.num})`);
          $('#xiayiye_ms_btn span').html(`下页(${fanyeHandler.num})`);
          fanyeHandler.num--;
        } else {
          $('#shangyiye_foot_btn span').html(`上一页`);
          $('#xiayiye_foot_btn span').html(`下一页`);
          $('#shangyiye_ms_btn span').html(`上页`);
          $('#xiayiye_ms_btn span').html(`下页`);
          fanyeHandler.num = fanyeHandler.shichang;
          clearInterval(fanyeHandler.timer);
          fanyeHandler.timer = null;
        }
      }
    }
  })();

  // 连续点击标题唤出控制台
  $('#roomTitle').on({
    click: function () {
      var currentTime = new Date().getTime();
      // 计算两次相连的点击时间间隔
      enableVconsole.count =
        currentTime - enableVconsole.lastTime < enableVconsole.waitTime
          ? enableVconsole.count + 1
          : 1;
      enableVconsole.lastTime = new Date().getTime();
      clearTimeout(enableVconsole.timer);
      enableVconsole.timer = setTimeout(function () {
        clearTimeout(enableVconsole.timer);
        if (enableVconsole.count > 4) {
          localStorage.setItem(
            'enableVconsole',
            window.eruda ? !window.eruda._isInit : true
          );
          window.eruda && window.eruda._isInit
            ? (() => {
                window.eruda.destroy();
                $('[style^="all: initial;"]').remove();
              })()
            : enableEruda();
        }
      }, enableVconsole.waitTime + 10);
    },
  });
  // 退出按钮事件
  $('#exit_btn').on({
    click: function () {
      leave();
    },
  });

  // 申请发言按钮点击事件
  $('#shenqingfayan_foot_btn').on({
    click: clickProof(() => {
      layer.msg('已提交申请发言');
      chclient.redis.shenqingfayan();
    }),
  });

  // 翻转相机点击事件
  $('#fanzhuan_btn').on({
    click: clickProof(async () => {
      if (!isCamOn) {
        layer.msg('请先打开摄像头再切换');
        return;
      }
      const devices = await TRTC.getCameras();
      if (isAndroid()) {
        androidCameraIndex = androidCameraIndex == 0 ? 1 : 0;
        cameraId = devices[androidCameraIndex].deviceId;
      } else {
        for (const device of devices) {
          if (cameraId != device.deviceId) {
            cameraId = device.deviceId;
            break;
          }
        }
      }
      changeCameraId();
    }, 1000),
  });

  //打开或关闭摄像机
  $('#video_foot_btn').on({
    click: clickProof(() => {
      if (!deviceUsable.camera) {
        layer.msg('没有摄像头');
        return;
      }
      switchVideo({ toggle: true });
    }),
  });

  //打开或关闭麦克风
  $('#mic_foot_btn').on({
    click: clickProof(() => {
      if (!deviceUsable.mic) {
        layer.msg('没有麦克风');
        return;
      }
      if (
        roomDetail.AllowOpenMic == MODE_STATE.开启 ||
        meetInfo.IsZCR ||
        roomDetail.SpeakerID == meetInfo.CHID
      ) {
        switchMic({ toggle: true });
      } else {
        layer.msg('会场临时关闭控制麦克风');
      }
    }),
  });
})();
