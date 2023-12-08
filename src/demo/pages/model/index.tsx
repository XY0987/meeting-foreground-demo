import { Button } from "antd";
import { useModal } from "../../../hooks/useModal";
import { modelDemoOptions } from "./options";

export default function ModalHookDemo() {
  const { init: normalInit, messageTips } = useModal({
    type: "nomal",
    title: "提示",
    infoTxt: "demo演示普通弹窗",
  });
  const { init } = useModal({
    type: "form",
    formOptions: modelDemoOptions,
  });
  const showNormal = () => {
    normalInit()
      .then(() => {
        messageTips({
          type: "success",
          content: "点击确定",
        });
      })
      .catch(() => {
        messageTips({
          type: "error",
          content: "点击取消",
        });
      });
  };

  const showForm = () => {
    // init时可以传入默认值，只要属性名与配置对象中的name属性一致就能回显
    init()
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {});
  };

  return (
    <div>
      <Button onClick={showNormal}>显示普通弹窗</Button>
      <Button onClick={showForm}>显示form表单弹窗</Button>
    </div>
  );
}
