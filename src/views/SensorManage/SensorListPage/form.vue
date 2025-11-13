<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import {
  getSensorTypeList,
  getSensorConfig,
  type SensorTypeResult
} from "@/api/sensor";
import { ElMessage } from "element-plus";
import SvidConfig from "./components/SvidConfig.vue";
import { formatConfigForDisplay as formatConfig } from "./utils/iniParser";
import { stringifyINI, parseINI } from "../SensorTypePage/utils/iniParser";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    SensorType: "",
    PortType: "",
    SensorName: "",
    Enable: false,
    WSID: "",
    Location: "",
    EQPID: "",
    IP: "",
    StationNo: 0,
    Port: 0,
    Com: "",
    LastUpdateUser: "",
    LastUpdateTime: "",
    SvidList: [],
    SensorConfigs: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);
const sensorTypeList = ref<SensorTypeResult[]>([]);
const sensorTypeLoading = ref(false);

// 控制字段显示的开关
const showIPConfig = ref(false);
const showCOMConfig = ref(false);
const showSensorConfig = ref(false);
const showSvidConfig = ref(false);
const showEditSensorConfig = ref(false); // 新增：是否编辑配置

// 当前传感器类型的配置
const currentSensorConfig = ref<Record<string, any>>({});
const sensorConfigLoading = ref(false);

// 编辑模式下的 INI 配置文本
const sensorConfigIniText = ref("");

// 获取传感器类型列表
const loadSensorTypes = async () => {
  sensorTypeLoading.value = true;
  try {
    const response = await getSensorTypeList();
    console.log("Sensor Types Response:", response); // 调试日志

    // 根据实际响应结构调整：支持直接返回数组或 { data: [...] } 的情况
    if (Array.isArray(response)) {
      sensorTypeList.value = response;
    } else if (Array.isArray((response as any)?.data)) {
      sensorTypeList.value = (response as any).data;
    } else {
      sensorTypeList.value = [];
    }
  } catch (error) {
    console.error("获取传感器类型失败:", error);
    ElMessage.error("获取传感器类型失败");
    // 如果接口失败，使用默认数据
    sensorTypeList.value = [
      { SensorType: "Temperature", SensorDesc: "温度传感器" },
      { SensorType: "Humidity", SensorDesc: "湿度传感器" },
      { SensorType: "Pressure", SensorDesc: "压力传感器" }
    ];
  } finally {
    sensorTypeLoading.value = false;
  }
};

// 初始化时根据传入数据设置开关状态
const initConfigSwitches = () => {
  // 如果有 IP 和 Port 数据，打开 IP 配置
  if (props.formInline.IP || props.formInline.Port) {
    showIPConfig.value = true;
  }

  // 如果有 COM 数据，打开 COM 配置
  if (props.formInline.Com) {
    showCOMConfig.value = true;
  }

  // 如果有 SVID 列表数据，打开 SVID 配置
  if (props.formInline.SvidList && props.formInline.SvidList.length > 0) {
    showSvidConfig.value = true;
  }

  // 如果有传感器配置数据，打开传感器配置并加载
  if (props.formInline.SensorConfigs) {
    showSensorConfig.value = true;
    try {
      const configObj = JSON.parse(props.formInline.SensorConfigs);
      currentSensorConfig.value = configObj;
      sensorConfigIniText.value = stringifyINI(configObj);
    } catch (error) {
      console.error("解析已有配置失败:", error);
    }
  }
};

