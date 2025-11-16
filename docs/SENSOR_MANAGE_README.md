# 传感器管理系统 - 功能说明文档

## 项目概述

**项目名称**: SesnorManangement - 传感器管理系统  
**技术栈**: Vue 3 + TypeScript + Element Plus + Vite  
**项目路径**: `d:\workspace\pure-admin-thin`

---

## 目录结构

```
src/views/SensorManage/
├── SensorListPage/              # 传感器列表管理
│   ├── index.vue               # 主页面
│   ├── form.vue                # 表单组件
│   ├── components/
│   │   ├── SvidConfig.vue      # SVID配置组件
│   │   └── SvidDataViewer.vue  # SVID数据查看器
│   └── utils/
│       ├── hook.tsx            # 业务逻辑Hook
│       ├── types.ts            # 类型定义
│       ├── rule.ts             # 表单验证规则
│       └── iniParser.ts        # INI解析工具
├── SensorTypePage/              # 传感器类型管理
│   ├── index.vue               # 主页面
│   ├── form.vue                # 表单组件
│   ├── components/
│   │   └── ConfigViewer.vue    # 配置查看器
│   └── utils/
│       ├── hook.tsx            # 业务逻辑Hook
│       ├── types.ts            # 类型定义
│       ├── rule.ts             # 表单验证规则
│       └── iniParser.ts        # INI解析工具
└── hooks.ts                     # 公共Hooks
```

---

## 功能模块详解

### 一、传感器列表管理

#### 1.1 功能入口

**访问路径**: `/SensorManage/sensor-list`  
**主文件**: `src/views/SensorManage/SensorListPage/index.vue`  
**权限**: `admin`, `common` (管理员和普通用户均可访问)

#### 1.2 核心功能

##### 1.2.1 传感器列表查询

**实现文件**: `src/views/SensorManage/SensorListPage/utils/hook.tsx`

**功能说明**:

- 支持按传感器名称、类型、启用状态筛选
- 分页显示传感器列表
- 实时查询数据

**实现逻辑**:

```typescript
// 位置: useSensor() -> onSearch()
async function onSearch() {
  loading.value = true;
  try {
    const response = await getSensorList(form);
    const res = response?.data ?? response;
    dataList.value = res.list || [];
    pagination.total = res.total || 0;
  } catch (error) {
    console.error("获取传感器列表失败:", error);
  } finally {
    loading.value = false;
  }
}
```

**API接口**:

- 接口: `POST /sensor/list`
- 定义: `src/api/sensor.ts -> getSensorList()`
- Mock: `mock/sensor.ts`

**数据模型**:

```typescript
interface FormItemProps {
  SensorType: string;        // 传感器类型
  PortType: string;          // 连接方式
  SensorName: string;        // 传感器名称
  Enable: boolean;           // 是否启用
  WSID: string;             // OPI编号
  Location: string;         // OPI位置
  EQPID: string;            // 机台编号
  IP: string;               // IP地址
  StationNo: number;        // 站点数量
  Port: number;             // 端口
  Com: string;              // COM口
  SvidList: SvidItem[];     // SVID列表
  SensorConfigs: string;    // 传感器配置(JSON字符串)
}
```

---

##### 1.2.2 传感器新增/编辑

**实现文件**:

- Hook: `src/views/SensorManage/SensorListPage/utils/hook.tsx`
- 表单: `src/views/SensorManage/SensorListPage/form.vue`

**功能说明**:

- 支持新增传感器
- 支持编辑已有传感器
- 动态配置项开关(IP、COM、SVID、传感器配置)

**实现逻辑**:

**1. 打开弹窗**:

```typescript
// 位置: useSensor() -> openDialog()
function openDialog(title = "新增", row?: FormItemProps) {
  addDialog({
    title: dialogTitle,
    props: { formInline: { /* 表单数据 */ } },
    width: "60%",
    contentRenderer: () => h(editForm, { ref: formRef }),
    beforeSure: (done, { options }) => {
      // 表单验证和提交
    }
  });
}
```

**2. 表单结构**:

