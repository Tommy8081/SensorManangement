/**
 * 将配置对象转换为易读的描述列表
 */
export function formatConfigForDisplay(config: Record<string, any>): Array<{
  section: string;
  items: Array<{ key: string; value: any; label: string }>;
}> {
  const labelMap: Record<string, string> = {
    // 通用字段
    unit: "单位",
    range: "范围",
    min: "最小值",
    max: "最大值",
    accuracy: "精度",
    protocol: "通讯协议",
    baudRate: "波特率",
    dataBits: "数据位",
    stopBits: "停止位",
    parity: "校验位",
    address: "设备地址",
    timeout: "超时时间",
    interval: "采集间隔",

    // 网络相关
    host: "主机地址",
    port: "端口号",

    // 传感器特定
    sensorModel: "传感器型号",
    manufacturer: "制造商",
    calibrationDate: "校准日期",

    // 其他
    enable: "启用状态",
    description: "描述"
  };

  const result: Array<{
    section: string;
    items: Array<{ key: string; value: any; label: string }>;
  }> = [];

  for (const [section, values] of Object.entries(config)) {
    if (typeof values === "object" && !Array.isArray(values)) {
      const items = Object.entries(values).map(([key, value]) => ({
        key,
        value,
        label: labelMap[key] || key
      }));
      result.push({ section, items });
    }
  }

  return result;
}
