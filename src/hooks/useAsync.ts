import { useState, useRef, useCallback } from "react";

// 传入一个获取信息的回调函数，设置加载状态,返回获取的结果以及是否加载中
export const useAsync = () => {
  const [state, setState] = useState({
    data: null,
    isLoading: false,
    error: null,
    total: 0,
    isNodata: false,
  });
  // 返回一个函数，用于保存起来
  const retry = useRef(() => {});
  const setDate = useCallback((data: any) => {
    // 这里时获取的数据
    console.log(data);
    setState({
      data: data,
      isLoading: false,
      error: null,
      total: data.length || 0,
      isNodata: data.length === 0,
    });
  }, []);
  const setError = (err: any) => {
    setState({
      data: null,
      isLoading: false,
      error: err,
      total: 0,
      isNodata: true,
    });
  };
  const run = useCallback(
    (promise: Promise<any>, runConfig?: { retry: () => Promise<any> }) => {
      retry.current = () => {
        if (runConfig?.retry) {
          run(runConfig?.retry(), runConfig);
        }
      };
      setState((prevState) => ({ ...prevState, isLoading: true }));
      return promise
        .then((data) => {
          setDate(data || []);
          return data;
        })
        .catch((err) => {
          setError(err);
          return err;
        });
    },
    [setDate],
  );
  return {
    run,
    setDate,
    setError,
    ...state,
    retry,
  };
};
