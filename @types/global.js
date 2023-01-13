/**
 * 用户对象
 * @typedef {object} userInfo
 * @property {number} AspectRatio 长宽比
 * @property {number} FYSX 发言顺序
 * @property {string} ID
 * @property {number} IsFY
 * @property {numbool} IsZCR 是否是主持人
 * @property {numbool} MicState 麦克风状态
 * @property {numbool} RECState 录制状态
 * @property {numbool} CameraSta 摄像头状态
 * @property {userType} Type 用户类型
 * @property {string} UserID 用户名
 * @property {string} UserName 用户名字
 * @property {string} UserQYBH 用户区域编号
 * @property {string} UserQYMC 用户区域名称
 * @property {number} XUHAO 用户序号
 * @property {number} IsZBRY 是否是直播人员  0否 1是
 */

/**
 * 缓存中的用户摄像头麦克风状态
 * @typedef {object} state
 * @property {string} UserID 用户ID
 * @property {numbool} CameraState 摄像头状态
 * @property {numbool} MicState 麦克风状态
 */

/**
 * 1|2|3|4
 * @typedef {1|2|3|4} userType
 */

/**
 * 0|1|'0'|'1'
 * @typedef {0|1|'0'|'1'|2|'2'} numbool
 */

/**
 * 切换摄像头状态
 * @typedef {object} switchVideoParams
 * @property {boolean?=} toggle 切换，当前状态相反的
 * @property {boolean?=} on 开启还是关闭
 */

/**
 * 会议模式
 * @typedef {1|2|3|number} meetMode
 */

/**
 * 上一次的设备状态
 * @typedef {object} preDeviceStateData
 * @property {number} timestamp 上一次切换的时间戳
 * @property {boolean} micOn 麦克风开关状态
 * @property {boolean} camOn 摄像头开关状态
 */
