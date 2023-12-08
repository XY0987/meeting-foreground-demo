import failImg from "../../assets/403.svg";
export default function NotPower() {
  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <h1 style={{ marginTop: "10vh" }}>糟糕，您的权限不择</h1>
      <h4 style={{ fontWeight: "300", marginTop: "3px" }}>
        权限不足请联系管理员
      </h4>
      <img
        src={failImg}
        alt="404"
        style={{ margin: "0px auto", width: "500px", height: "500px" }}
      />
    </div>
  );
}
