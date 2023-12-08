import React from "react";

/*
input 文本框
textArea 文本框
inputNumber 数字框
radio 单选框
select 选择器
switch 开关
timeDefault 时间
timeRange 时间范围
file 文件(默认只判断图片)
editor 富文本
custom 自定义组件
*/
export type formItemType =
  | "input"
  | "textArea"
  | "inputNumber"
  | "radio"
  | "select"
  | "switch"
  | "timeDefault"
  | "timeRange"
  | "file"
  | "editor"
  | "custom";

/*
type：类型
rules：规则
label：form表单显示的左边的文本
name：对应的字段名
limit：限制文本字数或者文件个数
isShowTxtCount：是否显示文本字数
maxNumber：类型为数字框时，最大数字
minNumber：类型为数字框时，最小数字
step：小数
isCustom：是否是自定义组件
Custom：对应的自定义组件
placeholder：提示文本
defaultValues：form表单的默认值(修改时用)
data：类型为单选框或者选择框时的数据
isMultiple：是否支持多选
openTxt：开关开启时显示的文本
closeTxt：开关关闭时显示的文本
format：时间格式化
dataValue：类型为select/radio时确定回调时的字段名
dataName：类型为select/radio时显示的字段名
*/
export type modalFormType = {
  type?: formItemType;
  rules?: any[];
  label: string;
  name: string;
  limit?: number;
  isShowTxtCount?: boolean;
  maxNumber?: number;
  minNumber?: number;
  step?: any;
  isCustom?: boolean;
  Custom?: React.FC;
  placeholder?: string;
  defaultValues?: any;
  data?: any[];
  isMultiple?: boolean;
  openTxt?: string;
  closeTxt?: string;
  format?: string;
  dataValue?: string;
  dataName?: string;
};

/*
modal类型(分为普通或者表单形式)
由于行内布局传入配置过多暂不支持布局
*/
type modalType = "nomal" | "form";
/*
按钮类型
txt: 显示的文本内容
type：按钮类型
isDanger：是否危险
*/
export type modalButtonType = {
  txt?: string;
  type?: "default" | "primary" | "dashed" | "text" | "link";
  isDanger?: boolean;
};
/*
type: 弹窗类型
title: 弹窗头部显示文本
infoTxt:弹窗为普通类型时，提示文本信息
okBtn:确定按钮配置
cancelBtn:取消按钮配置
formOptions:form表单配置
isEdit:是否显示富文本
isUpload:是否上传图片
sendFn:点击确定，成功后发送数据
successCallback发送数据之后调用的函数
fileRules文件匹配规则
maxSize：文件上传大小限制(单位为m)
*/
export type modalPropsType = {
  type?: modalType;
  title?: string;
  infoTxt?: string;
  okBtn?: modalButtonType;
  cancelBtn?: modalButtonType;
  formOptions?: modalFormType[];
  isEdit?: boolean; //是否需要显示富文本
  isUpload?: boolean; //是否上传图片
  sendFn?: (data: any) => Promise<any>;
  successCallback?: (values?: any) => void;
  editorName?: string;
  fileRules?: string[];
  maxSize?: number;
};

export type modalPromiseType = {
  resolve?: any;
  reject?: any;
};
