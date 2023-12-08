import { useState, useEffect, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/user";

// 防抖hook
export const useDebounce = <V>(value: V, delay?: number): V => {
  const [debounceValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    // 每次在value变化以后设置一个定时器
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    // 每次在上一个useEffect处理完以后再运行(这里返回的一个函数会执行当前 effect 之前对上一个 effect 进行清除)
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounceValue;
};

// 倒计时hook
export function useCountDown(
  initCount = 10,
  callBack = () => {},
  endBack = () => {},
) {
  const timeId = useRef<{ id: number }>({ id: 0 });
  const [count, setCount] = useState(initCount);
  const [isdisable, setIsdisable] = useState(false);
  const start = () => {
    setCount(initCount);
    setIsdisable(true);
    timeId.current.id = window.setInterval(() => {
      setCount((count) => count - 1);
    }, 1000);
  };
  //   首先清除定时器
  useEffect(() => window.clearInterval(timeId.current.id), []);
  //   判断是否需要清除
  useEffect(() => {
    if (count !== initCount || isdisable) {
      callBack();
    }
    if (count === 0) {
      clearInterval(timeId.current.id);
      setCount(initCount);
      endBack();
      setIsdisable(false);
    }
  }, [callBack, count, initCount, endBack, isdisable]);
  return { start, count, isdisable };
}

// 用户信息持久化hook
export const useUserInfoToLocalHook = () => {
  const dispatch = useDispatch();
  const userInfo = useRef(useSelector((store: any) => store.user));
  // 获取用户信息
  const getUserInfo = () => {
    return userInfo.current;
  };

  // 信息丢失从服务器端获取用户信息
  const getUserInfoFromServer = async (token: string | null) => {
    // 可以使用接口获取信息
    const user = {};
    userInfo.current = user;
    dispatch(
      login({
        token,
        userInfo: user,
      }),
    );
  };

  // 登录信息持久化
  const userPersistence = async () => {
    const token = localStorage.getItem("token") || "";
    // 信息丢失，重新从服务器端获取
    if (userInfo.current.token === "" && token !== "") {
      await getUserInfoFromServer(token);
    }
  };

  // 登录
  const userLogin = async (token: string) => {
    // 存储token
    localStorage.setItem("token", token);
    await userPersistence();
  };

  // 退出登录
  const userLogout = () => {
    dispatch(
      login({
        token: "",
        userInfo: {},
      }),
    );
  };

  // 更新用户信息
  const userUpload = async () => {
    await getUserInfoFromServer(localStorage.getItem("token"));
  };

  return {
    getUserInfo,
    userPersistence,
    userLogin,
    userLogout,
    userUpload,
  };
};
