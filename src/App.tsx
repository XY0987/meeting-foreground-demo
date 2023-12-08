import { useRoutes } from "react-router";
import routes from "./router";
import { useUserInfoToLocalHook } from "./hooks/utilHooks";
import { Fragment } from "react";

function App() {
  const element = useRoutes(routes);
  // 登录信息持久化
  const { userPersistence } = useUserInfoToLocalHook();
  userPersistence();
  return <Fragment>{element}</Fragment>;
}

export default App;
