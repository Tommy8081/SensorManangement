/** 传感器类型表单项 */
interface FormItemProps {
  /** 传感器类型 */
  SensorType: string;
  /** 传感器描述 */
  SensorDesc: string;
  /** 传感器配置（JSON字符串） */
  SensorConfigs: string;
  /** 创建时间 */
  CreateTime?: string;
  /** 更新时间 */
  UpdateTime?: string;
}

interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
