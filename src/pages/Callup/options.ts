import { modalFormType } from "../../types/useModal";

export const joinConfig: modalFormType[] = [
  {
    type: "input",
    label: "用户名",
    name: "nickname",
    placeholder: "请输入用户名",
    rules: [{ required: true, message: "请输入用户名" }],
  },
  {
    type: "input",
    label: "房间id",
    name: "roomId",
    placeholder: "请输入房间号",
    rules: [{ required: true, message: "请输入房间号" }],
  },
  {
    type: "input",
    label: "用户id",
    name: "userId",
    placeholder: "请输入用户id",
    rules: [{ required: true, message: "请输入用户id" }],
  },
];
