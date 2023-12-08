import type { AxiosRequestConfig, AxiosResponse } from "axios";

export interface RequestIntercepton<T = AxiosResponse> {
  requsetSuccessFn?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  requsetFailureFn?: (err: any) => any;
  responseSuccessFn?: (res: T) => T;
  responseFailureFn?: (err: any) => any;
}

export interface RequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: RequestIntercepton<T>;
}
