/** 传签列表项（申请单） */
export interface SignForwardItem {
  proclnsId: string;
  applicant: string;
  applicantName?: string;
  changeContent: string;
  createTime: string;
  status: "pending" | "done";
}

/** 变更内容详情（parseChangeContent 后的结构） */
export interface ChangeContentDetail {
  beforeValue: string;
  afterValue: string;
  description: string;
  modifier: string;
  modifyTime: string;
  [key: string]: any;
}

/** 传签进度节点 */
export interface SignProgressNode {
  account: string;
  name: string;
  time?: string;
  status: "done" | "current" | "pending";
  action?: "approve" | "disapprove";
  remark?: string;
}

/** 默认传签流程节点 */
export interface SignFlowNode {
  account: string;
  name: string;
  role?: string;
}

/** 传签详情完整数据 */
export interface SignForwardDetailData {
  proclnsId: string;
  applicant: string;
  applicantName?: string;
  changeContent: ChangeContentDetail | string;
  signProgress: SignProgressNode[];
  defaultFlow: SignFlowNode[];
  isHistory: boolean;
}
