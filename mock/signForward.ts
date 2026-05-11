import { defineFakeRoute } from "vite-plugin-fake-server/client";

// ─── Mock 数据常量 ───────────────────────────────────────────────

const mockPendingList = [
  {
    proclnsId: "PROCLNS-2024-001",
    applicant: "zhangsan",
    applicantName: "张三",
    changeContent: JSON.stringify({
      beforeValue: "192.168.1.100",
      afterValue: "192.168.1.200",
      description: "传感器 IP 地址变更，旧设备下线替换为新设备",
      modifier: "zhangsan",
      modifyTime: "2024-05-10 09:30:00"
    }),
    createTime: "2024-05-10 09:30:00",
    status: "pending"
  },
  {
    proclnsId: "PROCLNS-2024-002",
    applicant: "lisi",
    applicantName: "李四",
    changeContent: JSON.stringify({
      beforeValue: "COM3",
      afterValue: "COM5",
      description: "串口号变更，因硬件端口占用调整为 COM5",
      modifier: "lisi",
      modifyTime: "2024-05-11 11:00:00"
    }),
    createTime: "2024-05-11 11:00:00",
    status: "pending"
  },
  {
    proclnsId: "PROCLNS-2024-003",
    applicant: "wangwu",
    applicantName: "王五",
    changeContent: JSON.stringify({
      beforeValue: "Temperature",
      afterValue: "Humidity",
      description: "传感器类型变更，原温度传感器更换为湿度传感器",
      modifier: "wangwu",
      modifyTime: "2024-05-12 14:20:00"
    }),
    createTime: "2024-05-12 14:20:00",
    status: "pending"
  }
];

const mockHistoryList = [
  {
    proclnsId: "PROCLNS-2024-H001",
    applicant: "zhaoliu",
    applicantName: "赵六",
    changeContent: JSON.stringify({
      beforeValue: "9600",
      afterValue: "115200",
      description: "波特率提升，配合新型传感器通信协议要求",
      modifier: "zhaoliu",
      modifyTime: "2024-04-20 10:00:00"
    }),
    createTime: "2024-04-20 10:00:00",
    status: "done"
  },
  {
    proclnsId: "PROCLNS-2024-H002",
    applicant: "sunqi",
    applicantName: "孙七",
    changeContent: JSON.stringify({
      beforeValue: "true",
      afterValue: "false",
      description: "传感器停用，设备进入年度维护期间暂停采集",
      modifier: "sunqi",
      modifyTime: "2024-04-25 16:45:00"
    }),
    createTime: "2024-04-25 16:45:00",
    status: "done"
  }
];

/** 根据 proclnsId 返回对应详情 */
function buildDetail(proclnsId: string, isHistory: boolean) {
  const allItems = [...mockPendingList, ...mockHistoryList];
  const item = allItems.find(i => i.proclnsId === proclnsId);

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
    proclnsId: proclnsId,
    applicant: item?.applicant ?? "unknown",
    applicantName: item?.applicantName ?? "未知用户",
    changeContent,
    signProgress: isHistory
      ? [
          {
            account: "libu",
            name: "李部长",
            time: "2024-04-18 08:30:00",
            status: "done",
            action: "approve",
            remark: "流程合规，同意变更"
          },
          {
            account: "fuli",
            name: "副理陈经理",
            time: "2024-04-19 10:15:00",
            status: "done",
            action: "approve",
            remark: "已确认，批准执行"
          }
        ]
      : [
          {
            account: "zhangsan",
            name: "张三（申请人）",
            time: "2024-05-10 09:30:00",
            status: "done",
            action: "approve",
            remark: "提交变更申请"
          },
          {
            account: "fuli_wang",
            name: "副理王经理",
            time: null,
            status: "current",
            action: null,
            remark: null
          }
        ],
    defaultFlow: [
      {
        account: "fuli_wang",
        name: "王经理",
        role: "副理"
      },
      {
        account: "jingli_chen",
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
    response: () => {
      return {
        success: true,
        data: mockPendingList
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
    response: () => {
      return {
        success: true,
        data: mockHistoryList
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
      const { proclnsId } = body;
      const isHistory = mockHistoryList.some(i => i.proclnsId === proclnsId);
      const detail = buildDetail(proclnsId, isHistory);
      return {
        success: true,
        data: detail
      };
    }
  }
]);
