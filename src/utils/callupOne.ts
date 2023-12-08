import { Socket, io } from "socket.io-client";

export const $serverSocketUrl = "ws://127.0.0.1:18080";

export function handleError(error: Error) {
  // alert("摄像头无法正常使用，请检查是否占用或缺失")
  console.error(
    "navigator.MediaDevices.getUserMedia error: ",
    error.message,
    error.name,
  );
}

type userInfo = {
  userId: number;
  roomId: number;
  nickname: string;
};

/* 
打电话需要等对方同意再接通
对方拒绝有提示
可以挂断电话
*/

/* 

添加流程而不是修改流程，打电话之前先来个callbefore

初始化函数接收以下几个参数
1. userId 用户id
2. roomId 房间id
3. nickname 用户名
4. setUserList 设置用户列表
5. callerBefore 收到电话之前执行的函数(如果传递，返回false表示拒绝，返回true表示接收)
6. refuseCallback 拒绝处理函数
*/

class Callup {
  linkSocket: Socket | undefined = undefined;
  rtcPcParams: any = {
    iceServers: [
      { url: "stun:stun.l.google.com:19302" }, // 谷歌的公共服务
    ],
  };
  roomUserList: any[] = [];
  userInfo: userInfo = {
    userId: -1,
    roomId: -1,
    nickname: "",
  }; //用户信息
  formInline: any = {
    rtcmessage: undefined,
    rtcmessageRes: undefined, //响应
  };
  localRtcPc: any = undefined;
  rtcmessage: any = undefined;
  // 用户id和房间id
  userId: number = -1;
  roomId: number = -1;
  // 目标用户id
  targetUid: number = -1;
  channel: any;
  userListCallback: any;
  callerBefore: (() => Promise<any>) | undefined;
  refuseCallback: any;
  lifeSureCall: any;
  setIsCall: any;
  // 初始化
  init(
    userId: number,
    roomId: number,
    nickname: string,
    setUserList: any,
    callerBefore?: any,
    refuseCallback?: any,
    lifeSureCall?: any,
    setIsCall?: any,
  ) {
    // 生命周期
    this.lifeSureCall = lifeSureCall;
    //
    this.userListCallback = setUserList;
    this.setIsCall = setIsCall;
    // 收到电话执行该函数,将打电话的对象传递给该函数
    this.callerBefore = callerBefore;
    this.refuseCallback = refuseCallback;
    // 初始化用户id
    this.userId = userId;
    this.roomId = roomId;
    this.userInfo = {
      userId: userId,
      roomId: roomId,
      nickname: nickname,
    };
    this.clientWS();
  }
  // 链接websocket
  clientWS() {
    // 连接websocket
    this.linkSocket = io($serverSocketUrl, {
      reconnectionDelayMax: 10000,
      transports: ["websocket"],
      query: {
        userId: this.userInfo.userId,
        roomId: this.userInfo.roomId,
        nickname: this.userInfo.nickname,
      },
    });
    // 监听连接回调
    this.linkSocket.on("connect", () => {
      // console.log("server init connect success", this.linkSocket);
    });
    // 监听房间用户列表
    this.linkSocket.on("roomUserList", (e) => {
      this.roomUserList = e;
      this.userListCallback(e);
    });
    // 监听用户消息回调
    this.linkSocket.on("msg", async (e) => {
      if (e["type"] === "join" || e["type"] === "leave") {
        setTimeout(() => {
          let params = { roomId: this.roomId };
          this.linkSocket?.emit("roomUserList", params);
        }, 1000);
      }
      // 打电话之前操作
      if (e["type"] === "beforeCall") {
        await this.beforeCall(e);
      }
      // 答应连接
      if (e["type"] === "success") {
        // await this.initCallerInfo(e.data.userId, e.data.targetUid);
        // this.linkSocket!.emit("call", {
        //   userId: e.data.userId,
        //   targetUid: e.data.targetUid,
        // });
        await this.call(e.data);
      }
      // 打电话
      if (e["type"] === "call") {
        await this.onCall(e);
      }
      // 监听offer回调，创建信令，用于发送给B
      if (e["type"] === "offer") {
        await this.onRemoteOffer(e["data"]["userId"], e["data"]["offer"]);
      }
      if (e["type"] === "answer") {
        await this.onRemoteAnswer(e["data"]["userId"], e["data"]["answer"]);
      }
      // 候选信息
      if (e["type"] === "candidate") {
        this.localRtcPc.addIceCandidate(e.data.candidate);
      }
    });
    this.linkSocket.on("error", (e) => {
      console.log("error", e);
    });
  }

  async clickBeforeCall(item: any) {
    this.linkSocket!.emit("beforeCall", {
      userId: this.userId,
      targetUid: item.userId,
    });
  }

