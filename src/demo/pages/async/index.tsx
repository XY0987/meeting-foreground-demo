import { useCallback, useEffect } from "react";
import Loading from "../../../components/utils/Loading";
import { useAsync } from "../../../hooks/useAsync";
import { getUserApi } from "../../request/request.demo";
import { Button } from "antd";
import { useNavigate } from "react-router";

export default function AsyncHookDemo() {
  const navigate = useNavigate();

  const { isLoading, run, retry, data } = useAsync();

  const fetchData = useCallback(() => getUserApi(), []);
  useEffect(() => {
    run(fetchData(), { retry: fetchData });
  }, [run, fetchData]);
  const flash = () => {
    retry.current();
  };

  const jump = (url: string) => {
    navigate(url);
  };

  return (
    <div>
      <Button onClick={() => jump("/modal")}>弹窗演示</Button>
      {isLoading ? (
        <Loading></Loading>
      ) : (
        <div>
          <Button onClick={flash}>刷新</Button>
        </div>
      )}
    </div>
  );
}
