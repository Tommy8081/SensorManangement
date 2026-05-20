import { defineFakeRoute } from "vite-plugin-fake-server/client";

interface SignMockItem {
  ORDER_NO: string;
  SUBMITTER: string;
  applicantName: string;
  changeContent: string;
  createTime: string;
  status: "pending" | "done";
}

const submitterPool = [
  "zhangsan",
  "lisi",
  "wangwu",
  "zhaoliu",
  "sunqi",
  "zhouba",
  "wujiu",
  "zhengshi"
];

const applicantNamePool = [
  "张三",
  "李四",
  "王五",
  "赵六",
  "孙七",
  "周八",
  "吴九",
  "郑十"
];

function buildMockList(
  size: number,
  prefix: string,
  status: "pending" | "done",
  baseDate: string
): SignMockItem[] {
  return Array.from({ length: size }, (_, i) => {
    const idx = i + 1;
    const submitter = submitterPool[i % submitterPool.length];
    const applicantName = applicantNamePool[i % applicantNamePool.length];
    const day = String((idx % 28) + 1).padStart(2, "0");
    const hour = String(8 + (idx % 10)).padStart(2, "0");
    const minute = String((idx * 7) % 60).padStart(2, "0");
    const time = `${baseDate}-${day} ${hour}:${minute}:00`;

    return {
      ORDER_NO: `${prefix}${String(idx).padStart(3, "0")}`,
      SUBMITTER: submitter,
      applicantName,
      changeContent: JSON.stringify({
        beforeValue: `旧值-${idx}`,
        afterValue: `新值-${idx}`,
        description: `模拟第 ${idx} 条变更内容，用于验证列表与分页展示`,
        modifier: submitter,
        modifyTime: time
      }),
      createTime: time,
      status
    };
  });
}

const mockPendingList = buildMockList(35, "SF-P-2024-", "pending", "2024-05");
const mockHistoryList = buildMockList(22, "SF-H-2024-", "done", "2024-04");

function getPagedData<T>(list: T[], pageNo = 1, pageSize = 20) {
  const start = (pageNo - 1) * pageSize;
  const end = start + pageSize;
  return {
    list: list.slice(start, end),
    total: list.length,
    pageNo,
    pageSize
  };
}

/** 根据 ORDER_NO 返回对应详情 */
function buildDetail(ORDER_NO: string, isHistory: boolean) {
  const allItems = [...mockPendingList, ...mockHistoryList];
  const item = allItems.find(i => i.ORDER_NO === ORDER_NO);

  const changeContent = item
    ? JSON.parse(item.changeContent)
    : {
      beforeValue: "N/A",
      afterValue: "N/A",
      description: "无变更说明",
      modifier: "unknown",
      modifyTime: "-"
    };

  return {
    ORDER_NO,
    SUBMITTER: item?.SUBMITTER ?? "unknown",
    applicantName: item?.applicantName ?? "未知用户",
    changeContent,
    signProgress: isHistory
      ? [
        {
          account: "manager_li",
          name: "李经理",
          time: "2024-04-18 08:30:00",
          status: "done",
          action: "approve",
          remark: "流程合规，同意变更"
        },
        {
          account: "director_chen",
          name: "陈总监",
          time: "2024-04-19 10:15:00",
          status: "done",
          action: "approve",
          remark: "已确认，批准执行"
        }
      ]
      : [
        {
          account: item?.SUBMITTER ?? "unknown",
          name: `${item?.applicantName ?? "未知用户"}（申请人）`,
          time: item?.createTime ?? "2024-05-01 09:00:00",
          status: "done",
          action: "approve",
          remark: "提交变更申请"
        },
        {
          account: "manager_wang",
          name: "王经理",
          time: undefined,
          status: "current",
          action: undefined,
          remark: undefined
        }
      ],
    defaultFlow: [
      {
        account: "manager_wang",
        name: "王经理",
        role: "副理"
      },
      {
        account: "director_chen",
        name: "陈总监",
        role: "经理"
      }
    ],
    isHistory
  };
}

// ─── Mock 路由定义 ────────────────────────────────────────────────

export default defineFakeRoute([
  /**
   * 获取待传签列表
   * POST /api/getSignOffList
   * body: { userAccount: string }
   */
  {
    url: "/api/getSignOffList",
    method: "post",
    response: ({ body }) => {
      const pageNo = Number(body?.pageNo ?? 1);
      const pageSize = Number(body?.pageSize ?? 20);
      return {
        success: true,
        data: getPagedData(mockPendingList, pageNo, pageSize)
      };
    }
  },

  /**
   * 获取历史传签列表
   * POST /api/getSignOffHistoryList
   * body: { userAccount: string }
   */
  {
    url: "/api/getSignOffHistoryList",
    method: "post",
    response: ({ body }) => {
      const pageNo = Number(body?.pageNo ?? 1);
      const pageSize = Number(body?.pageSize ?? 20);
      return {
        success: true,
        data: getPagedData(mockHistoryList, pageNo, pageSize)
      };
    }
  },

  /**
   * 获取传签详情
   * POST /api/getSignOffDetail
   * body: { proclnsId: string }
   */
  {
    url: "/api/getSignOffDetail",
    method: "post",
    response: ({ body }) => {
      const ORDER_NO = body?.ORDER_NO || "";
      const isHistory = mockHistoryList.some(i => i.ORDER_NO === ORDER_NO);
      const detail = buildDetail(ORDER_NO, isHistory);
      return {
        success: true,
        data: detail
      };
    }
  }
]);