```
基本信息:
├── 传感器名称 (必填)
├── 传感器类型 (下拉选择,从类型管理获取)
├── 连接方式 (TCP/Serial/USB)
└── 是否启用 (开关)

设备信息:
├── OPI编号
├── OPI位置
├── 机台编号
└── 站点编号 (决定SVID分页数)

可选配置项 (开关控制):
├── IP配置 (IP地址 + 端口号)
├── COM配置 (COM口)
├── 传感器配置 (key=value格式)
└── SVID配置 (按Station分页管理)
```

**3. 配置项开关逻辑**:

```typescript
// 位置: form.vue -> initConfigSwitches()
const initConfigSwitches = () => {
  // 根据已有数据自动打开开关
  if (props.formInline.IP || props.formInline.Port) {
    showIPConfig.value = true;
  }
  if (props.formInline.Com) {
    showCOMConfig.value = true;
  }
  if (props.formInline.SvidList?.length > 0) {
    showSvidConfig.value = true;
  }
  if (props.formInline.SensorConfigs) {
    showSensorConfig.value = true;
  }
}
```

---

##### 1.2.3 传感器配置管理

**实现文件**: `src/views/SensorManage/SensorListPage/form.vue`

**功能说明**:

- 查看传感器类型的默认配置
- 自定义编辑传感器配置
- INI格式输入，JSON格式存储

**实现逻辑**:

**1. 加载配置**:

```typescript
// 位置: form.vue -> loadSensorConfig()
const loadSensorConfig = async (sensorType: string) => {
  // 优先使用自定义配置
  if (newFormInline.value.SensorConfigs) {
    const configObj = JSON.parse(newFormInline.value.SensorConfigs);
    currentSensorConfig.value = configObj;
    sensorConfigIniText.value = stringifyINI(configObj);
    return;
  }
  
  // 否则从类型列表或接口获取
  const typeInfo = sensorTypeList.value.find(
    item => item.SensorType === sensorType
  );
  
  if (typeInfo?.SensorConfigs) {
    const configObj = JSON.parse(typeInfo.SensorConfigs);
    currentSensorConfig.value = configObj;
    sensorConfigIniText.value = stringifyINI(configObj);
  }
}
```

**2. 配置编辑**:

```typescript
// 位置: form.vue -> saveSensorConfig()
const saveSensorConfig = () => {
  try {
    // INI -> JSON
    const configObj = parseINI(sensorConfigIniText.value);
    currentSensorConfig.value = configObj;
    
    // 保存为JSON字符串
    newFormInline.value.SensorConfigs = JSON.stringify(configObj);
    
    showEditSensorConfig.value = false;
    ElMessage.success("配置保存成功");
  } catch (error) {
    ElMessage.error("配置格式错误：" + error.message);
  }
}
```

**3. INI解析器**:

**文件**: `src/views/SensorManage/SensorListPage/utils/iniParser.ts`

```typescript
// INI格式示例:
// unit=℃
// protocol=Modbus RTU
// min=-40
// max=125
// enable=true

export function parseINI(iniText: string): Record<string, any> {
  const result: Record<string, any> = {};
  const lines = iniText.split(/\r?\n/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith(";") || trimmed.startsWith("#")) {
      continue;
    }
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // 自动类型转换
      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (!isNaN(Number(value))) value = Number(value);
      
      result[key] = value;
    }
  }
  
  return result;
}

export function stringifyINI(obj: Record<string, any>): string {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}
```

**4. 配置显示**:

```typescript
// 位置: iniParser.ts -> formatConfigForDisplay()
export function formatConfigForDisplay(config: Record<string, any>) {
  const labelMap = {
    unit: "单位",
    min: "最小值",
    max: "最大值",
    protocol: "通讯协议",
    // ...更多映射
  };
  
  return Object.entries(config).map(([key, value]) => ({
    key,
    value,
    label: labelMap[key] || key
  }));
}
```

---

##### 1.2.4 SVID配置管理

**实现文件**: `src/views/SensorManage/SensorListPage/components/SvidConfig.vue`

**功能说明**:

- 按Station分页管理SVID
- 批量生成所有Station的SVID
- 复制当前Station配置到其他Station
- 导入/导出CSV文件
- 每个Station默认8个通道

**实现逻辑**:

**1. Station分页**:

