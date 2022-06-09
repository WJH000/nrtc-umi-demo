
// 多人会诊重构页面
import { useState, useRef } from 'react'
import { Button, Badge } from 'antd';
import { useFullscreen } from 'ahooks';
import { PlusOutlined } from '@ant-design/icons';
import { formatGenderDesc } from '@/utils/utils';
import { NET_STATUS_MAP, CUSTOM_CONTROL_EVENT, WINDOW_EVENT_ENUM } from '@/enum';
import styles from './index.less'

const patient = {
    patientNumber: '病人编号',
    name: '病人姓名',
    age: 18,
    sex: 'female',
}

const clicMember = {
    realname: '超声医生-姓名',
    organizationName: '超声医生-医院一'
}

const currentUser = {
    realName: '当前账号-姓名',
    organizationName: '当前账号-医院二'
}

const invitingExperts = [1]
const LEAD_IMG = require('@/assets/images/diamond1.png');
const EXPERT_IMG = require('@/assets/images/diamond2.png');

export default () => {
    const [netQuality] = useState<number>(0); // 实时网络质量，以下行为主
    const screenRef = useRef();
    const [isTotalFullscreen, { toggleFull: toggleScreenFull, exitFull: exitScreenFull }] =
        useFullscreen(screenRef); // 整个网页全屏
    return (<div
        className={styles.consultation_root}
        ref={screenRef}
    >
        <div className={styles.views_wrapper}>
            {/* 左侧辅流 */}
            <div className={styles.left}>
                <div className={styles.patient_box}>
                    <div className={styles.logo} />
                    <div className={styles.info}>
                        {patient?.patientNumber && <span>{patient?.patientNumber}</span>}
                        {patient?.name && <span>{patient?.name}</span>}
                        {patient?.age > -1 && <span>{patient?.age}岁</span>}
                        {/* 性别 */}
                        {patient && <span>{formatGenderDesc(patient?.sex) || '--'}</span>}
                    </div>
                </div>
                <div className={styles.share_wrapper}>
                    左侧辅流
                </div>
            </div>
            {/* 右侧视频窗口 */}
            <div className={styles.right}>
                <div className={styles.header}>
                    <Badge count={invitingExperts?.length}>
                        <Button
                            type="primary"
                            className={styles.invite_btn}
                            icon={<PlusOutlined />}>邀请专家</Button>
                    </Badge>
                    <div className={styles.ope_box}>
                        {/* 挂断 */}
                        <img
                            className={styles.hangup_i}
                            title={`离开`}
                            onClick={() => {
                                console.log('handle leave')
                            }}
                        />
                        {/* 网络情况 */}
                        <img
                            className={`${styles.net_i} ${styles['net_' + netQuality]}`}
                            title={NET_STATUS_MAP[netQuality]}
                            onClick={() => {
                                console.log('handle 网络情况')
                            }}
                        />
                        {/* 全屏 */}
                        <img
                            title={`${isTotalFullscreen ? '退出' : ''}全屏`}
                            className={styles[isTotalFullscreen ? 'shrinkscreen_i' : 'fullscreen_i']}
                            onClick={toggleScreenFull}
                        />
                    </div>
                </div>
                <div className={styles.remote_container}>
                    {/* 大窗口-展示超声医生 */}
                    <div className={styles.single_viewbox}>
                        <div
                            id="remote-container1"
                            className={styles.clinic_viewbox}
                            title="大窗口-展示超声医生"
                        />
                        <div className={styles.name_tag} style={{ top: 6, left: 22 }}>
                            <img className={styles.host_i} />
                            <span>{clicMember?.realname}</span>
                        </div>
                        <span className={styles.org} style={{ marginLeft: 16 }}>
                            {clicMember?.organizationName}
                        </span>
                    </div>
                    {/* 小窗口-展示专家端，顺序为自己 > 主导专家 > 其他专家。上限5 */}
                    <div className={styles.experts_container}>
                        <div
                            className={`${styles.single_viewbox} ${styles.small_viewbox}`}
                            key="single-viewbox-myself"
                            title="本地窗口"
                        >
                            <div
                                className={`${styles['expert_viewbox']}`}
                                id="local-container"
                            />

                            <div className={`${styles.name_tag}`}>
                                <img src={EXPERT_IMG} />
                                <span>{currentUser?.realName}</span>
                            </div>
                            <span className={styles.org}>{currentUser?.organizationName}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>)
}