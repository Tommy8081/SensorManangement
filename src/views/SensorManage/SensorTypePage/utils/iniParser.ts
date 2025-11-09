/**
 * INI 格式解析器
 * 将 INI 格式文本转换为 JSON 对象
 */
export function parseINI(iniText: string): Record<string, any> {
  if (!iniText || typeof iniText !== "string") {
    throw new Error("配置内容不能为空");
  }

  const result: Record<string, any> = {};
  let currentSection = "";
  let hasValidContent = false;

  const lines = iniText.split(/\r?\n/);

  for (let line of lines) {
    line = line.trim();

    // 跳过空行和注释
    if (!line || line.startsWith(";") || line.startsWith("#")) {
      continue;
    }

    // 解析节（section）[SectionName]
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      if (!currentSection) {
        throw new Error("节名称不能为空");
      }
      result[currentSection] = {};
      hasValidContent = true;
      continue;
    }

    // 解析键值对 key=value
    const keyValueMatch = line.match(/^([^=]+)=(.*)$/);
    if (keyValueMatch) {
      const key = keyValueMatch[1].trim();
      let value: any = keyValueMatch[2].trim();

      if (!key) {
        throw new Error("配置项的键不能为空");
      }

      // 移除引号
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // 尝试转换为数字或布尔值
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!isNaN(Number(value)) && value !== "") value = Number(value);

      if (currentSection) {
        result[currentSection][key] = value;
        hasValidContent = true;
      } else {
        // 如果没有节，将键值对放在根级别
        result[key] = value;
        hasValidContent = true;
      }
    } else {
      // 如果不是注释、空行、节或键值对，则格式错误
      throw new Error(`第 ${lines.indexOf(line) + 1} 行格式错误: "${line}"`);
    }
  }

  if (!hasValidContent) {
    throw new Error("配置内容为空或格式不正确");
  }

  return result;
}

/**
 * 将 JSON 对象转换为 INI 格式文本
 */
export function stringifyINI(obj: Record<string, any>): string {
  let iniText = "";

  for (const [section, values] of Object.entries(obj)) {
    if (typeof values === "object" && !Array.isArray(values)) {
      iniText += `[${section}]\n`;
      for (const [key, value] of Object.entries(values)) {
        iniText += `${key}=${value}\n`;
      }
      iniText += "\n";
    } else {
      iniText += `${section}=${values}\n`;
    }
  }

  return iniText.trim();
}

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
