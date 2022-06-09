/**
 * 多人会诊页面Vue->React
 */
import { useState, useEffect } from 'react'
import { history } from 'umi'
import * as WebRTC2 from '../../sdk/NIM_Web_NERTC_v4.6.0';
import { getToken } from '../../common';
import config from '@/config/index';
import styles from './index.less';
const localUid = Math.ceil(Math.random() * 1e5)
const channelName = '123456'
let client: any = null
let localStream: any = null
const max = 20

export default function GroupView() {
    const [isSilence, setIsSilence] = useState<boolean>(false); // 默认开启声音
    const [isStop, setIsStop] = useState<boolean>(false);  // 默认开启声音
    const [remoteStreams, setRemoteStreams] = useState<any[]>([])

    useEffect(() => {
        // 初始化音视频实例
        console.warn('初始化音视频sdk');
        // window.self = this;
        client = WebRTC2.createClient({
            appkey: config.appkey,
            debug: true,
        });
        console.log('27----', client)
        //监听事件
        client.on('peer-online', (evt: any) => {
            console.warn(`${evt.uid} 加入房间`);
        });

        client.on('peer-leave', (evt: any) => {
            console.warn(`${evt.uid} 离开房间`);
            const tmpRemoteStreams = remoteStreams.filter(
                (item) => !!item.getId() && item.getId() !== evt.uid
            );
            setRemoteStreams(tmpRemoteStreams)
        });

        client.on('stream-added', async (evt: any) => {
            const stream = evt.stream;
            const userId = stream.getId();
            let tmpremoteStreams: any[] = []
            if (remoteStreams.some(item => item.getId() === userId)) {
                console.warn('收到已订阅的远端发布，需要更新', stream);
                tmpremoteStreams = remoteStreams.map(item => item.getId() === userId ? stream : item);
                setRemoteStreams(tmpremoteStreams)
                console.log('48----remoteStreams', tmpremoteStreams)
                await subscribe(stream);
            } else if (remoteStreams.length < max - 1) {
                console.warn('收到新的远端发布消息', stream)
                tmpremoteStreams = remoteStreams.concat(stream)
                setRemoteStreams(tmpremoteStreams)
                await subscribe(stream);
            } else {
                console.warn('房间人数已满')
            }
        });

        client.on('stream-removed', (evt: any) => {
            const stream = evt.stream
            const userId = stream.getId()
            stream.stop();
            const tmpRemoteStreams = remoteStreams.map(item => item.getId() === userId ? stream : item)
            setRemoteStreams(tmpRemoteStreams)
            console.warn('远端流停止订阅，需要更新', userId, stream)
        });

        client.on('stream-subscribed', (evt: any) => {
            console.warn('收到了对端的流，准备播放');
            const remoteStream = evt.stream;
            //用于播放对方视频画面的div节点
            const remoteContainers = document.getElementsByClassName('remote-container') || []
            console.log('71----remoteContainers', remoteContainers)
            const div = [...remoteContainers].find(
                (item) => Number(item.dataset.uid) === Number(remoteStream.getId())
            );
            remoteStream
                .play(div)
                .then(() => {
                    console.warn('播放视频');
                    remoteStream.setRemoteRenderMode({
                        // 设置视频窗口大小
                        width: 160,
                        height: 90,
                        cut: false, // 是否裁剪
                    });
                })
                .catch((err: Error) => {
                    console.warn('播放对方视频失败了: ', err);
                });
        });

        getMyToken().then((token: string) => {
            joinChannel(token)
        }).catch((e: Error) => {
            alert(e)
            console.error(e)
        })
    }, [])

    const getMyToken = () => {
        return getToken({
            uid: localUid,
            appkey: config.appkey,
            appSecret: config.appSecret,
            channelName: channelName
        }).then((token: string) => {
            return token
        }, (e: Error) => {
            throw e;
        });
    }

    const returnJoin = (time = 2000) => {
        setTimeout(() => {
            history.push('/', {
                path: 'multiple',
            },
            );
        }, time);
    }

    const joinChannel = (token: string) => {
        if (!client) {
            alert('内部错误，请重新加入房间');
            return;
        }
        console.info('开始加入房间: ', channelName);
        client
            .join({
                channelName: channelName,
                uid: localUid,
                token,
            })
            .then((data: any) => {
                console.info('加入房间成功，开始初始化本地音视频流', data);
                initLocalStream();
            })
            .catch((error: Error) => {
                console.error('加入房间失败：', error);
                alert(`${error}: 请检查appkey或者token是否正确`);
                returnJoin();
            });
    }

    const initLocalStream = () => {
        //初始化本地的Stream实例，用于管理本端的音视频流
        localStream = WebRTC2.createStream({
            uid: localUid,
            audio: true, //是否启动mic
            video: true, //是否启动camera
            screen: false, //是否启动屏幕共享
        });

        //设置本地视频质量
        localStream.setVideoProfile({
            resolution: WebRTC2.VIDEO_QUALITY_720p, //设置视频分辨率
            frameRate: WebRTC2.CHAT_VIDEO_FRAME_RATE_15, //设置视频帧率
        });
        //设置本地音频质量
        localStream.setAudioProfile('speech_low_quality');
        //启动媒体，打开实例对象中设置的媒体设备
        localStream
            .init()
            .then(() => {
                console.warn('音视频开启完成，可以播放了');
                // TODO 设置节点div
                const div = document.getElementById('local-container') as HTMLElement
                localStream.play(div);
                localStream.setLocalRenderMode({
                    // 设置视频窗口大小
                    width: div.clientWidth,
                    height: div.clientHeight,
                    cut: true, // 是否裁剪
                });
                // 发布
                publish();
            })
            .catch((err: Error) => {
                console.warn('音视频初始化失败: ', err);
                alert('音视频初始化失败');
                localStream = null;
            });
    }

    const publish = () => {
        console.warn('开始发布视频流');
        //发布本地媒体给房间对端
        client
            .publish(localStream)
            .then(() => {
                console.warn('本地 publish 成功');
            })
            .catch((err: Error) => {
                console.error('本地 publish 失败: ', err);
                alert('本地 publish 失败');
            });
    }

    const subscribe = (remoteStream: any) => {
        remoteStream.setSubscribeConfig({
            audio: true,
            video: true,
        });
        client
            .subscribe(remoteStream)
            .then(() => {
                console.warn('本地 subscribe 成功');
            })
            .catch((err: Error) => {
                console.warn('本地 subscribe 失败: ', err);
                alert('订阅对方的流失败');
            });
    }

    const setOrRelieveSilence = () => {
        setIsSilence(v => !v)
        if (isSilence) {
            console.warn('关闭mic');
            localStream
                .close({
                    type: 'audio',
                })
                .then(() => {
                    console.warn('关闭 mic sucess');
                })
                .catch((err: Error) => {
                    console.warn('关闭 mic 失败: ', err);
                    alert('关闭 mic 失败');
                });
        } else {
            console.warn('打开mic');
            if (!localStream) {
                alert('当前不能打开mic');
                return;
            }
            localStream
                .open({
                    type: 'audio',
                })
                .then(() => {
                    console.warn('打开mic sucess');
                })
                .catch((err: Error) => {
                    console.warn('打开mic失败: ', err);
                    alert('打开mic失败');
                });
        }
    }

    const stopOrOpenVideo = () => {
        setIsStop(v => !v)
        if (isStop) {
            console.warn('关闭摄像头');
            localStream
                .close({
                    type: 'video',
                })
                .then(() => {
                    console.warn('关闭摄像头 sucess');
                })
                .catch((err: Error) => {
                    console.warn('关闭摄像头失败: ', err);
                    alert('关闭摄像头失败');
                });
        } else {
            console.warn('打开摄像头');
            if (!localStream) {
                alert('当前不能打开camera');
                return;
            }
            localStream
                .open({
                    type: 'video',
                })
                .then(() => {
                    console.warn('打开摄像头 sucess');
                    // TODO 设置节点div
                    const div = document.getElementById('local-container') as HTMLElement
                    localStream.play(div);
                    localStream.setLocalRenderMode({
                        // 设置视频窗口大小
                        width: div.clientWidth,
                        height: div.clientHeight,
                        cut: true, // 是否裁剪
                    });
                })
                .catch((err: Error) => {
                    console.warn('打开摄像头失败: ', err);
                    alert('打开摄像头失败');
                });
        }
    }

    const handleOver = () => {
        console.warn('离开房间');
        client.leave();
        returnJoin(1);
    }
    console.log('298----remoteStreams', remoteStreams)
    return (
        <div>
            <h1 className={styles.title}>Group View Page</h1>
            {/* 本地画面div */}
            <div className={styles.mainWindow} id='local-container' />
            {/* 远端画面 */}
            <div className={styles.subWindowWrapper}>
                {/* 远端画面divs */}
                {remoteStreams.length > 0 && remoteStreams.map((item: any) =>
                    <div
                        className={`${styles.subWindow} ${'remote-container'}`}
                        key={item.getId()}
                        data-uid={item.getId()}
                    />
                )}
            </div>
            {/* 静音、挂断、关闭视频 */}
            <a onClick={setOrRelieveSilence}>{isSilence ? '开启' : '关闭'}声音</a>&nbsp;&nbsp;&nbsp;
            <a onClick={handleOver}>挂断</a>&nbsp;&nbsp;&nbsp;
            <a onClick={stopOrOpenVideo}>{isStop ? '开启' : '关闭'}视频</a>&nbsp;&nbsp;&nbsp;
        </div>
    );
}