// 获取选中传感器类型的配置信息
const loadSensorConfig = async (sensorType: string) => {
  if (!sensorType) {
    currentSensorConfig.value = {};
    sensorConfigIniText.value = "";
    return;
  }

  // 如果已经有自定义配置，不覆盖
  if (newFormInline.value.SensorConfigs) {
    try {
      const configObj = JSON.parse(newFormInline.value.SensorConfigs);
      currentSensorConfig.value = configObj;
      sensorConfigIniText.value = stringifyINI(configObj);
      return;
    } catch (error) {
      console.error("解析现有配置失败:", error);
    }
  }

  sensorConfigLoading.value = true;
  try {
    // 从传感器类型列表中获取配置
    const typeInfo = sensorTypeList.value.find(
      item => item.SensorType === sensorType
    );

    if (typeInfo?.SensorConfigs) {
      // 解析 JSON 字符串
      const configObj = JSON.parse(typeInfo.SensorConfigs);
      currentSensorConfig.value = configObj;

      // 转换为 INI 格式用于编辑
      sensorConfigIniText.value = stringifyINI(configObj);
    } else {
      // 如果列表中没有，调用接口获取
      const { data } = await getSensorConfig(sensorType);
      currentSensorConfig.value = data || {};
      sensorConfigIniText.value = data ? stringifyINI(data) : "";
    }
  } catch (error) {
    console.error("获取传感器配置失败:", error);
    ElMessage.error("获取传感器配置失败");
    currentSensorConfig.value = {};
    sensorConfigIniText.value = "";
  } finally {
    sensorConfigLoading.value = false;
  }
};

// 保存配置编辑
const saveSensorConfig = () => {
  try {
    // 解析 INI 格式为 JSON 对象
    const configObj = parseINI(sensorConfigIniText.value);
    currentSensorConfig.value = configObj;

    // 将配置保存到表单数据中（JSON 字符串格式）
    newFormInline.value.SensorConfigs = JSON.stringify(configObj);

    showEditSensorConfig.value = false;
    ElMessage.success("配置保存成功");
  } catch (error) {
    ElMessage.error("配置格式错误：" + (error as Error).message);
  }
};

// 取消配置编辑
const cancelEditConfig = () => {
  // 恢复为原始配置
  if (Object.keys(currentSensorConfig.value).length > 0) {
    sensorConfigIniText.value = stringifyINI(currentSensorConfig.value);
  }
  showEditSensorConfig.value = false;
};

// 监听传感器类型变化
watch(
  () => newFormInline.value.SensorType,
  (newType, oldType) => {
    // 只有在类型真正改变，且开关打开时才重新加载
    if (newType !== oldType && newType && showSensorConfig.value) {
      // 如果没有自定义配置，才从类型配置加载
      if (!newFormInline.value.SensorConfigs) {
        loadSensorConfig(newType);
      }
    } else if (!newType) {
      // 清空类型时，清空配置
      currentSensorConfig.value = {};
      sensorConfigIniText.value = "";
    }
  }
);

// 监听配置开关变化
watch(showSensorConfig, show => {
  if (show && newFormInline.value.SensorType) {
    // 如果已有自定义配置，优先使用
    if (newFormInline.value.SensorConfigs) {
      try {
        const configObj = JSON.parse(newFormInline.value.SensorConfigs);
        currentSensorConfig.value = configObj;
        sensorConfigIniText.value = stringifyINI(configObj);
      } catch (error) {
        loadSensorConfig(newFormInline.value.SensorType);
      }
    } else {
      loadSensorConfig(newFormInline.value.SensorType);
    }
  } else if (!show) {
    showEditSensorConfig.value = false;
  }
});

// 格式化配置显示（与 SensorTypePage 保持一致）
const formatConfigForDisplay = computed(() => {
  return formatConfig(currentSensorConfig.value);
});

function getRef() {
  return ruleFormRef.value;
}

onMounted(() => {
  loadSensorTypes().then(() => {
    // 加载完传感器类型后，初始化开关状态
    initConfigSwitches();
  });
});

// SVID 列表 - 使用独立的 ref 管理
const svidList = ref(
  props.formInline.SvidList && props.formInline.SvidList.length > 0
    ? props.formInline.SvidList
    : []
);