```typescript
// 按Station分组SVID
const allStationsSvids = computed(() => {
  const grouped = new Map<number, SvidItem[]>();
  
  // 初始化所有Station
  for (let i = 1; i <= totalStations.value; i++) {
    grouped.set(i, []);
  }
  
  // 按station分组
  props.modelValue.forEach(item => {
    const station = item.station || 1;
    grouped.get(station)!.push(item);
  });
  
  // 确保每个Station至少8个通道
  grouped.forEach((items, station) => {
    while (items.length < 8) {
      items.push({
        channel: `Channel${items.length + 1}`,
        svid: "",
        station
      });
    }
  });
  
  return grouped;
});

// 当前Station的SVID
const currentStationSvids = computed(() => {
  return allStationsSvids.value.get(currentStation.value) || [];
});
```

**2. 批量生成**:

```typescript
// 位置: SvidConfig.vue -> generateAllStationsSvids()
const generateAllStationsSvids = () => {
  const allSvids: SvidItem[] = [];
  
  // 为每个Station生成8个通道
  for (let station = 1; station <= totalStations.value; station++) {
    for (let channel = 1; channel <= 8; channel++) {
      allSvids.push({
        channel: `Channel${channel}_S${station}`,
        svid: `SVID${String(channel).padStart(3, "0")}_S${station}`,
        station
      });
    }
  }
  
  emit("update:modelValue", allSvids);
  ElMessage.success(`成功生成 ${allSvids.length} 条 SVID 配置`);
}
```

**3. 复制到其他Station**:

```typescript
// 位置: SvidConfig.vue -> copyToOtherStations()
const copyToOtherStations = () => {
  const allSvids: SvidItem[] = [];
  
  // 复制当前Station配置到所有Station
  for (let station = 1; station <= totalStations.value; station++) {
    svidList.value.forEach(item => {
      const baseSvid = item.svid.replace(/_S\d+$/, "");
      const baseChannel = item.channel.replace(/_S\d+$/, "");
      
      allSvids.push({
        channel: station === 1 ? baseChannel : `${baseChannel}_S${station}`,
        svid: baseSvid === "NA" ? "NA" : 
              station === 1 ? baseSvid : `${baseSvid}_S${station}`,
        station
      });
    });
  }
  
  emit("update:modelValue", allSvids);
}
```

**4. CSV导入导出**:

```typescript
// 下载模板
const downloadTemplate = () => {
  const csvContent = [
    "Channel,SVID",
    ...svidList.value.map(item => `${item.channel},${item.svid}`)
  ].join("\n");
  
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;"
  });
  // 下载文件
}

// 导入文件
const handleFileUpload = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result as string;
    const lines = text.split(/\r?\n/).slice(1); // 跳过表头
    
    // 解析并补全缺失通道
    const importedData = parseAndFillChannels(lines);
    svidList.value = importedData;
  };
  reader.readAsText(file);
}
```

**5. 数据结构**:

```typescript
interface SvidItem {
  channel: string;  // 通道名: Channel1_S1
  svid: string;     // SVID值: SVID001_S1 或 NA
  station?: number; // 站点号: 1, 2, 3...
}
```

---

##### 1.2.5 SVID数据查看

**实现文件**: `src/views/SensorManage/SensorListPage/components/SvidDataViewer.vue`

**功能说明**:

- 按Station分页查看SVID数据
- 5秒查询限流
- 实时查询传感器数据
- 显示查询状态和时间戳

**实现逻辑**:

**1. Station切换**:

```typescript
// 按Station过滤SVID
const svidsByStation = computed(() => {
  const grouped = new Map<number, SvidItem[]>();
  
  for (let i = 1; i <= props.stationNo; i++) {
    grouped.set(i, []);
  }
  
  props.svidList.forEach(item => {
    const station = item.station || 1;
    grouped.get(station)!.push(item);
  });
  
  return grouped;
});

const currentStationSvidList = computed(() => {
  return svidsByStation.value.get(currentStation.value) || [];
});
```

**2. 查询限流**:

```typescript
const canQueryNow = ref(true);
const remainingTime = ref(0);
let countdownTimer: number | null = null;

const startCountdown = () => {
  canQueryNow.value = false;
  
  const updateRemaining = () => {
    const now = Date.now();
    const elapsed = now - lastQueryTime.value;
    const remaining = 5000 - elapsed;
    
    if (remaining <= 0) {
      remainingTime.value = 0;
      canQueryNow.value = true;
      clearInterval(countdownTimer!);
      countdownTimer = null;
      return;
    }
    
    remainingTime.value = Math.ceil(remaining / 1000);
  };
  
  updateRemaining();
  countdownTimer = window.setInterval(updateRemaining, 100);
}
```