  // 打电话
  async call(item: any) {
    this.initCallerInfo(item.userId, item.targetUid);
    this.targetUid = item.targetUid;
    let params = {
      userId: item.userId,
      targetUid: item.targetUid,
    };
    this.linkSocket?.emit("call", params);
  }
  // 初始化本地信息
  async initCallerInfo(callerId: any, calleeId: any) {
    //初始化pc
    this.localRtcPc = new RTCPeerConnection();
    //获取本地媒体并添加到pc中
    let localStream: any = await this.getLocalUserMedia({
      audio: true,
      video: true,
    });
    for (const track of localStream.getTracks()) {
      this.localRtcPc.addTrack(track);
    }
    // 本地dom渲染
    await this.setDomVideoStream("localdemo01", localStream);
    this.setIsCall && this.setIsCall(true);
    //回调监听
    this.onPcEvent(this.localRtcPc, callerId, calleeId);
    //创建offer
    let offer = await this.localRtcPc.createOffer({ iceRestart: true });
    //设置offer未本地描述
    await this.localRtcPc.setLocalDescription(offer);
    //发送offer给被呼叫端
    let params = { targetUid: calleeId, userId: callerId, offer: offer };
    this.linkSocket!.emit("offer", params);
  }
  // 打电话之前操作
  async beforeCall(e: any) {
    let res = true;
    if (this.callerBefore) {
      res = await this.callerBefore();
    }
    if (res) {
      this.linkSocket!.emit("success", {
        targetUid: e.data.targetUid,
        userId: e.data.userId,
      });
      // 处理接受函数
      this.lifeSureCall && this.lifeSureCall();
    } else {
      // 对方未接
    }
  }
  // 收到电话
  async onCall(e: any) {
    await this.initCalleeInfo(e.data["targetUid"], e.data["userId"]);
  }
  // 挂断电话
  async onCancle() {
    this.localRtcPc.close();
    this.setIsCall && this.setIsCall(false);
  }
  // 初始化收到电话(将自己的流信息添加到本地)
  async initCalleeInfo(localUid: any, fromUid: any) {
    //初始化pc
    this.localRtcPc = new RTCPeerConnection();
    //初始化本地媒体信息{ audio: true, video: true }
    let localStream: any = await this.getLocalUserMedia({
      audio: true,
      video: true,
    });
    // 本地的和web的使用一个音视频轨道
    for (const track of localStream.getTracks()) {
      this.localRtcPc.addTrack(track);
    }
    // dom渲染(本地)
    await this.setDomVideoStream("localdemo01", localStream);
    this.setIsCall && this.setIsCall(true);
    //监听(远程)
    this.onPcEvent(this.localRtcPc, localUid, fromUid);
  }
  // 创建信令
  async onRemoteOffer(fromUid: any, offer: any) {
    this.localRtcPc.setRemoteDescription(offer);
    let answer = await this.localRtcPc.createAnswer();
    await this.localRtcPc.setLocalDescription(answer);
    let params = {
      targetUid: fromUid,
      userId: this.userId,
      answer: answer,
    };
    this.linkSocket?.emit("answer", params);
  }
  // 创建应答
  async onRemoteAnswer(fromUid: any, answer: any) {
    await this.localRtcPc.setRemoteDescription(answer);
  }
  // 将新媒体流设置到页面中（本地的流）
  async setDomVideoStream(domId: string, newStream: any) {
    let video: any = document.getElementById(domId);
    let stream = video.srcObject;
    // 移除原本的流
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
  // 将另一个视频添加到轨道上（远程传递过来的）
  setRemoteDomVideoStream(domId: any, track: MediaStreamTrack) {
    let video: HTMLVideoElement = document.getElementById(
      domId,
    ) as HTMLVideoElement;
    let stream: any = video!.srcObject;
    if (stream) {
      stream.addTrack(track);
    } else {
      let newStream = new MediaStream();
      newStream.addTrack(track);
      video.srcObject = newStream;
      video.muted = true;
    }
  }
  // 获取本地流信息
  async getLocalUserMedia(constraints: any) {
    return await navigator.mediaDevices
      .getUserMedia(constraints)
      .catch(handleError);
  }
  // 监听事件(为流添加事件，统一处理，包括外部传递过来流信息)
  onPcEvent(
    pc: {
      createDataChannel: (arg0: string) => any;
      ontrack: (event: any) => void;
      onnegotiationneeded: (e: any) => void;
      ondatachannel: (ev: any) => void;
      onicecandidate: (event: any) => void;
    },
    localUid: any,
    remoteUid: any,
  ) {
    const that = this;
    this.channel = pc.createDataChannel("chat");
    // 监听远程媒体轨道即远端音视频信息
    pc.ontrack = function (event: { track: MediaStreamTrack }) {
      that.setRemoteDomVideoStream("remoteVideo01", event.track);
    };
    // 是收到 negotiationneeded 事件时调用的事件处理器，浏览器发送该事件以告知在将来某一时刻需要协商
    pc.onnegotiationneeded = function (e: any) {
      console.log("重新协商", e);
    };
    pc.ondatachannel = function (ev: {
      channel: {
        onopen: () => void;
        onmessage: (data: any) => void;
        onclose: () => void;
      };
    }) {
      ev.channel.onopen = function () {
        console.log("Data channel ------------open----------------");
      };
      ev.channel.onmessage = function (data: { data: any }) {
        console.log("Data channel ------------msg----------------", data);
        that.formInline.rtcmessageRes = data.data;
      };
      ev.channel.onclose = function () {
        console.log("Data channel ------------close----------------");
        // 挂断电话
        that.close();
      };
    };
    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        that.linkSocket!.emit("candidate", {
          targetUid: remoteUid,
          userId: localUid,
          // 将通信令牌发送过去
          candidate: event.candidate,
        });
      } else {
        /* 在此次协商中，没有更多的候选了 */
        console.log("在此次协商中，没有更多的候选了");
      }
    };
  }

  async close() {
    const videoInfo: any = await this.getLocalUserMedia({
      audio: true,
      video: true,
    });
    await this.setDomVideoStream("localdemo01", null);
    await this.setDomVideoStream("remoteVideo01", null);
    for (const track of videoInfo.getTracks()) {
      track.stop();
    }
  }
}
const callup = new Callup();
export default callup;
