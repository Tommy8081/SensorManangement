import { http } from "@/utils/http";

/** 传感器类型接口返回数据 */
export type SensorTypeResult = {
  /** 传感器类型代码 */
  SensorType: string;
  /** 传感器类型描述 */
  SensorDesc: string;
  /** 传感器配置（JSON字符串） */
  SensorConfigs?: string;
};

/** 获取传感器类型列表（包含配置） */
export const getSensorTypeList = () => {
  return http.request<Array<SensorTypeResult>>("get", "/sensor/types");
};

/** 获取传感器列表 */
export const getSensorList = (data?: object) => {
  return http.request("post", "/sensor/list", { data });
};

/** 新增传感器 */
export const addSensor = (data: object) => {
  return http.request("post", "/sensor/add", { data });
};

/** 更新传感器 */
export const updateSensor = (data: object) => {
  return http.request("put", "/sensor/update", { data });
};

/** 删除传感器 */
export const deleteSensor = (id: string) => {
  return http.request("delete", `/sensor/delete/${id}`);
};

/** 更新传感器状态 */
export const updateSensorStatus = (id: string, enable: boolean) => {
  return http.request("put", `/sensor/status/${id}`, { data: { enable } });
};

/** 获取传感器类型配置 */
export const getSensorConfig = (sensorType: string) => {
  return http.request<Record<string, any>>(
    "get",
    `/sensor/type/${sensorType}/config`
  );
};