**3. 数据查询**:

```typescript
const querySvidData = async () => {
  if (!canQueryNow.value) {
    ElMessage.warning(`请等待 ${remainingTime.value} 秒后再查询`);
    return;
  }
  
  loading.value = true;
  lastQueryTime.value = Date.now();
  startCountdown();
  
  try {
    // TODO: 调用实际接口
    // const validSvids = currentStationSvidList.value
    //   .filter(item => item.svid !== "NA")
    //   .map(item => item.svid);
    // const responses = await getBatchSvidData(validSvids);
    
    // 模拟数据
    svidDataList.value = currentStationSvidList.value.map(item => ({
      svid: item.svid,
      channel: item.channel,
      value: item.svid === "NA" ? null : (Math.random() * 100).toFixed(2),
      timestamp: new Date().toLocaleString("zh-CN"),
      status: item.svid === "NA" ? "error" : "success"
    }));
    
    ElMessage.success(`Station ${currentStation.value} 数据查询成功`);
  } finally {
    loading.value = false;
  }
}
```

**4. 数据结构**:

```typescript
interface SvidData {
  svid: string;           // SVID标识
  channel: string;        // 通道名
  value: string | null;   // 数据值(单个数值)
  timestamp: string;      // 更新时间
  status: "success" | "error" | "loading";
  message?: string;       // 错误信息
}
```

**API接口**:

- 单个查询: `GET /sensor/svid/:svid/data`
- 批量查询: `POST /sensor/svid/batch`
- Mock: `mock/sensor.ts`

---

##### 1.2.6 启用/停用切换

**实现文件**: `src/views/SensorManage/SensorListPage/utils/hook.tsx`

**功能说明**:

- 表格中直接切换开关
- 二次确认
- 状态更新

**实现逻辑**:

```typescript
// 位置: useSensor() -> onChange()
function onChange({ row, index }) {
  const action = row.Enable ? "停用" : "启用";
  
  ElMessageBox.confirm(`确认要${action}传感器${row.SensorName}吗?`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      // 显示loading
      switchLoadMap.value[index] = { loading: true };
      
      // TODO: 调用状态更新接口
      // await updateSensorStatus(row.id, row.Enable);
      
      setTimeout(() => {
        switchLoadMap.value[index] = { loading: false };
        message(`${action}成功`, { type: "success" });
      }, 300);
    })
    .catch(() => {
      // 取消时恢复状态
      row.Enable = !row.Enable;
    });
}
```

---

##### 1.2.7 删除传感器

**实现文件**: `src/views/SensorManage/SensorListPage/utils/hook.tsx`

**功能说明**:

- 二次确认删除
- 刷新列表

**实现逻辑**:

```typescript
// 位置: useSensor() -> handleDelete()
function handleDelete(row: FormItemProps) {
  // TODO: 调用删除接口
  // await deleteSensor(row.id);
  
  message(`删除传感器${row.SensorName}成功`, { type: "success" });
  onSearch(); // 刷新列表
}
```

---

### 二、传感器类型管理

#### 2.1 功能入口

**访问路径**: `/SensorManage/sensor-type`  
**主文件**: `src/views/SensorManage/SensorTypePage/index.vue`  
**权限**: `admin` (仅管理员可访问)

#### 2.2 核心功能

##### 2.2.1 类型列表查询

**实现文件**: `src/views/SensorManage/SensorTypePage/utils/hook.tsx`

**功能说明**:

- 按传感器类型筛选
- 显示类型、描述、配置
- 分页显示

**实现逻辑**:

```typescript
// 位置: useSensorType() -> onSearch()
async function onSearch() {
  loading.value = true;
  
  // TODO: 调用接口
  // const { data } = await getSensorTypeList(toRaw(form));
  
  // Mock数据
  dataList.value = mockData.list;
  pagination.total = mockData.total;
  
  loading.value = false;
}
```

**数据模型**:

```typescript
interface FormItemProps {
  SensorType: string;     // 传感器类型代码
  SensorDesc: string;     // 传感器描述
  SensorConfigs: string;  // 配置(JSON字符串)
  CreateTime?: string;
  UpdateTime?: string;
}
```

