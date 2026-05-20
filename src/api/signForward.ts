import { http } from "@/utils/http";
import axios from "axios";
import type {
  PageResult,
  SignForwardItem,
  SignForwardDetailData
} from "@/components/ReSignForward/types";

export interface GetSignOffListParams {
  userAccount: string;
  pageNo: number;
  pageSize: number;
}

/** 获取待传签列表（当前） POST /api/getSignOffList */
export const getSignOffList = (params: GetSignOffListParams) =>
  http.request<PageResult<SignForwardItem>>("post", "/api/getSignOffList", {
    data: params
  });

/** 获取历史传签列表 POST /api/getSignOffHistoryList */
export const getSignOffHistoryList = (params: GetSignOffListParams) =>
  http.request<PageResult<SignForwardItem>>(
    "post",
    "/api/getSignOffHistoryList",
    {
      data: params
    }
  );

/** 获取传签详情 POST /api/getSignOffDetail */
export const getSignOffDetail = (params: { ORDER_NO: string }) =>
  http.request<SignForwardDetailData>("post", "/api/getSignOffDetail", {
    data: params
  });

export interface AssignParams {
  action: string;
  fromAccount: string;
  proclnsId: string;
  remark: string;
  toAccount: string;
}

/** 执行传签（第三方接口，用 axios 直接调用） POST {VITE_SIGN_THIRD_PARTY_URL}/SAM/v3/rdpp/assign */
export const assignSignForward = (params: AssignParams) => {
  const baseUrl = (import.meta as any).env.VITE_SIGN_THIRD_PARTY_URL || "";
  return axios.post(`${baseUrl}/SAM/v3/rdpp/assign`, params);
};

/** Approve/Disapprove 传签 POST {VITE_SIGN_THIRD_PARTY_URL}/SAM/v3/rdpp/assign */
export const actionSignForward = (params: AssignParams) =>
  assignSignForward(params);
