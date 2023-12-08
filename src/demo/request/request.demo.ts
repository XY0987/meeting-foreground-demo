import { defaultRequest } from "../../request/server";

// get请求
export const getDemoApi = (data: any) =>
  defaultRequest.get({
    url: "",
    params: data,
  });
// post请求
export const postDemoApi = (data: any) =>
  defaultRequest.post({
    url: "",
    data: data,
  });
// delete请求
export const deleteDemoApi = (data: any) =>
  defaultRequest.delete({
    url: "",
    data: data,
  });

// patch请求
export const patchDemoApi = (data: any) =>
  defaultRequest.patch({
    url: "",
    params: data,
  });

// 完整请求
export const fullDemoApi = (data: any) =>
  defaultRequest.request({
    method: "",
    url: "",
    data: data, //看对应的请求类型看传递的参数是data还是params
  });

// 演示useAsync()hook访问接口
export const getUserApi = () =>
  defaultRequest.get({
    url: "https://api.github.com/users?since=100",
  });