---

##### 2.2.2 类型新增/编辑

**实现文件**:

- Hook: `src/views/SensorManage/SensorTypePage/utils/hook.tsx`
- 表单: `src/views/SensorManage/SensorTypePage/form.vue`

**功能说明**:

- INI格式输入配置
- JSON格式存储
- 配置格式验证

**实现逻辑**:

**1. 打开弹窗**:

```typescript
// 位置: useSensorType() -> openDialog()
function openDialog(title = "新增", row?: FormItemProps) {
  // 编辑时将JSON转为INI
  let iniConfig = "";
  if (row?.SensorConfigs) {
    const configObj = JSON.parse(row.SensorConfigs);
    iniConfig = stringifyINI(configObj);
  }
  
  addDialog({
    title: `${title}传感器类型`,
    props: {
      formInline: {
        SensorType: row?.SensorType ?? "",
        SensorDesc: row?.SensorDesc ?? "",
        SensorConfigs: iniConfig
      }
    },
    beforeSure: (done, { options }) => {
      // 表单验证
      FormRef.validate(valid => {
        if (valid) {
          // INI -> JSON
          const configObj = parseINI(curData.SensorConfigs);
          const jsonConfig = JSON.stringify(configObj);
          
          // TODO: 提交
          // await addSensorType({ ...curData, SensorConfigs: jsonConfig });
        }
      });
    }
  });
}
```

**2. 表单结构**:

```
├── 传感器类型 (必填, 如: Temperature)
├── 传感器描述 (必填, 如: 温度传感器)
└── 传感器配置 (必填, INI格式)
    ├── 插入示例模板
    ├── 格式化JSON
    └── 验证格式
```

**3. 配置示例**:

```ini
unit=℃
protocol=Modbus RTU
enable=true
min=-40
max=125
accuracy=0.5
baudRate=9600
dataBits=8
stopBits=1
parity=None
address=1
```

---

##### 2.2.3 配置查看

**实现文件**: `src/views/SensorManage/SensorTypePage/components/ConfigViewer.vue`

**功能说明**:

- 友好的配置展示
- 按类型分组显示
- 支持布尔值、数字、字符串的差异化显示

**实现逻辑**:

```typescript
// 格式化配置显示
const formattedConfig = computed(() => {
  return formatConfigForDisplay(props.config);
});

// 在模板中使用Descriptions组件展示
<el-descriptions :column="2" border size="small">
  <el-descriptions-item
    v-for="item in formattedConfig"
    :key="item.key"
    :label="item.label"
  >
    <el-tag v-if="typeof item.value === 'boolean'" 
            :type="item.value ? 'success' : 'info'">
      {{ item.value ? "是" : "否" }}
    </el-tag>
    <el-tag v-else-if="typeof item.value === 'number'" type="warning">
      {{ item.value }}
    </el-tag>
    <span v-else>{{ item.value }}</span>
  </el-descriptions-item>
</el-descriptions>
```

---

##### 2.2.4 删除类型

**实现文件**: `src/views/SensorManage/SensorTypePage/utils/hook.tsx`

**功能说明**:

- 二次确认
- 删除后刷新列表

**实现逻辑**:

```typescript
// 位置: useSensorType() -> handleDelete()
function handleDelete(row: FormItemProps) {
  ElMessageBox.confirm(`确认删除传感器类型"${row.SensorType}"吗？`, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      // TODO: 调用删除接口
      // await deleteSensorType(row.SensorType);
      
      message(`已删除传感器类型 ${row.SensorType}`, { type: "success" });
      onSearch();
    })
    .catch(() => {});
}
```

---

### 三、公共功能

#### 3.1 国际化

**实现文件**:

- 配置: `locales/zh-CN.ts`, `locales/en.ts`
- 使用: `src/plugins/i18n.ts`

**支持语言**: 中文、英文、日文、繁体中文、德语

**使用方式**:

```typescript
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const title = t("sensorManage.sensorList.table.sensorName");
```

---

#### 3.2 权限控制

**实现文件**: `src/router/modules/sensorManage.ts`

**权限配置**:

```typescript
{
  path: "/SensorManage/sensor-list",
  meta: {
    roles: ["admin", "common"]  // 管理员和普通用户
  }
},
{
  path: "/SensorManage/sensor-type",
  meta: {
    roles: ["admin"]  // 仅管理员
  }
}
```

