import {
  Button,
  Form,
  FormInstance,
  Input,
  Space,
  DatePicker,
  Select,
  Switch,
  Radio,
  InputNumber,
  TimePicker,
} from "antd";
import React, { useEffect, useState } from "react";
import { useCallback } from "react";
import { UploadFiles } from "../components/utils/UploadFiles";
import { modalButtonType, modalFormType } from "../types/useModal";

const { RangePicker } = DatePicker;
/*
    传递配置对象()
    1. 成功回调
    2.失败回调
    3.配置对象（自动生成form表单）
    4.类型是否使用自定义控件
    */
type formProp = {
  success: (values: any) => void;
  cancel: () => void;
  okBtn: modalButtonType;
  cancelBtn: modalButtonType;
  options?: modalFormType[]; //普通组件配置对象
  isEdit?: boolean; //是否需要显示富文本
  isUpload?: boolean; //是否上传图片
  editorName?: string;
  fileRules?: string[];
  maxSize?: number;
};

type MyformProp = {
  defaultValue: any;
};
// 使用富文本字段是comment,上传文件是file
export const useForm = (formProp: formProp) => {
  const {
    success,
    cancel,
    okBtn,
    cancelBtn,
    options = [],
    isEdit,
    isUpload,
    editorName,
    fileRules = ["image/png", "image/jpg", "image/jpeg", "image/webp"],
    maxSize = 5,
  } = formProp;
  const MyForm = ({ defaultValue = {} }: MyformProp) => {
    const formRef = React.useRef<FormInstance>(null);
    const [html, setHtml] = useState<string>("");
    const [txt, setTxt] = useState<string>("");
    const [fileList, setFileList] = useState<any>([]);
    // 初始化
    useEffect(() => {
      formRef.current?.setFieldsValue(defaultValue);
    }, [defaultValue]);
    const onFinish = useCallback(
      (values: any) => {
        if (isEdit) {
          if (txt.replace(/(^\s*)|(\s*$)/g, "") === "") {
            formRef.current?.setFields([
              { name: editorName!, errors: ["请输入内容"] },
            ]);
            return;
          }
          values[editorName!] = html;
        }
        if (isUpload) {
          if (fileList.length === 0) {
            formRef.current?.setFields([
              { name: "file", errors: ["请上传图片"] },
            ]);
            return;
          }
          const notTrueFile = fileList.filter((item: any) => {
            return !fileRules.includes(item.type);
          });
          if (notTrueFile.length > 0) {
            formRef.current?.setFields([
              { name: "file", errors: ["请上传指定格式文件"] },
            ]);
            return;
          }
          // 判断文件大小
          const notTrueSizeFile = fileList.filter((item: any) => {
            return item.size > maxSize * 1024 * 1024;
          });
          if (notTrueSizeFile.length > 0) {
            formRef.current?.setFields([
              { name: "file", errors: ["文件过大"] },
            ]);
            return;
          }
          values.file = fileList;
        }
        success(values);
      },
      [html, fileList, txt],
    );
    const fileChange = useCallback((fileList: any) => {
      if (fileList.length >= 0) {
        formRef.current?.setFields([{ name: "file", errors: [""] }]);
      }
      setFileList(fileList);
    }, []);
    const onFinishFailed = useCallback(() => {}, []);
    const onReset = useCallback(() => {
      formRef.current?.resetFields();
    }, []);
    const htmlOnChange = useCallback((values: string, txt: string) => {
      if (txt.replace(/(^\s*)|(\s*$)/g, "") !== "") {
        formRef.current?.setFields([{ name: editorName!, errors: [""] }]);
      }
      setTxt(txt);
      setHtml(values);
    }, []);
    return (
      <Form
        ref={formRef}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 20 }}
        initialValues={{ remember: true }}
        autoComplete="off"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {options.map((item: modalFormType, index: number) => {
          let attr = {};
          if (item.isMultiple) {
            attr = {
              mode: "multiple",
            };
          }
          return item.Custom ? (
            // 存放自定义组件
            <Form.Item name={item.name} label={item.label}>
              <item.Custom></item.Custom>
            </Form.Item>
          ) : item.type === "switch" ? (
            <Form.Item
              key={`${index}-${item.name}`}
              label={item.label}
              name={item.name}
              rules={item.rules}
              valuePropName="checked"
            >
              {/* 开关 */}
              {item.type === "switch" ? (
                <Switch
                  checkedChildren={item.openTxt}
                  unCheckedChildren={item.closeTxt}
                />
              ) : null}
            </Form.Item>
          ) : (
            <Form.Item
              key={`${index}-${item.name}`}
              label={item.label}
              name={item.name}
              rules={item.rules}
            >
              {/* 普通输入框 */}
              {item.type === "input" ? (
                <Input placeholder={item.placeholder}></Input>
              ) : null}
              {/* 时间 */}
              {item.type === "timeDefault" ? (
                <TimePicker format={item.format}></TimePicker>
              ) : null}
              {/* 日期范围 */}
              {item.type === "timeRange" ? (
                <RangePicker format={item.format} showTime />
              ) : null}
              {/* 多选框 */}
              {item.type === "select" ? (
                <Select
                  {...attr}
                  style={{ width: 300 }}
                  placeholder={item.placeholder}
                >
                  {item.data?.map((data: any) => {
                    return (
                      <Select.Option
                        value={data[item.dataValue!]}
                        key={data.id}
                      >
                        {data.dataName}
                      </Select.Option>
                    );
                  })}
                </Select>
              ) : null}
              {/* 富文本 */}
              {item.type === "editor" ? <div>待开发</div> : null}
              {/* 文本框 */}
              {item.type === "textArea" ? (
                <Input.TextArea
                  showCount={item.isShowTxtCount}
                  placeholder={item.placeholder}
                  maxLength={item.limit}
                ></Input.TextArea>
              ) : null}
              {/* 文件 */}
              {item.type === "file" ? (
                <UploadFiles
                  fileList={defaultValue?.file}
                  onChangeFn={fileChange}
                  limit={item.limit ? item.limit : 1}
                ></UploadFiles>
              ) : null}
              {/* 单选框(主要是性别) */}
              {item.type === "radio" ? (
                <Radio.Group>
                  {item.data?.map((data: any) => {
                    return (
                      <Radio value={data[item.dataValue!]} key={data.id}>
                        {data[item.dataName!]}
                      </Radio>
                    );
                  })}
                </Radio.Group>
              ) : null}
              {/* 数字框 */}
              {item.type === "inputNumber" ? (
                <InputNumber
                  min={item.minNumber}
                  max={item.maxNumber}
                  defaultValue={item.minNumber}
                  step={item.step}
                />
              ) : null}
            </Form.Item>
          );
        })}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Space wrap>
            <Button type={okBtn.type} danger={okBtn.isDanger} htmlType="submit">
              {okBtn.txt}
            </Button>
            <Button danger htmlType="button" onClick={onReset}>
              重置
            </Button>
            <Button
              onClick={cancel}
              type={cancelBtn.type}
              danger={cancelBtn.isDanger}
            >
              {cancelBtn.txt}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  return {
    MyForm,
  };
};
