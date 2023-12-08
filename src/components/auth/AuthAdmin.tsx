import { useEffect } from "react";
import { NavigateFunction, useNavigate } from "react-router";
import { useUserInfoToLocalHook } from "../../hooks/utilHooks";

export default function AuthAdmin({
  title,
  Element,
  callBack = undefined,
}: {
  title: string;
  Element: React.FC;
  callBack?: (navigate: NavigateFunction, userInfo: any) => void;
}) {
  const navigate = useNavigate();
  const { getUserInfo } = useUserInfoToLocalHook();
  const user = getUserInfo();
  callBack && callBack(navigate, user.userInfo);
  useEffect(() => {
    // 如果没有登录,并且没有传入回调函数
    if (!user.token && !callBack && !localStorage.getItem("token")) {
      navigate("/");
      return;
    }
    // 权限不对
    if (user.userInfo.userPower === "user") {
      navigate("/");
      return;
    }
    document.title = title;
  }, []);
  return <Element></Element>;
}
