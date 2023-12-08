import { useState } from "react";
import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router";

import style from "./index.module.scss";
import { useCountDown } from "../../../hooks/utilHooks";

export default function ForgetPassword() {
  const finishHandle = async (values: any) => {};

  const [form] = Form.useForm();
  const [isDis, setIsDis] = useState<boolean>(false);
  const onFinish = async (values: any) => {
    setIsDis(true);
    delete values.cpassword;
    await finishHandle(values);
    setIsDis(false);
  };
  const navigate = useNavigate();
  function jumpToReg() {
    navigate("/register");
  }

  function jumptoLogin() {
    navigate("/login");
  }
  const emailReg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const { start, count, isdisable } = useCountDown(
    60,
    () => {
      setCodeMessage(`${count}s后重新获取`);
    },
    () => {
      setCodeMessage("获取验证码");
    },
  );

  // 获取验证码
  const [codeMessage, setCodeMessage] = useState("获取验证码");
  function getCode() {
    const { userEmail } = form.getFieldsValue();
    if (emailReg.test(userEmail)) {
      // 获取验证码
      start();
    } else {
      form.setFields([{ name: "userEmail", errors: ["请输入正确的邮箱格式"] }]);
    }
  }

  return (
    <div>
      <div className={style.container}>
        <div className={style.background}></div>
        <div className={style.content}>
          <div className={style.header}>忘记密码</div>
          <Form
            form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 24 }}
            style={{ minWidth: 400 }}
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              label="邮箱"
              name="userEmail"
              rules={[
                { required: true, message: "请输入邮箱" },
                {
                  pattern: emailReg,
                  message: "请输入正确的邮箱格式",
                },
              ]}
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={[{ required: true, message: "请输入密码!" }]}
            >
              <Input.Password placeholder="6-10位包含数字和字母,不能包含空格" />
            </Form.Item>
            {/* 确认密码 */}
            <Form.Item
              label="确认密码"
              name="cpassword"
              rules={[
                { required: true, message: "请重复输入密码!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("请重复输入密码!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请重复输入密码" />
            </Form.Item>
            <Form.Item
              label="验证码"
              name="code"
              rules={[
                { required: true, message: "请输入验证码" },
                {
                  pattern: /^\d{4}$/,
                  message: "请输入4位验证码",
                },
              ]}
            >
              <div className={style.codeBox}>
                <Input placeholder="请输入验证码"></Input>
                <Button
                  onClick={getCode}
                  disabled={isdisable}
                  style={{ marginLeft: "10px" }}
                >
                  {codeMessage}
                </Button>
              </div>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" disabled={isDis}>
                修改
              </Button>
            </Form.Item>
            {true ? (
              <div className={style.toreg}>
                <Button onClick={jumpToReg} type="link">
                  还没有账号？注册
                </Button>
                <Button onClick={jumptoLogin} type="link">
                  已有账号？登录
                </Button>
              </div>
            ) : (
              <div className={style.toreg}>
                <Button
                  onClick={() => {
                    navigate(-1);
                  }}
                  type="link"
                >
                  返回
                </Button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
}
