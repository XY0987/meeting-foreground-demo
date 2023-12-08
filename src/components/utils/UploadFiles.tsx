import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Modal, Upload } from "antd";
import type { RcFile, UploadProps } from "antd/es/upload";
import type { UploadFile } from "antd/es/upload/interface";

// 传递改变函数，限制图片个数，是否裁剪
export function UploadFiles({
  onChangeFn,
  fileList,
  limit,
}: {
  onChangeFn: (file: any) => void;
  fileList: any;
  limit: number;
}) {
  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [uploadFileList, setUploadFileList] = useState<any>([]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf("/") + 1),
    );
  };
  useEffect(() => {
    if (fileList) {
      setUploadFileList(fileList);
      onChangeFn(fileList);
    }
  }, [fileList, onChangeFn]);

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setUploadFileList(newFileList);
    onChangeFn(newFileList);
  };
  return (
    <>
      <Upload
        listType="picture-card"
        fileList={uploadFileList}
        onPreview={handlePreview}
        onChange={handleChange}
        beforeUpload={() => false}
      >
        {uploadFileList.length >= limit ? null : (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        )}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img alt="example" style={{ width: "100%" }} src={previewImage} />
      </Modal>
    </>
  );
}
