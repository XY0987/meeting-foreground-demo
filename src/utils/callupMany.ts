import { io } from "socket.io-client";
import { $serverSocketUrl, handleError } from "./callupOne";
import { VideoStreamMerger } from "./mergeStream";

var PeerConnection = window.RTCPeerConnection;

// 存储所有的建立连接（一对多）
var RtcPcMaps = new Map();

class CallupMany {
  formInline: any = {};
  localStream: any;
  linkSocket: any;
  centerDialogVisible: boolean = false;
  roomUserList: any[] = [];
  rtcPcParams = {
    iceServers: [],
  };
  mediaStatus = {
    audio: false,
    video: false,
  };
  setUserList: any;
  mergerVideo: VideoStreamMerger | null = null;

  // 进入会议初始化
  init(nickname: any, roomId: any, userId: any, setUserList: any) {
    this.formInline.nickname = nickname;
    this.formInline.roomId = roomId;
    this.formInline.userId = userId;
    this.setUserList = setUserList;
    this.clientWS();
  }
  // 连接到ws(初始化ws监听事件)
  clientWS() {
    const that = this;
    this.linkSocket = io($serverSocketUrl, {
      reconnectionDelayMax: 10000,
      transports: ["websocket"],
      query: that.formInline,
    });
    this.linkSocket.on("connect", async (_e: any) => {
      that.centerDialogVisible = false; //加入后
      //获取房间用户列表（新用户进房间后需要和房间内每个用户进行RTC连接 后进入着主动push offer）
      setTimeout(() => {
        that.linkSocket.emit("roomUserList", {
          roomId: that.formInline.roomId,
        });
      }, 500);
    });
    // 用户列表(加入会议的所有人)
    this.linkSocket.on("roomUserList", (e: any) => {
      that.roomUserList = e;
      that.setUserList(e);
      //拿到房间用户列表之后开始建立RTC连接
      that.initMeetingRoomPc();
    });
    // 接收到消息
    this.linkSocket.on("msg", async (e: any) => {
      if (e["type"] === "join" || e["type"] === "leave") {
        const userId = e["data"]["userId"];
        const nickname = e["data"]["nickname"];
        // 加入房间
        if (e["type"] === "join") {
          that.roomUserList.push({
            userId: userId,
            nickname: nickname,
            roomId: that.formInline.roomId,
          });
        } else {
          // 离开房间
          RtcPcMaps.delete(that.formInline.userId + "-" + userId);
          that.removeChildVideoDom(userId);
        }
      }
      // 收到信令
      if (e["type"] === "offer") {
        await that.onRemoteOffer(e["data"]["userId"], e["data"]["offer"]);
      }
      // 收到应答
      if (e["type"] === "answer") {
        await that.onRemoteAnswer(e["data"]["userId"], e["data"]["answer"]);
      }
      // 收到候选信息
      if (e["type"] === "candidate") {
        that.onCandiDate(e["data"]["userId"], e["data"]["candidate"]);
      }
    });
    // ws连接出现错误
    this.linkSocket.on("error", (e: any) => {
      console.log("error", e);
    });
  }

  // 共享桌面
  async shareDesk() {
    this.mergerVideo?.destroy();
    this.mergerVideo = null;
    const newStream = await this.getLocalDeskMedia();
    this.localStream = newStream;
    this.replaceRemoteStream(newStream);
  }
  // 开启摄像头(合并后的音视频)
  async shareAssignSchema() {
    this.mergerVideo?.destroy();
    this.mergerVideo = null;
    const newStream = await this.getAssignMedia();
    this.localStream = newStream;
    this.replaceRemoteStream(newStream);
  }
  // 显示默认视频流(只有摄像头)
  async shareDefault() {
    this.mergerVideo?.destroy();
    this.mergerVideo = null;
    const newStream = await this.getLocalUserMedia();
    this.localStream = newStream;
    this.replaceRemoteStream(newStream);
  }

