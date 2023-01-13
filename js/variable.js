// SDK demo变量-----------------------
/**
 * 摄像头是否打开
 */
let isCamOn = true;
/**
 * 麦克风是否打开
 */
let isMicOn = true;
/**
 * * rtc客户端
 * @type RtcClient
 */
let rtc = {};
let cameraId = '';
let micId = '';

// 自定义变量--------------------------
let meetInfo = {
  /** userid */
  CHID: '',
  /** 房间id */
  ID: '',
  IsLZ: false,
  /** 是否主持人 */
  IsZCR: false,
  /** 区域编码 */
  QYBH: '00',
  /** 房间id */
  RoomId: '7',
  /** 可用余额 */
  YE: 0,
  SDKAppID: '',
  Title: '',
  UserSig: '',
  XM: '',
};
let roomDetail = {
  /** 允许控制麦克风 */
  AllowOpenMic: 1,
  /**
   * 什么人创建的会议 1工作人员  2代表
   * @type {1|2}
   */
  CJRLX: 1,
  /** 会标背景颜色 */
  HBBGColor: '#0033cc',
  /** 会标内容 */
  HBNR: '',
  /** 允许申请发言 0否/1是 */
  AllowProposer: 1,
  /** 允许录制 0否/1是 */
  AllowREC: 0,
  /** 显示列数 */
  CHRY_ShowCols: 2,
  /** 显示行数 */
  CHRY_ShowRows: 5,
  /**
   * 屏保状态
   * @type {0|1}
   */
  ScreenSaverState: 0,
  /** 消息列表 */
  MessList: [],
  /** 发言列表 */
  ProposerList: [],
  /**
   * 会标状态
   * @type {0|1}
   */
  EmblemState: 0,
  /** 是否直播模式 0否 1是 */
  IsZBMS: 0,
  /** 主讲人UD */
  SpeakerID: '',
  /** 主讲人姓名 */
  SpeakerName: '',
  /** 房间名 */
  Title: '',
  /**
   * 参加会议人员列表
   * @type userInfo[]
   */
  UserList: [],
  /**
   * 展示端人员列表，用作展示端排序
   * @type userInfo[]
   */
  UserList_Show: [],
  /** 展示端配置 */
  XSDModel: {
    /**
     * 参会端模式
     * @type meetMode
     */
    Model: 3,
    Page: 1,
    /**
     * 小视频布局
     */
    XSPFormat: '4*4',
  },
  /** 参会端配置 */
  CHDModel: {
    /**
     * 参会端模式
     * @type meetMode
     */
    Model: 2,
    Page: 1,
  },
  /** 小视频模式 */
  XSPMS: 0,
};
// 参会端布局
let meet_layout = {
  /**
   * 行数
   * @type {number}
   */
  rows: 5,
  /**
   * 列数
   * @type {number}
   */
  cols: 2,
  /** 总页数 */
  pageCount: 0,
  /** 当前第几页 */
  pageNo: 0,
  /**
   * * 当前页的用户列表
   * @type userInfo[]
   */
  pageUserList: [],
  /** 长宽比 */
  aspectRatio: 0,
  /**
   * 显示模式 1.主讲人模式2.参会人模式3.小视频模式 4.自由模式
   * @type meetMode
   */
  mode: 2,
};
/** 展示端布局 */
let display_layout = {
  /**
   * 行数
   * @type {number}
   */
  rows: 5,
  /**
   * 列数
   * @type {number}
   */
  cols: 5,
  /** 总页数 */
  pageCount: 0,
  /** 当前第几页 */
  pageNo: 0,
  /**
   * * 当前页的用户列表
   * @type userInfo[]
   */
  pageUserList: [],
  /**
   * 显示模式 1.主讲人模式2.参会人模式3.小视频模式
   * @type meetMode
   */
  mode: 2,
};

let ZCRID_ = '';
let ZJRID_ = '';
let fasonggeishei = '';
/** 10秒鼠标键盘无操作将隐藏菜单栏 */
let menuHideTimer = {
  count: 0,
  time: 10, //秒
  x: 0,
  y: 0,
};
/** 开启屏保后当前页面10分钟内鼠标键盘无操作将进入屏保页面 */
let pingbaoTimer = {
  timer: null,
  count: 0,
  // time: 20 * 60, //秒
  time: 2 * 60, //秒
  // time: 5, //秒
  x: 0,
  y: 0,
};
/** 定时抽取主讲人帧 */
let videoImgTimer = null;
/** 翻页控制器 */
let fanyeHandler = {
  timer: null,
  num: 2,
  shichang: 2, // 秒
};
/** 是否第一次进入 */
let isFristStartUp = true;
/** 启用vconsole */
let enableVconsole = {
  timer: null,
  /** 连续点击次数 */
  count: 0,
  /** 上次点击时间 */
  lastTime: new Date().getTime(),
  /** 该时间间隔内点击才算连续点击（单位：ms） */
  waitTime: 200,
};
/** 重新推送定时器 */
let rePublishTimer = null;
/**
 * * 直播推流、拉流客户端
 * @type Pusher | Player
 */
let live = null;
/**
 * * chathub连接客户端
 * @type ChatHubClient
 */
let chclient = null;
/** 屏保显示时间定时器 */
let pingbaoTimeTimer = null;
/** 在线心跳定时器 */
let onlineHeartbeatTimer = null;
/** 记录切换主讲人是否完成了的定时器  */
let changeZJRTimer = null;
/** 安卓前后置摄像头的deviceId每次刷新都会变更，所以只能通过第一个还是第二个来记住 */
let androidCameraIndex = 0;
let 正在设置分辨率 = false;
/** 麦克风或摄像头可用状态 */
let deviceUsable = {
  camera: true,
  mic: true,
};
/** 设置视频截图失败次数统计 */
let setVideoImgFailCount = 0;
/** 网络是否断开 */
let networkIsDisconnect = false;
/** 上一次统计的在线人数 */
let preOnlineNum = 0;
/** 在线人数统计定时器 */
let onlineNumTimer = null;
/** 屏保是否已经进入 */
let pingbaoshifoujinru = false;
/** 手动断开signalr */
let isManualOperation = false;

/** 参会端和显示端模式枚举 */
const MEET_MODE = {
  /** 1 */
  主讲人: 1,
  /** 2 */
  主讲人加小视频: 2,
  /** 3 */
  小视频: 3,
};
/** 用户类型 */
const USER_TYPE = {
  /** 2 */
  单位: 2,
  /** 3 */
  代表: 3,
  /** 4 */
  群众: 4,
};
/** 模式是否开启枚举 */
const MODE_STATE = {
  /** 1 */
  开启: 1,
  /** 0 */
  关闭: 0,
};
/** 麦克风摄像头状态枚举 */
const DEVICE_STATE = {
  /** 0 */
  关闭: 0,
  /** 1 */
  开启: 1,
  /** 2 */
  错误: 2,
};
/** 上行网络质量为 SDK 到腾讯云的上行连接网络质量 */
const NETWORK_QUALITY = {
  /** 0 */
  未知: 0,
  /** 1 */
  极佳: 1,
  /** 2 */
  较好: 2,
  /** 3 */
  一般: 3,
  /** 4 */
  差: 4,
  /** 5 */
  极差: 5,
  /** 6 */
  断开: 6,
};
