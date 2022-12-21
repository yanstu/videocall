/**
 * redis发布与接收到的数据类型
 * @typedef {object} redisData
 * @property {string} reCode 类型
 * @property {string} ReUserid 接收人ID
 * @property {string} ReUserQYBH 接收人区域编号
 * @property {string} ReUserName 接收人姓名
 * @property {string} SendUserID 发送人ID
 * @property {string} SendUserName 发送人姓名
 * @property {string} Content 消息内容
 * @property {number|MessageData|string} Data redis收到的数据data
 */

/**
 * redis收到的数据data
 * @typedef {object} MessageData
 * @property {string|number?=} State 状态
 * @property {number?=} AspectRatio 缩放比
 * @property {number?=} timestamp 时间戳
 * @property {roomDetail?=} VideoConferenceMess 时间戳
 * @property {Array<userInfo>?=} UserList_Show 显示端排序用户列表
 * @property {any?=} [any]
 */
