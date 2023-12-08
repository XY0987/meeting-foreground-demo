import { Spin } from "antd";

export default function Loading() {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "300px",
      }}
    >
      <Spin />
    </div>
  );
}