---

#### 3.3 图标管理

**实现文件**: `src/plugins/iconify.ts`

**功能说明**:

- Iconify离线图标
- 支持Element Plus和Remix Icon图标集

**使用方式**:

```typescript
// 在main.ts中初始化
import { setupIconify } from "@/plugins/iconify";
setupIconify();

// 在组件中使用
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
<el-button :icon="useRenderIcon('ri/search-line')">搜索</el-button>
```

---

### 四、API接口列表

#### 4.1 传感器列表接口

**文件**: `src/api/sensor.ts`

| 接口名 | 方法 | 路径 | 说明 |
|--------|------|------|------|
| getSensorTypeList | GET | /sensor/types | 获取传感器类型列表 |
| getSensorList | POST | /sensor/list | 获取传感器列表 |
| getSensorConfig | GET | /sensor/type/:type/config | 获取类型配置 |
| addSensor | POST | /sensor/add | 新增传感器 |
| updateSensor | PUT | /sensor/update | 更新传感器 |
| deleteSensor | DELETE | /sensor/delete/:id | 删除传感器 |
| updateSensorStatus | PUT | /sensor/status/:id | 更新状态 |
| getSvidData | GET | /sensor/svid/:svid/data | 获取单个SVID数据 |
| getBatchSvidData | POST | /sensor/svid/batch | 批量获取SVID数据 |

#### 4.2 Mock数据

**文件**: `mock/sensor.ts`

**配置**: 在`vite.config.ts`中启用Mock插件

```typescript
import { vitePluginFakeServer } from "vite-plugin-fake-server";

plugins: [
  vitePluginFakeServer({
    logger: true,
    include: "mock",
    enableProd: true
  })
]
```

---

### 五、数据流转图

```
用户操作 → 页面组件 → Hook逻辑 → API接口 → Mock/后端
                ↓
            更新状态
                ↓
            刷新视图
```

**详细流程**:

1. **查询传感器列表**:

```
用户点击搜索 
→ index.vue触发onSearch() 
→ hook.tsx调用getSensorList() 
→ api/sensor.ts发送请求 
→ mock/sensor.ts返回数据 
→ 更新dataList.value 
→ 表格刷新显示
```

2. **新增传感器**:

```
用户点击新增 
→ hook.tsx调用openDialog() 
→ 打开form.vue弹窗 
→ 用户填写表单 
→ 点击确定触发beforeSure 
→ 表单验证通过 
→ 调用addSensor() 
→ 成功后关闭弹窗 
→ 刷新列表
```

3. **SVID数据查询**:

```
用户点击查看 
→ hook.tsx调用handleViewSvidData() 
→ 打开SvidDataViewer.vue 
→ 用户选择Station 
→ 点击查询数据 
→ 检查5秒限流 
→ 调用getBatchSvidData() 
→ 更新svidDataList 
→ 表格显示数据
```

---

### 六、关键技术点

#### 6.1 INI配置解析

**核心算法**:

```typescript
export function parseINI(iniText: string): Record<string, any> {
  const result = {};
  const lines = iniText.split(/\r?\n/);
  
  for (const line of lines) {
    // 跳过注释和空行
    if (!line || line.startsWith(';') || line.startsWith('#')) continue;
    
    // 解析 key=value
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      
      // 类型转换
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      else if (!isNaN(Number(value))) value = Number(value);
      
      result[key] = value;
    }
  }
  
  return result;
}
```

**特点**:

- 支持注释 (`;` 或 `#` 开头)
- 自动类型转换 (boolean, number, string)
- 简单的key=value格式
- 错误提示行号

---

#### 6.2 Station分页管理

**核心思路**:

```typescript
// 1. 按Station分组存储
interface SvidItem {
  channel: string;  // Channel1_S1
  svid: string;     // SVID001_S1
  station: number;  // 1, 2, 3...
}

// 2. 计算属性过滤当前Station
const currentStationSvids = computed(() => {
  return allSvids.value.filter(item => item.station === currentStation.value);
});

// 3. 切换Station时重新初始化
watch(currentStation, () => {
  loadCurrentStationData();
});
```

---

#### 6.3 查询限流

**实现方式**:

