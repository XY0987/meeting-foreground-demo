import { useEffect, useRef, useState } from "react";
import { Button, Drawer } from "antd";

import style from "./index.module.scss";

import { useModal } from "../../hooks/useModal";
import Callup from "../../utils/callupOne";
import { joinConfig } from "./options";

export const getParams = (queryName: string) => {
  let url = window.location.href;
  let query = decodeURI(url.split("?")[1]);
  let vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] === queryName) {
      return pair[1];
    }
  }
  return null;
};

export default function Call() {
  const [open, setOpen] = useState<boolean>(false);
  const currentUserId = useRef<number>(0);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const [userList, setUserList] = useState<any[]>([]);
  // 是否在打电话
  const [isCall, setIsCall] = useState<boolean>(false);
  const { init, messageTips } = useModal({
    type: "nomal",
    infoTxt: "有人给您打电话，是否接收?",
  });
  const { init: callInit } = useModal({
    type: "form",
    formOptions: joinConfig,
  });
  const joinIn = () => {
    callInit()
      .then((res: any) => {
        console.log(res);
        const userId = res.userId;
        const roomId = res.roomId;
        const nick = res.nickname;
        currentUserId.current = userId;
        Callup.init(
          userId,
          roomId,
          nick,
          setUserList,
          init,
          messageTips,
          lifeSureCall,
          setIsCall,
        );
      })
      .catch((err) => {});
  };
  const lifeSureCall = () => {
    setOpen(true);
  };
  const callFn = (item: any) => {
    Callup.clickBeforeCall(item);
  };

  const cancel = () => {
    Callup.onCancle();
  };
  useEffect(() => {
    // 去获取全部用户的头像信息
  }, [userList]);

  return (
    <div style={{ padding: 20 }}>
      <Button
        onClick={joinIn}
        type="primary"
        style={{ backgroundColor: "#3c64e6", marginRight: 30 }}
      >
        进入
      </Button>

      <Button
        onClick={showDrawer}
        type="primary"
        style={{ backgroundColor: "#E6A23C" }}
      >
        在线用户
      </Button>
      <Drawer
        size="large"
        title="在线用户"
        placement="right"
        onClose={onClose}
        open={open}
      >
        <div>
          <video
            src=""
            id="localdemo01"
            style={{ width: 300, height: 300 }}
            controls
          ></video>
          <video
            src=""
            id="remoteVideo01"
            style={{ width: 300, height: 300, marginLeft: "20px" }}
            controls
          ></video>
          {isCall ? (
            <Button type="link" onClick={cancel}>
              挂断
            </Button>
          ) : null}
          {userList.map((item) => {
            return (
              <div key={item.userId}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <img
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      marginRight: "10px",
                    }}
                    className={style.userImg}
                    src={
                      "https://ts1.cn.mm.bing.net/th/id/R-C.8b8815bd3d2586a5e52289906a871351?rik=KQP2jurRyby%2f5w&riu=http%3a%2f%2fwww.people.com.cn%2fmediafile%2fpic%2f20170422%2f47%2f7756515709911238667.jpg&ehk=QsXD3SgsszjjZuQhcfjytA7qRf7OfqlArRDUiwiopMI%3d&risl=&pid=ImgRaw&r=0"
                    }
                    alt=""
                  />
                  <span>{item.nickname}</span>
                  {currentUserId.current &&
                  currentUserId.current === item.userId ? null : (
                    <Button
                      disabled={isCall}
                      type="link"
                      onClick={() => callFn(item)}
                    >
                      通话
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Drawer>
    </div>
  );
}