// 监听 svidList 变化，同步到 formInline
watch(
  svidList,
  newVal => {
    newFormInline.value.SvidList = newVal;
  },
  { deep: true }
);

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="120px"
  >
    <!-- 基本信息 -->
    <el-divider content-position="left">
      <span class="text-sm font-semibold">基本信息</span>
    </el-divider>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="传感器名称" prop="SensorName">
          <el-input
            v-model="newFormInline.SensorName"
            clearable
            placeholder="请输入传感器名称"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="传感器类型" prop="SensorType">
          <el-select
            v-model="newFormInline.SensorType"
            clearable
            placeholder="请选择传感器类型"
            class="w-full"
            :loading="sensorTypeLoading"
          >
            <el-option
              v-for="item in sensorTypeList"
              :key="item.SensorType"
              :label="item.SensorDesc"
              :value="item.SensorType"
            />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="连接方式" prop="PortType">
          <el-select
            v-model="newFormInline.PortType"
            clearable
            placeholder="请选择连接方式"
            class="w-full"
          >
            <el-option label="TCP/IP" value="TCP" />
            <el-option label="串口" value="Serial" />
            <el-option label="USB" value="USB" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否启用" prop="Enable">
          <el-switch
            v-model="newFormInline.Enable"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 设备信息 -->
    <el-divider content-position="left">
      <span class="text-sm font-semibold">设备信息</span>
    </el-divider>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="OPI编号" prop="WSID">
          <el-input
            v-model="newFormInline.WSID"
            clearable
            placeholder="请输入OPI编号"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="OPI位置" prop="Location">
          <el-input
            v-model="newFormInline.Location"
            clearable
            placeholder="请输入OPI位置"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="机台编号" prop="EQPID">
          <el-input
            v-model="newFormInline.EQPID"
            clearable
            placeholder="请输入机台编号"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="站点编号" prop="StationNo">
          <el-input-number
            v-model="newFormInline.StationNo"
            :min="0"
            placeholder="请输入站点编号"
            class="w-full"
            controls-position="right"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 配置项开关 -->
    <el-divider content-position="left">
      <span class="text-sm font-semibold">可选配置项</span>
    </el-divider>

    <el-row :gutter="20" class="config-switches">
      <el-col :span="6">
        <el-form-item label="添加IP配置" label-width="120px">
          <el-switch
            v-model="showIPConfig"
            active-text="是"
            inactive-text="否"
            inline-prompt
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="添加COM配置" label-width="120px">
          <el-switch
            v-model="showCOMConfig"
            active-text="是"
            inactive-text="否"
            inline-prompt
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="查看传感器配置" label-width="140px">
          <el-switch
            v-model="showSensorConfig"
            active-text="是"
            inactive-text="否"
            inline-prompt
          />
        </el-form-item>
      </el-col>
      <el-col :span="6">
        <el-form-item label="添加SVID配置" label-width="140px">
          <el-switch
            v-model="showSvidConfig"
            active-text="是"
            inactive-text="否"
            inline-prompt
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- IP 配置区域 -->
    <template v-if="showIPConfig">
      <el-divider content-position="left">
        <span class="text-sm font-semibold text-primary">IP 配置</span>
      </el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="IP地址" prop="IP">
            <el-input
              v-model="newFormInline.IP"
              clearable
              placeholder="请输入IP地址（如：192.168.1.100）"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="端口号" prop="Port">
            <el-input-number
              v-model="newFormInline.Port"
              :min="0"
              :max="65535"
              placeholder="请输入端口号"
              class="w-full"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- COM 配置区域 -->
    <template v-if="showCOMConfig">
      <el-divider content-position="left">
        <span class="text-sm font-semibold text-primary">COM 配置</span>
      </el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="COM口" prop="Com">
            <el-input
              v-model="newFormInline.Com"
              clearable
              placeholder="请输入COM口（如：COM1）"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 传感器配置区域 -->
    <template v-if="showSensorConfig">
      <el-divider content-position="left">
        <span class="text-sm font-semibold text-primary">传感器配置</span>
      </el-divider>

      <div class="sensor-config-container">
        <!-- 配置操作按钮 -->
        <div class="config-actions mb-3">
          <el-button
            v-if="!showEditSensorConfig"
            type="primary"
            size="small"
            @click="showEditSensorConfig = true"
          >
            编辑配置
          </el-button>
          <template v-else>
            <el-button type="success" size="small" @click="saveSensorConfig">
              保存配置
            </el-button>
            <el-button size="small" @click="cancelEditConfig"> 取消 </el-button>
          </template>
        </div>

        <!-- 编辑模式：INI 文本编辑器 -->
        <div v-if="showEditSensorConfig" class="config-editor">
          <el-input
            v-model="sensorConfigIniText"
            type="textarea"
            :rows="15"
            placeholder="请输入配置内容，格式：
