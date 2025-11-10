// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

/** SVID 项 */
interface SvidItem {
  channel: string;
  svid: string;
}

interface FormItemProps {
  /** 传感器类型 */
  SensorType: string;
  /** 连接方式 */
  PortType: string;
  /** Sensor名称 */
  SensorName: string;
  /** 是否启用 */
  Enable: boolean;
  /** OPI编号 */
  WSID: string;
  /** OPI位置 */
  Location: string;
  /** 机台编号 */
  EQPID: string;
  /** IP地址 */
  IP: string;
  /** 站点编号 */
  StationNo: number;
  /** 站点 */
  Port: number;
  /** 端口 */
  Com: string;
  /** 上次更新用户 */
  LastUpdateUser: string;
  /** 上次更新时间 */
  LastUpdateTime: string;
  /** SVID 列表 */
  SvidList?: SvidItem[];
  /** 传感器配置（JSON 字符串）*/
  SensorConfigs?: string;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps, SvidItem };
