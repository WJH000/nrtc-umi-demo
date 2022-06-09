

export const OFFLINE_REPORT_REPLY_MSG = {
    'Account not online': '账号不在线',
    'Local case not exist': '本地病例不存在',
    'Success': '对方已接收该报告',
}

// websocket消息事件枚举，适用于质控窗口接收对方上线/下线/开启推流/关闭推流/离线报告通知, 以及验证当前账号重复登录
export enum WEBSOCKET_EVENT {
    'ONLINE' = 'ONLINE',                                   // 对方登录
    'OFFLINE' = 'OFFLINE',                                 // 对方登出
    'PATIENT' = 'PATIENT',                                 // 对方开启推流、下级创建病例发送病例信息给上级医生
    'CLOSE_SRS' = 'CLOSE_SRS',                             // 对方关闭推流
    'LEAVE' = 'LEAVE',                                     // 对方切换为离开状态
    'DIAGNOSING' = 'DIAGNOSING',                           // 对方切换为会诊中状态
    'OFFLINE_REPORT_REPLY' = 'OFFLINE_REPORT_REPLY',       // 下级离线报告回复
    'REPEAT_LOGIN' = 'REPEAT_LOGIN',                       // 账号重复登录
    'DESTROY_QUEUE' = 'DESTROY_QUEUE_NOTIFICATION',        // 销毁队列通知【专家端不需要发送】
    'LEAVE_QUEUE' = 'LEAVE_QUEUE_NOTIFICATION',            // 离开队列通知，适用于【监听】他人离开队列
    'JOIN_QUEUE' = 'JOIN_QUEUE_NOTIFICATION',              // 加入队列通知，适用于【监听】他人加入队列
}

// 自定义控制命令事件类型枚举，适用于会诊时通过信令发自定义消息
export enum CUSTOM_CONTROL_EVENT {
    SEND_REPORT = 'SEND_REPORT',                      // √【发送】通知对方生成了报告
    KICK_MEMBER = 'KICK_MEMBER',                      // √【发送/接收】通知某成员将被踢出，适用于多人会诊中主导专家通知成员A其将被踢出，然后成员A主动离开房间（成员A目前是普通专家）
    SEND_STUDY = 'SEND_STUDY',                        // √【接收】对方同步病例
    CHANGE_LEADER = 'CHANGE_LEADER',                  // √【接收】对方切换主导专家
    USER_ACCEPT = 'USER_ACCEPT',                      //  【接收】通知主叫方自己已经接听，为了兼容掌超端传accountId
    PUSH_SCREEN_STREAM = 'PUSH_SCREEN_STREAM',        // TODO【接收】屏幕推流是否开启
    INPUT = 'input',                                  // TODO 接收超声端传回的点击区域是Input
    INITIATE_CONTROL = 'INITIATE_CONTROL',            // TODO 专家端发起远程控制
    FINISH_CONTROL = 'FINISH_CONTROL',                // TODO 专家端结束远程控制
    ACCEPT_CONTROL = 'ACCEPT_CONTROL',                // TODO 超声端接受远程控制
    REJECT_CONTROL = 'REJECT_CONTROL'                 // TODO 超声端拒绝远程控制
}

// 用户状态字段枚举
export enum USER_STATUS_ENUM {
    OFFLINE = 'OFFLINE',              // 离线  offline
    ONLINE = 'ONLINE',                // 空闲，即原来的在线   IDLE = 'idle'
    LEAVE = 'LEAVE',                  // 离开 leave
    DIAGNOSING = 'DIAGNOSING',        // 忙线，正在通话中   INCALL = 'incall'
}

// window事件监听枚举
export enum WINDOW_EVENT_ENUM {
    ONLINE = 'online',
    OFFLINE = 'offline',
    KEY_DOWN = 'keydown',
    BEFORE_UNLOAD = 'beforeunload',
    UNLOAD = 'unload',
    RESIZE = 'resize',
    STORAGE = 'storage',
}

// 用户状态对应的图标
export const USER_STATUS_ICON_ENUM = {
    [USER_STATUS_ENUM?.OFFLINE]: require('@/assets/icons/offline.png'),
    [USER_STATUS_ENUM?.ONLINE]: require('@/assets/icons/free.png'),
    [USER_STATUS_ENUM?.LEAVE]: require('@/assets/icons/leave.png'),
    [USER_STATUS_ENUM?.DIAGNOSING]: require('@/assets/icons/busy.png'),
};

// 用户状态完整配置
export const USER_STATUS_ENUM_DESC = {
    [USER_STATUS_ENUM?.OFFLINE]: { title: '离线', value: 'OFFLINE', icon: require('@/assets/icons/offline.png') },
    [USER_STATUS_ENUM?.ONLINE]: { title: '在线', value: 'ONLINE', icon: require('@/assets/icons/free.png') },
    [USER_STATUS_ENUM?.LEAVE]: { title: '离开', value: 'LEAVE', icon: require('@/assets/icons/leave.png') },
    [USER_STATUS_ENUM?.DIAGNOSING]: { title: '会诊中', value: 'DIAGNOSING', icon: require('@/assets/icons/busy.png') },
}

// 网络质量打分，适用于会诊时实时显示上行/下行网络质量
export const NET_STATUS_MAP = {
    '0': '网络质量未知',
    '1': '网络质量极好',
    '2': '用户主观感觉和极好差不多，但码率可能略低于极好',
    '3': '能沟通但不顺畅',
    '4': '网络质量差',
    '5': '完全无法沟通',
}