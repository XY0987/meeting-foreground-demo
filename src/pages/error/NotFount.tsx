import failImg from "../../assets/404.svg";
export default function NotFound() {
  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <h1 style={{ marginTop: "10vh" }}>糟糕，页面迷路了</h1>
      <h4 style={{ fontWeight: "300", marginTop: "3px" }}>
        你访问的页面可能已失效或被删除
      </h4>
      <img
        src={failImg}
        alt="404"
        style={{ margin: "0px auto", width: "500px", height: "500px" }}
      />
    </div>
  );
}
