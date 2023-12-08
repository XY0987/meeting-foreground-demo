import { useCallback, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Button, ConfigProvider, Modal, message } from "antd";
import { useState } from "react";
import { useForm } from "./useForm";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { ArgsProps } from "antd/es/message";
import type { modalPromiseType, modalPropsType } from "../types/useModal";

export const useModal = (props: modalPropsType = {}) => {
  const {
    type = "nomal",
    title = "提示",
    infoTxt = "这是一段提示",
    okBtn = {
      txt: "确定",
      type: "primary",
      isDanger: false,
    },
    cancelBtn = {
      txt: "取消",
      type: "default",
      isDanger: false,
    },
    successCallback = () => {},
    formOptions = [],
    isEdit = false,
    isUpload = false,
    sendFn, //发送数据函数(记得数据处理)
    editorName,
    fileRules,
    maxSize,
  } = props;
  const [show, setShow] = useState<boolean>(false);
  const [promiseRes, setPromiseRes] = useState<modalPromiseType>();
  const [containerEle, setContainerEle] = useState<HTMLElement | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [isMessage, setIsMessage] = useState<boolean>(false);
  // 原本默认值时数组导致输入有问题
  const [defaultValue, setDefaultValue] = useState<any>({});
  const [root, setRoot] = useState<any>(null);
  // 卸载节点
  const unMounted = useCallback(() => {
    if (containerEle || document.getElementById("myContainer")) {
      document.body.removeChild(
        document.getElementById("myContainer") as HTMLElement,
      );
      setContainerEle(null);
      root?.unmount();
    }
  }, [containerEle, root]);
  // 点击确定按钮的回调函数
  const success = useCallback(
    async (values: any) => {
      promiseRes?.resolve(type === "nomal" ? true : values);
      setShow(false);
      unMounted();
      if (sendFn) {
        await sendFn(values);
        // 可进行数据更新
        successCallback && successCallback();
        messageApi.open({
          type: "warning",
          content: "This is a warning message",
        });
      }
    },
    [promiseRes, unMounted, successCallback, type, sendFn, messageApi],
  );
  // 取消
  const cancel = useCallback(() => {
    promiseRes?.reject(false);
    setShow(false);
    messageApi.open({
      type: "warning",
      content: "已取消",
    });
    unMounted();
  }, [unMounted, promiseRes, messageApi]);
  // 获取form表单结果
  const { MyForm } = useForm({
    cancel,
    success,
    okBtn,
    cancelBtn,
    options: formOptions,
    isEdit,
    isUpload,
    editorName,
    fileRules,
    maxSize,
  });
  // 挂载节点
  useEffect(() => {
    if (!show || !containerEle) {
      return;
    }
    // 根据类型，去判断是简单的弹窗还是form表单
    root.render(
      <ConfigProvider locale={zhCN}>
        {contextHolder}
        {isMessage ? null : (
          <Modal
            onCancel={cancel}
            open={show}
            onOk={success}
            destroyOnClose={true}
            title={title}
            wrapClassName="modal-wrap"
            cancelButtonProps={{ shape: "round" }}
            okButtonProps={{ shape: "round" }}
            width={900}
            footer={
              type === "form"
                ? null
                : [
                    <Button
                      key="success"
                      type={okBtn.type}
                      onClick={success}
                      danger={okBtn.isDanger}
                    >
                      {okBtn.txt}
                    </Button>,
                    <Button
                      key="cancel"
                      onClick={cancel}
                      danger={cancelBtn.isDanger}
                      type={cancelBtn.type}
                    >
                      {cancelBtn.txt}
                    </Button>,
                  ]
            }
            getContainer={containerEle as HTMLElement}
          >
            {type === "form" && (
              <MyForm defaultValue={defaultValue || {}}></MyForm>
            )}
            {type === "nomal" && <p>{infoTxt}</p>}
          </Modal>
        )}
      </ConfigProvider>,
    );
  }, [
    show,
    MyForm,
    root,
    cancel,
    containerEle,
    title,
    infoTxt,
    okBtn,
    cancelBtn,
    success,
    type,
    contextHolder,
    defaultValue,
    isMessage,
  ]);
  // 初始化
  const init = (defaultValue?: any) => {
    defaultValue && setDefaultValue(defaultValue);
    setShow(true);
    setIsMessage(false);
    // 创建挂载节点
    const div = document.createElement("div");
    div.id = "myContainer";
    document.body.append(div);
    setContainerEle(div);
    setRoot(ReactDOM.createRoot(div as HTMLElement));
    return new Promise((resolve, reject) => {
      setPromiseRes({ resolve, reject });
    });
  };
  const messageTips = (configs: ArgsProps) => {
    setShow(true);
    setIsMessage(true);
    // 创建挂载节点
    const div = document.createElement("div");
    div.id = "myContainer";
    document.body.append(div);
    setContainerEle(div);
    setRoot(ReactDOM.createRoot(div as HTMLElement));
    setTimeout(() => {
      // 设置一个低优先级
      messageApi.open({
        ...configs,
        onClose: unMounted,
      });
    }, 0);
  };
  return { init, messageTips };
};
