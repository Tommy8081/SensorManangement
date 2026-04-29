import { http } from "@/utils/http";
import axios from "axios";

/** 获取待传签列表请求参数 */
export interface GetSignOffListParams {
  userAccount: string;
}

/**
 * 获取待传签列表
 * POST {project_base_url}/api/getSignOffList
 * 返回: string[] 例如 ["proclnsId1", "proclnsId2"]
 */
export const getSignOffList = (params: GetSignOffListParams) => {
  return http.request<string[]>("post", "/api/getSignOffList", {
    data: params
  });
};

/** 传签参数 */
export interface AssignParams {
  action: string;
  fromAccount: string;
  proclnsId: string;
  remark: string;
  toAccount: string;
}

/**
 * 执行传签（第三方接口）
 * POST {VITE_SIGN_THIRD_PARTY_URL}/SAM/v3/rdpp/assign
 */
export const assignSignForward = (params: AssignParams) => {
  const baseUrl = (import.meta as any).env.VITE_SIGN_THIRD_PARTY_URL || "";
  return axios.post(`${baseUrl}/SAM/v3/rdpp/assign`, params);
};