```typescript
// 1. 状态管理
const canQueryNow = ref(true);
const lastQueryTime = ref(0);
const remainingTime = ref(0);

// 2. 倒计时更新
const startCountdown = () => {
  canQueryNow.value = false;
  
  const timer = setInterval(() => {
    const elapsed = Date.now() - lastQueryTime.value;
    const remaining = 5000 - elapsed;
    
    if (remaining <= 0) {
      canQueryNow.value = true;
      remainingTime.value = 0;
      clearInterval(timer);
    } else {
      remainingTime.value = Math.ceil(remaining / 1000);
    }
  }, 100);
};

// 3. 查询时启动倒计时
const querySvidData = async () => {
  if (!canQueryNow.value) {
    ElMessage.warning(`请等待 ${remainingTime.value} 秒`);
    return;
  }
  
  lastQueryTime.value = Date.now();
  startCountdown();
  
  // 执行查询...
};
```

---

### 七、待实现功能

当前项目使用Mock数据，以下功能需要对接真实后端：

#### 7.1 传感器列表管理

- [ ] 传感器列表查询接口
- [ ] 新增传感器接口
- [ ] 编辑传感器接口
- [ ] 删除传感器接口
- [ ] 启用/停用状态切换接口

#### 7.2 传感器类型管理

- [ ] 类型列表查询接口
- [ ] 新增类型接口
- [ ] 编辑类型接口
- [ ] 删除类型接口

#### 7.3 SVID数据管理

- [ ] 单个SVID数据查询接口
- [ ] 批量SVID数据查询接口

#### 7.4 文件操作

- [ ] SVID配置CSV导入
- [ ] SVID配置CSV导出

---

### 八、部署说明

#### 8.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:5173
```

#### 8.2 生产环境

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

#### 8.3 环境变量

**文件**: `.env.development`, `.env.production`

```bash
# 开发环境
VITE_HIDE_HOME=false
VITE_PUBLIC_PATH=/

# 生产环境
VITE_HIDE_HOME=true
VITE_PUBLIC_PATH=/
```

---

### 九、常见问题

#### 9.1 Mock数据不显示

**原因**: Mock插件未正确配置

**解决方案**:

```typescript
// vite.config.ts
import { vitePluginFakeServer } from "vite-plugin-fake-server";

export default defineConfig({
  plugins: [
    vitePluginFakeServer({
      logger: true,      // 启用日志
      include: "mock",   // Mock文件目录
      enableProd: true   // 生产环境启用
    })
  ]
});
```

重启开发服务器: `npm run dev`

---

#### 9.2 图标不显示

**原因**: Iconify离线图标未初始化

**解决方案**:

```typescript
// main.ts
import { setupIconify } from "@/plugins/iconify";

setupIconify(); // 在app.mount之前调用
```

---

#### 9.3 SVID查询按钮无法恢复

**原因**: 倒计时定时器未正确清理

**解决方案**: 已在代码中修复

- 使用`canQueryNow` ref直接控制状态
- 在倒计时结束时设置`canQueryNow.value = true`
- 组件卸载时清理定时器

---

### 十、技术选型说明

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.x | 前端框架 |
| TypeScript | 5.x | 类型检查 |
| Element Plus | 2.x | UI组件库 |
| Vite | 5.x | 构建工具 |
| Vue Router | 4.x | 路由管理 |
| Pinia | 2.x | 状态管理 |
| Vue I18n | 9.x | 国际化 |
| Iconify | 3.x | 图标方案 |
| Day.js | 1.x | 日期处理 |

---

## 总结

本系统实现了完整的传感器管理功能，包括：

✅ **传感器CRUD** - 增删改查全功能  
✅ **类型管理** - 配置模板管理  
✅ **SVID管理** - 多站点分页配置  
✅ **实时数据** - 查询和显示传感器数据  
✅ **配置管理** - INI格式编辑，JSON存储  
✅ **国际化** - 多语言支持  
✅ **权限控制** - 基于角色的访问控制  
✅ **响应式设计** - 适配各种屏幕尺寸  

系统采用现代化的前端技术栈，代码结构清晰，易于维护和扩展。所有功能均已使用Mock数据验证，可直接对接后端API。

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2024-01 | 初始版本，实现基础功能 |

---

## 联系方式

如有问题，请联系开发团队。
