import { Button, Form, Input } from "antd";

import { useNavigate } from "react-router";
import style from "./index.module.scss";
import { useUserInfoToLocalHook } from "../../../hooks/utilHooks";

export default function Login() {
  const navigate = useNavigate();
  const { userLogin } = useUserInfoToLocalHook();

  function jumpToForget() {
    navigate("/forgetPassword");
  }
  function finishHandle(values: any) {
    // 登录成功将token传递
    userLogin("");
  }

  function jumpToReg() {
    navigate("/register");
  }

  return (
    <div className={style.container}>
      <div className={style.background}></div>
      <div className={style.content}>
        <div className={style.header}>登录</div>
        <Form
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 24 }}
          style={{ minWidth: 400 }}
          onFinish={finishHandle}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            label="邮箱"
            name="userEmail"
            rules={[
              { required: true, message: "请输入邮箱" },
              {
                pattern:
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              登录
            </Button>
          </Form.Item>
          <div className={style.toreg}>
            <Button onClick={jumpToForget} type="link">
              忘记密码?找回密码
            </Button>
            <Button onClick={jumpToReg} type="link">
              还没有账号？注册
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
