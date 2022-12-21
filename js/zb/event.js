(() => {
  window.onload = function () {
    JSON.parse(localStorage.getItem('enableVconsole')) && enableEruda();

    版本.手直() && orientationchange();

    // 追加节点
    $('body').append(jiancetanchuangElement());
    $('body').append(buzhichiRTCElement());
    $('body').append(imgLodingElement());
    $('body').append(pingbaoElement());

    // 加载提示
    $('.tcp-loading-spinner').text('直播加载中').css('width', '70px').css('height', '70px').css('text-align', 'center')
  };

  $(window).on('orientationchange', orientationchange);

  // 监听鼠标
  document.onmousemove = function (event) {
    var x1 = event.screenX;
    var y1 = event.screenY;
    if (pingbaoTimer.x != x1 || pingbaoTimer.y != y1) {
      pingbaoTimer.count = 0;
    }
    pingbaoTimer.x = x1;
    pingbaoTimer.y = y1;
  };

  // 监听键盘
  document.onkeydown = function () {
    pingbaoTimer.count = 0;
  };

  $('body').on('click', () => {
    live.play();
  });

  // 切换播放模式，fill：拉伸 contain：缩放
  $('#qiehuan_btn').on('click', () => {
    if ($('#' + live.container).css('object-fit') === 'fill') {
      $('#' + live.container).css('object-fit', 'contain');
    } else {
      $('#' + live.container).css('object-fit', 'fill');
    }
  });

  // 切换全屏按钮
  $('#qiehuanquanping_btn').on('click', () => {
    if (版本.桌直()) {
      //当前全屏状态
      let isFullSceen = !(!window.screenTop && !window.screenY);
      // 火狐浏览器是相反的
      if (document.documentElement.mozRequestFullScreen) {
        isFullSceen = !isFullSceen;
      }
      isFullSceen ? exitFullScreen() : requestFullscreen();
    } else {
      live.requestFullscreen();
    }
  });

  // 翻转视频按钮
  $('#xuanzhuan_btn').on('click', () => {
    if (document.getElementById('container').style.width === '100%') {
      rotateVideo();
    } else {
      restoreVideo();
    }
  });

  // 设备检测按钮
  $('#testing_btn').on('click', () => {
    deviceTestingInit();
    startDeviceConnect();
  });

  // 退出按钮
  $('#exit_btn').on('click', () => {
    leave();
  });

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
          localStorage.setItem('enableVconsole', window.eruda ? (!window.eruda._isInit) : true);
          window.eruda && window.eruda._isInit ? (() => {
            window.eruda.destroy();
            $('[style^="all: initial;"]').remove()
          })() : enableEruda();
        }
      }, enableVconsole.waitTime + 10);
    },
  });
})();
