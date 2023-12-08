import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function NotAuth({
  title,
  Element,
}: {
  title: string;
  Element: React.FC;
}) {
  const navigate = useNavigate();
  useEffect(() => {
    // 登录了直接跳转到首页
    if (localStorage.getItem("token")) {
      navigate("/");
    }
    document.title = title;
  }, [navigate, title]);
  return <Element></Element>;
}
