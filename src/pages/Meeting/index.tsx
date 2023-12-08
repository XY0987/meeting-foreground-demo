import React, { useState } from "react";

import style from "./index.module.scss";
import { Button } from "antd";
import { joinConfig } from "./options";
import { useModal } from "../../hooks/useModal";
import callupMeeting from "../../utils/callupMany";

export default function Meeting() {
  const { init } = useModal({
    type: "form",
    formOptions: joinConfig,
  });
  const [userList, setUserList] = useState<any[]>([]);

  const [cameraisOpen, setCameraIsOpen] = useState<boolean>(false);
  const [audioIsOpen, setAudioIsOpen] = useState<boolean>(false);
  const [isJoin, setIsJoin] = useState<boolean>(false);

  const join = () => {
    init()
      .then((res: any) => {
        callupMeeting.init(res.nickname, res.roomId, res.userId, setUserList);
        setIsJoin(true);
      })
      .catch((err) => {});
  };
  const openCamera = () => {
    setCameraIsOpen((value) => {
      callupMeeting.videoControl(!value);
      return !value;
    });
  };

  const openAudio = () => {
    setAudioIsOpen((value) => {
      callupMeeting.videoControl(!value);
      return !value;
    });
  };

  const showMerge = () => {
    // callupMeeting.replaceRemoteStream();
    callupMeeting.shareAssignSchema();
  };

  const showDefault = () => {
    callupMeeting.shareDefault();
  };

  const showDesk = () => {
    callupMeeting.shareDesk();
  };

  const quit = () => {
    console.log("退出");
  };
  return (
    <div className={style.container}>
      <div className={style.options}>
        {isJoin ? (
          <Button onClick={quit}>退出会议</Button>
        ) : (
          <Button onClick={join}>加入会议</Button>
        )}
        <Button onClick={openCamera} disabled={!isJoin}>
          {cameraisOpen ? "关闭摄像头" : "开启摄像头"}
        </Button>
        <Button onClick={openAudio} disabled={!isJoin}>
          {audioIsOpen ? "关闭麦克风" : "关闭麦克风"}
        </Button>
        <Button onClick={showDefault} disabled={!isJoin}>
          显示摄像头
        </Button>
        <Button onClick={showDesk} disabled={!isJoin}>
          共享桌面信息
        </Button>
        <Button onClick={showMerge} disabled={!isJoin}>
          显示屏幕和摄像头信息
        </Button>
      </div>
      <div>
        <video
          id="localdemo01"
          className={style.localdemo01}
          autoPlay
          muted
          controls
        ></video>
        <div id="allVideo" className={style.allVideo}>
          {userList.map((item) => {
            return <div key={item.userId} id={item.userId}></div>;
          })}
        </div>
      </div>
    </div>
  );
}
