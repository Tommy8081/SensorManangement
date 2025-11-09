import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { parseINI } from "./iniParser";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  SensorType: [
    { required: true, message: "传感器类型为必填项", trigger: "blur" }
  ],
  SensorDesc: [
    { required: true, message: "传感器描述为必填项", trigger: "blur" }
  ],
  SensorConfigs: [
    { required: true, message: "传感器配置为必填项", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error("传感器配置为必填项"));
          return;
        }

        try {
          const parsed = parseINI(value);
          // 检查是否有有效的配置项
          if (Object.keys(parsed).length === 0) {
            callback(new Error("配置内容为空"));
          } else {
            callback();
          }
        } catch (e) {
          callback(new Error((e as Error).message));
        }
      },
      trigger: "blur"
    }
  ]
});
