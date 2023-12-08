import { RouteObject } from "react-router";
import AsyncHookDemo from "../pages/async";
import ModalHookDemo from "../pages/model";

const demoRoutes: RouteObject[] = [
  {
    path: "/demo",
    element: <AsyncHookDemo></AsyncHookDemo>,
  },
  {
    path: "/modal",
    element: <ModalHookDemo></ModalHookDemo>,
  },
];

export default demoRoutes;
