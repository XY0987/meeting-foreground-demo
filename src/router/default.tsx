import { RouteObject } from "react-router";
import NotAuth from "../components/auth/NotAuth";
import Login from "../pages/noAuth/login";
import ForgetPassword from "../pages/noAuth/forgetPassword";
import Register from "../pages/noAuth/register";
import Meeting from "../pages/Meeting";
import Call from "../pages/Callup";

const defaultRoutes: RouteObject[] = [
  {
    path: "/",
    element: <NotAuth title="音视频直播会议" Element={Meeting}></NotAuth>,
  },
  {
    path: "/call",
    element: <NotAuth title="点对点音视频通话" Element={Call}></NotAuth>,
  },
  {
    path: "/login",
    element: <NotAuth title="登录" Element={Login}></NotAuth>,
  },
  {
    path: "/register",
    element: <NotAuth title="注册" Element={Register}></NotAuth>,
  },
  {
    path: "/forgetPassword",
    element: <NotAuth title="忘记密码" Element={ForgetPassword}></NotAuth>,
  },
];

export default defaultRoutes;
