import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  SensorName: [
    { required: true, message: "传感器名称为必填项", trigger: "blur" }
  ],
  SensorType: [
    { required: true, message: "传感器类型为必填项", trigger: "change" }
  ],
  PortType: [
    { required: true, message: "连接方式为必填项", trigger: "change" }
  ],
  WSID: [{ required: true, message: "OPI编号为必填项", trigger: "blur" }],
  Location: [{ required: true, message: "OPI位置为必填项", trigger: "blur" }],
  EQPID: [{ required: true, message: "机台编号为必填项", trigger: "blur" }],
  IP: [
    { required: true, message: "IP地址为必填项", trigger: "blur" },
    {
      pattern:
        /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
      message: "请输入正确的IP地址",
      trigger: "blur"
    }
  ],
  StationNo: [{ required: true, message: "站点编号为必填项", trigger: "blur" }],
  Port: [
    { required: true, message: "端口为必填项", trigger: "blur" },
    { type: "number", message: "端口必须为数字", trigger: "blur" }
  ],
  Com: [{ required: false, message: "COM口为选填项", trigger: "blur" }]
});
