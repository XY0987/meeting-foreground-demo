import axios from "axios";

import type { AxiosInstance } from "axios";
import { RequestConfig } from "../types/server";

class Request {
  // request实例=>axios的实例
  instance: AxiosInstance;
  constructor(config: RequestConfig) {
    this.instance = axios.create(config);
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        //  全局请求成功的拦截
        // console.log("全局请求成功");
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = token;
        }
        return config;
      },
      (err) => {
        // console.log("全局请求失败的拦截器");
        return err;
      },
    );
    // 响应拦截器
    this.instance.interceptors.response.use(
      (res) => {
        // 这里可以判断状态码与antd的message相结合实现全局的消息提醒
        return res.data;
      },
      (err) => {
        return err;
      },
    );
  }

  //   封装网络请求的方法
  request<T = any>(config: RequestConfig<T>) {
    // 单次请求的成功拦截处理
    if (config.interceptors?.requsetSuccessFn) {
      config = config.interceptors.requsetSuccessFn(config);
    }
    // 返回Promise
    return new Promise<T>((resolve, reject) => {
      this.instance
        .request<any, T>(config)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  get<T = any>(config: RequestConfig<T>) {
    return this.request({ ...config, method: "GET" });
  }
  post<T = any>(config: RequestConfig<T>) {
    return this.request({ ...config, method: "POST" });
  }
  delete<T = any>(config: RequestConfig<T>) {
    return this.request({ ...config, method: "DELETE" });
  }
  patch<T = any>(config: RequestConfig<T>) {
    return this.request({ ...config, method: "PATCH" });
  }
}

export default Request;

export const defaultRequest = new Request({
  baseURL: "/api",
});
