import { Pagination } from "antd";

interface myPagingProp {
  pageNo: number; //当前页数
  pageSize: number; //每页条数
  total?: number; //总条数
  onChangeFn: (page: number, pageSize: number) => void; //改变的回调函数
}

export default function Paging({
  total,
  onChangeFn,
  pageNo,
  pageSize,
}: myPagingProp) {
  return (
    <Pagination
      style={{
        marginLeft: "15px",
      }}
      total={total}
      onChange={onChangeFn}
      current={pageNo}
      pageSize={pageSize}
      showSizeChanger
      showQuickJumper
      showTotal={(total) => `共 ${total} 条`}
    />
  );
}