key=value
例如：
unit=℃
protocol=Modbus RTU
min=-40
max=125"
          />
          <el-alert type="info" :closable="false" class="mt-2">
            <template #title>
              <span class="text-xs">
                配置格式为 key=value，保存后将转换为 JSON 格式存储
              </span>
            </template>
          </el-alert>
        </div>

        <!-- 查看模式：表格展示 -->
        <div v-else>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item
              v-for="item in formatConfigForDisplay"
              :key="item.key"
              :label="item.label"
              label-class-name="config-label"
            >
              <el-tag
                v-if="typeof item.value === 'boolean'"
                :type="item.value ? 'success' : 'info'"
                size="small"
              >
                {{ item.value ? "是" : "否" }}
              </el-tag>
              <el-tag
                v-else-if="typeof item.value === 'number'"
                type="warning"
                size="small"
              >
                {{ item.value }}
              </el-tag>
              <span v-else class="config-value">{{ item.value }}</span>
            </el-descriptions-item>
          </el-descriptions>

          <el-alert type="info" :closable="false" show-icon class="mt-3">
            <template #title>
              <span class="text-xs">
                以上配置来自传感器类型管理。点击"编辑配置"可自定义此传感器的配置。
              </span>
            </template>
          </el-alert>
        </div>
      </div>
    </template>

    <!-- SVID 配置区域 -->
    <template v-if="showSvidConfig">
      <el-divider content-position="left">
        <span class="text-sm font-semibold text-primary">SVID 配置</span>
      </el-divider>
      <div class="svid-config-container">
        <SvidConfig v-model="svidList" :station-no="newFormInline.StationNo" />
      </div>
    </template>
  </el-form>
</template>

<style scoped lang="scss">
:deep(.el-divider__text) {
  background-color: var(--el-bg-color);
  padding: 0 16px;
  font-weight: 500;
}

:deep(.el-divider--horizontal) {
  margin: 20px 0;
}

.config-switches {
  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}

.sensor-config-container {
  padding: 0 8px;

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: var(--el-text-color-secondary);
  }

  .empty-container {
    padding: 20px 0;
  }

  .config-collapse {
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
  }

  :deep(.config-label) {
    width: 35%;
    background-color: var(--el-fill-color-light);
    font-weight: 500;
  }

  .config-value {
    color: var(--el-text-color-primary);
    font-family: "Courier New", monospace;
  }
}

.svid-config-container {
  padding: 0 8px;
}

.section-title {
  display: flex;
  align-items: center;
}

:deep(.el-collapse-item__header) {
  font-weight: 500;
  font-size: 14px;
  height: 48px;
  line-height: 48px;
  padding-left: 16px;
  background-color: var(--el-fill-color-light);
  &:hover {
    background-color: var(--el-fill-color-light);
  }
}

:deep(.el-collapse-item__content) {
  padding: 16px;
}

:deep(.el-input-number) {
  padding: 0 8px;
  width: 100%;
}

.text-primary {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.config-actions {
  display: flex;
  gap: 8px;
  padding: 8px;
  background-color: var(--el-fill-color-lighter);
  border-radius: 4px;
}

.config-editor {
  :deep(.el-textarea__inner) {
    font-family: "Courier New", monospace;
    font-size: 13px;
    line-height: 1.6;
  }
}
</style>
