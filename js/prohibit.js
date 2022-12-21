(() => {
  // 移动端禁止拖拽
  $('html,body').css('overflow', 'hidden').css('height', '100%');
  document.body.addEventListener(
    'touchmove',
    self.welcomeShowedListener,
    false
  );
  const keyCodeMap = {
    // 91: true, // command
    61: true,
    107: true, // 数字键盘 +
    109: true, // 数字键盘 -
    173: true, // 火狐 - 号
    187: true, // +
    189: true, // -
  };
  // 覆盖ctrl||command + ‘+’/‘-’
  document.onkeydown = function (event) {
    const e = event || window.event;
    const ctrlKey = e.ctrlKey || e.metaKey;
    if (ctrlKey && keyCodeMap[e.keyCode]) {
      e.preventDefault();
    } else if (e.detail) {
      // Firefox
      event.returnValue = false;
    }
  };
  // 覆盖鼠标滑动
  document.body.addEventListener(
    'wheel',
    (e) => {
      if (e.ctrlKey) {
        if (e.deltaY < 0) {
          e.preventDefault();
          return false;
        }
        if (e.deltaY > 0) {
          e.preventDefault();
          return false;
        }
      }
    },
    { passive: false }
  );
  // 允许其他节点触发长按事件
  document.documentElement.addEventListener(
    'touchmove',
    function (e) {
      e.returnValue = true;
    },
    false
  );
  if (!location.href.toLowerCase().includes('splx')) {
    //js禁止鼠标右键打开及复制
    document.oncontextmenu = new Function('event.returnValue=false');
    document.onselectstart = new Function('event.returnValue=false');
    document.onselectstart = function () {
      if (event.button == 2) {
        return false;
      }
    };
  }
  if (!window.WSLLZWinFrom) {
    // 阻止默认的处理方式 即 下拉滑动效果
    document.body.addEventListener(
      'touchmove',
      function (e) {
        e.preventDefault();
      },
      {
        passive: false,
      }
    );
    // 禁止页面拖拽
    document.ondrop = function () {
      return false;
    };
    document.ondragstart = function () {
      return false;
    };
    document.ondragenter = function () {
      return false;
    };
    document.ondragover = function () {
      return false;
    };
  }

  try {
    // 禁止非安卓、非联络站winfrom、支持多触控的设备使用，视为没有购买公司大屏然后直接在自己买的大屏上偷渡使用的用户
    if (isPC() && navigator.maxTouchPoints > 0 && !window.WSLLZWinFrom) {
      // location.replace('notFound');
    }
  } catch (error) {}
})();
