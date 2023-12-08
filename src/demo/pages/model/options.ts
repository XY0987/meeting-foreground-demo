import { modalFormType } from "../../../types/useModal";

export const modelDemoOptions: modalFormType[] = [
  {
    type: "input",
    label: "名字",
    name: "name",
    placeholder: "请输入名字",
    rules: [
      { required: true, message: "请输入名字" },
      { pattern: /(^\S)((.)*\S)?(\S*$)/, message: "前后不能有空格" },
    ],
  },
  {
    type: "textArea",
    name: "projectDesc",
    label: "个人简介",
    placeholder: "请输入个人简介",
    rules: [
      { required: true, message: "请输入个人简介" },
      { pattern: /(^\S)((.)*\S)?(\S*$)/, message: "前后不能有空格" },
    ],
  },
];
