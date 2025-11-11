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
  return http.request<{
    list: Array<any>;
    total: number;
    pageSize: number;
    currentPage: number;
  }>("post", "/sensor/list", { data });
};

/** 获取传感器类型配置 */
export const getSensorConfig = (sensorType: string) => {
  return http.request<Record<string, any>>(
    "get",
    `/sensor/type/${sensorType}/config`
  );
};

/** 获取 SVID 数据 */
export const getSvidData = (svid: string) => {
  return http.request<{
    svid: string;
    value: any;
    timestamp: string;
  }>("get", `/sensor/svid/${svid}/data`);
};

/** 批量获取 SVID 数据 */
export const getBatchSvidData = (svidList: string[]) => {
  return http.request<
    Array<{
      svid: string;
      value: any;
      timestamp: string;
      status: string;
    }>
  >("post", "/sensor/svid/batch", { data: { svidList } });
};