  // 获取摄像头设备信息
  async getLocalUserMedia() {
    const audioId = this.formInline.audioInId;
    const videoId = this.formInline.videoId;
    const constraints = {
      audio: { deviceId: audioId ? { exact: audioId } : undefined },
      video: {
        deviceId: videoId ? { exact: videoId } : undefined,
        width: 640,
        height: 480,
        frameRate: { ideal: 20, max: 24 },
      },
    };
    if ((window as any).stream) {
      (window as any).stream.getTracks().forEach((track: any) => {
        track.stop();
      });
    }
    return await navigator.mediaDevices
      .getUserMedia(constraints)
      .catch(handleError);
  }
  // 获取共享桌面视频流
  async getLocalDeskMedia() {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    });
    const audioTrack = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    // 添加声音轨道
    stream.addTrack(audioTrack.getAudioTracks()[0]);
    return stream;
  }
  // 获取合并后的视频流
  async getAssignMedia() {
    const audioId = this.formInline.audioInId;
    const videoId = this.formInline.videoId;
    let localstream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: audioId ? { exact: audioId } : undefined },
      video: {
        deviceId: videoId ? { exact: videoId } : undefined,
        width: 1920,
        height: 1080,
        frameRate: { ideal: 15, max: 24 },
      },
    });
    let shareStream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
      audio: false,
    });
    this.mergerVideo = new VideoStreamMerger({ fps: 24, clearRect: true });
    this.mergerVideo.addStream(shareStream, {
      x: 0,
      y: 0,
      width: this.mergerVideo.width,
      height: this.mergerVideo.height,
      mute: true,
    });
    this.mergerVideo.addStream(localstream, {
      x: 0,
      y: 0,
      width: 200,
      height: 150,
      mute: false,
    });
    this.mergerVideo.start();
    return this.mergerVideo.result;
  }

  // 切换远程流
  async replaceRemoteStream(newStream: any) {
    // 先关闭原始的音视频流
    if ((window as any).stream) {
      (window as any).stream.getTracks().forEach((track: any) => {
        track.stop();
      });
    }
    await this.setDomVideoStream("localdemo01", newStream);
    const [videoTrack] = newStream.getVideoTracks();
    //多个RTC关联
    RtcPcMaps.forEach((e) => {
      const senders = e.getSenders();
      const send = senders.find((s: any) => s.track.kind === "video");
      send.replaceTrack(videoTrack);
    });
  }
  // 遍历建立联系
  async initMeetingRoomPc() {
    const that = this;
    if (!this.localStream) {
      this.localStream = await this.getLocalUserMedia();
      //开始静音和关闭摄像头
      this.initMediaStatus();
    }
    this.setDomVideoStream("localdemo01", this.localStream);
    const localUid = this.formInline.userId;
    let others = this.roomUserList
      .filter((e: any) => e.userId !== localUid)
      .map((e: any, index: any) => {
        return e.userId;
      });
    // 遍历其他用户，建立连接
    others.forEach(async (uid: any) => {
      let pcKey = localUid + "-" + uid;
      let pc = RtcPcMaps.get(pcKey);
      if (!pc) {
        pc = new PeerConnection(that.rtcPcParams);
        RtcPcMaps.set(pcKey, pc);
      }
      for (const track of that.localStream.getTracks()) {
        pc.addTrack(track);
      }
      //创建offer
      let offer = await pc.createOffer({ iceRestart: true });
      //设置offer未本地描述
      await pc.setLocalDescription(offer);
      //发送offer给被呼叫端
      let params = { targetUid: uid, userId: localUid, offer: offer };
      that.linkSocket.emit("offer", params);
      that.onPcEvent(pc, localUid, uid);
    });
  }
  // 设置本地音视频
  async setDomVideoStream(domId: any, newStream: any) {
    let video = document.getElementById(domId) as any;
    let stream = video.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach((e: any) => {
        stream.removeTrack(e);
      });
      stream.getVideoTracks().forEach((e: any) => {
        stream.removeTrack(e);
      });
    }
    video.srcObject = newStream;
    video.muted = true;
  }
  // 会议有人离开了，把对应的video元素给删除掉
  removeChildVideoDom(domId: any) {
    let video = document.getElementById(domId) as any;
    if (video) {
      video.parentNode.removeChild(video);
    }
  }
  // 有人进入会议创建对应的video元素
  createRemoteDomVideoStream(domId: any, trick: any) {
    let parentDom = document.getElementById("allVideo") as any;
    let id = domId + "-media";
    let video = document.getElementById(id) as any;
    if (!video) {
      video = document.createElement("video");
      video.id = id;
      video.controls = true;
      video.autoplay = true;
      video.muted = true;
      video.style.width = "100%";
      video.style.height = "100%";
    }
    let stream = video.srcObject;
    if (stream) {
      stream.addTrack(trick);
    } else {
      let newStream = new MediaStream();
      newStream.addTrack(trick);
      video.srcObject = newStream;
      video.muted = false;
      parentDom.appendChild(video);
    }
  }
  // 事件监听
  onPcEvent(pc: any, localUid: any, remoteUid: any) {
    const that = this;
    pc.ontrack = function (event: any) {
      that.createRemoteDomVideoStream(remoteUid, event.track);
    };
    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        that.linkSocket.emit("candidate", {
          targetUid: remoteUid,
          userId: localUid,
          candidate: event.candidate,
        });
      } else {
        /* 在此次协商中，没有更多的候选了 */
        console.log("在此次协商中，没有更多的候选了");
      }
    };
  }
  // 候选信息
  onCandiDate(fromUid: any, candidate: any) {
    const localUid = this.formInline.userId;
    let pcKey = localUid + "-" + fromUid;
    let pc = RtcPcMaps.get(pcKey);
    pc.addIceCandidate(candidate);
  }
  // 创建offer
  async onRemoteOffer(fromUid: any, offer: any) {
    const localUid = this.formInline.userId;
    let pcKey = localUid + "-" + fromUid;
    let pc = RtcPcMaps.get(pcKey);
    if (!pc) {
      pc = new PeerConnection(this.rtcPcParams);
      RtcPcMaps.set(pcKey, pc);
    }
    this.onPcEvent(pc, localUid, fromUid);
    for (const track of this.localStream.getTracks()) {
      pc.addTrack(track);
    }
    // this.localStream.getAudioTracks[0];
    await pc.setRemoteDescription(offer);
    let answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    let params = { targetUid: fromUid, userId: localUid, answer: answer };
    this.linkSocket.emit("answer", params);
  }
  // 创建answer
  async onRemoteAnswer(fromUid: any, answer: any) {
    const localUid = this.formInline.userId;
    let pcKey = localUid + "-" + fromUid;
    let pc = RtcPcMaps.get(pcKey);
    await pc.setRemoteDescription(answer);
  }
  // 打开或关闭麦克风
  audioControl(b: any) {
    RtcPcMaps.forEach((v, k) => {
      const senders = v.getSenders();
      const send = senders.find((s: any) => s.track.kind === "audio");
      send.track.enabled = b;
      this.mediaStatus.audio = send.track.enabled;
    });
    this.localStream.getAudioTracks()[0].enabled = b;
    this.mediaStatus.audio = b;
  }
  // 打开或关闭视频
  videoControl(b: any) {
    RtcPcMaps.forEach((v, k) => {
      const senders = v.getSenders();
      const send = senders.find((s: any) => s.track.kind === "video");
      send.track.enabled = b;
      this.mediaStatus.video = send.track.enabled;
    });
    this.localStream.getVideoTracks()[0].enabled = b;
    this.mediaStatus.video = b;
  }
  // 默认静音和关闭摄像头
  initMediaStatus() {
    // this.localStream.getVideoTracks()[0].enabled = false;
    // this.localStream.getAudioTracks()[0].enabled = false;
    // console.log("进入房间默认已关闭你的麦克风和摄像头，请手动打开");
  }
  // 获取对应dom元素对应的音频状态
  getAudioStatus(domId: any) {
    console.log("domId", domId);
    let video = document.getElementById(domId) as any;
    let stream = video.srcObject;
    return stream.getAudioTracks()[0].enabled;
  }
}
const callupMeeting = new CallupMany();
export default callupMeeting;
