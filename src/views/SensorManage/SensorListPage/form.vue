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
import { useI18n } from "vue-i18n";

const { t } = useI18n();

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
    const configObj = parseINI(sensorConfigIniText.value);
    currentSensorConfig.value = configObj;
    newFormInline.value.SensorConfigs = JSON.stringify(configObj);
    showEditSensorConfig.value = false;
    ElMessage.success(t("sensorManage.sensorForm.sensorConfig.saveSuccess"));
  } catch (error) {
    ElMessage.error(
      t("sensorManage.sensorForm.sensorConfig.formatError") +
        "：" +
        (error as Error).message
    );
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
    label-width="140px"
    class="sensor-form"
  >
    <!-- 基本信息 -->
    <el-divider content-position="left">
      <span class="text-sm font-semibold">{{
        t("sensorManage.sensorForm.basicInfo")
      }}</span>
    </el-divider>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item
          :label="t('sensorManage.sensorForm.sensorName')"
          prop="SensorName"
        >
          <el-input
            v-model="newFormInline.SensorName"
            clearable
            :placeholder="t('sensorManage.sensorForm.placeholder.sensorName')"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          :label="t('sensorManage.sensorForm.sensorType')"
          prop="SensorType"
        >
          <el-select
            v-model="newFormInline.SensorType"
            clearable
            :placeholder="t('sensorManage.sensorForm.placeholder.sensorType')"
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
        <el-form-item
          :label="t('sensorManage.sensorForm.portType')"
          prop="PortType"
        >
          <el-select
            v-model="newFormInline.PortType"
            clearable
            :placeholder="t('sensorManage.sensorForm.placeholder.portType')"
            class="w-full"
          >
            <el-option :label="t('sensorManage.sensorForm.tcp')" value="TCP" />
            <el-option
              :label="t('sensorManage.sensorForm.serial')"
              value="Serial"
            />
            <el-option :label="t('sensorManage.sensorForm.usb')" value="USB" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          :label="t('sensorManage.sensorForm.enable')"
          prop="Enable"
        >
          <el-switch
            v-model="newFormInline.Enable"
            :active-text="t('sensorManage.sensorForm.enableText')"
            :inactive-text="t('sensorManage.sensorForm.disableText')"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 设备信息 -->
    <el-divider content-position="left">
      <span class="text-sm font-semibold">{{
        t("sensorManage.sensorForm.deviceInfo")
      }}</span>
    </el-divider>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item :label="t('sensorManage.sensorForm.wsid')" prop="WSID">
          <el-input
            v-model="newFormInline.WSID"
            clearable
            :placeholder="t('sensorManage.sensorForm.placeholder.wsid')"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          :label="t('sensorManage.sensorForm.location')"
          prop="Location"
        >
          <el-input
            v-model="newFormInline.Location"
            clearable
            :placeholder="t('sensorManage.sensorForm.placeholder.location')"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item :label="t('sensorManage.sensorForm.eqpid')" prop="EQPID">
          <el-input
            v-model="newFormInline.EQPID"
            clearable
            :placeholder="t('sensorManage.sensorForm.placeholder.eqpid')"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item
          :label="t('sensorManage.sensorForm.stationNo')"
          prop="StationNo"
        >
          <el-input-number
            v-model="newFormInline.StationNo"
            :min="0"
            :placeholder="t('sensorManage.sensorForm.placeholder.stationNo')"
            class="w-full"
            controls-position="right"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- 配置项开关 -->
    <el-divider content-position="left">
      <span class="text-sm font-semibold">{{
        t("sensorManage.sensorForm.optionalConfig")
      }}</span>
    </el-divider>

    <el-row :gutter="20" class="config-switches">
      <el-col :xs="24" :sm="12" :md="6">
        <el-form-item
          :label="t('sensorManage.sensorForm.switch.ipConfig')"
          class="switch-item"
        >
          <el-switch
            v-model="showIPConfig"
            :active-text="t('sensorManage.sensorForm.switch.yes')"
            :inactive-text="t('sensorManage.sensorForm.switch.no')"
            inline-prompt
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-form-item
          :label="t('sensorManage.sensorForm.switch.comConfig')"
          class="switch-item"
        >
          <el-switch
            v-model="showCOMConfig"
            :active-text="t('sensorManage.sensorForm.switch.yes')"
            :inactive-text="t('sensorManage.sensorForm.switch.no')"
            inline-prompt
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-form-item
          :label="t('sensorManage.sensorForm.switch.sensorConfig')"
          class="switch-item"
        >
          <el-switch
            v-model="showSensorConfig"
            :active-text="t('sensorManage.sensorForm.switch.yes')"
            :inactive-text="t('sensorManage.sensorForm.switch.no')"
            inline-prompt
          />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-form-item
          :label="t('sensorManage.sensorForm.switch.svidConfig')"
          class="switch-item"
        >
          <el-switch
            v-model="showSvidConfig"
            :active-text="t('sensorManage.sensorForm.switch.yes')"
            :inactive-text="t('sensorManage.sensorForm.switch.no')"
            inline-prompt
          />
        </el-form-item>
      </el-col>
    </el-row>

    <!-- IP 配置区域 -->
    <template v-if="showIPConfig">
      <el-divider content-position="left" class="config-divider">
        <span class="text-sm font-semibold text-primary">
          <el-icon class="mr-1"><Setting /></el-icon>
          {{ t("sensorManage.sensorForm.ipConfig.title") }}
        </span>
      </el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="t('sensorManage.sensorForm.ipConfig.ip')"
            prop="IP"
          >
            <el-input
              v-model="newFormInline.IP"
              clearable
              :placeholder="t('sensorManage.sensorForm.ipConfig.ipPlaceholder')"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            :label="t('sensorManage.sensorForm.ipConfig.port')"
            prop="Port"
          >
            <el-input-number
              v-model="newFormInline.Port"
              :min="0"
              :max="65535"
              :placeholder="
                t('sensorManage.sensorForm.ipConfig.portPlaceholder')
              "
              class="w-full"
              controls-position="right"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- COM 配置区域 -->
    <template v-if="showCOMConfig">
      <el-divider content-position="left" class="config-divider">
        <span class="text-sm font-semibold text-primary">
          <el-icon class="mr-1"><Setting /></el-icon>
          {{ t("sensorManage.sensorForm.comConfig.title") }}
        </span>
      </el-divider>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item
            :label="t('sensorManage.sensorForm.comConfig.com')"
            prop="Com"
          >
            <el-input
              v-model="newFormInline.Com"
              clearable
              :placeholder="
                t('sensorManage.sensorForm.comConfig.comPlaceholder')
              "
            />
          </el-form-item>
        </el-col>
      </el-row>
    </template>

    <!-- 传感器配置区域 -->
    <template v-if="showSensorConfig">
      <el-divider content-position="left" class="config-divider">
        <span class="text-sm font-semibold text-primary">
          <el-icon class="mr-1"><Setting /></el-icon>
          {{ t("sensorManage.sensorForm.sensorConfig.title") }}
        </span>
      </el-divider>

      <div class="sensor-config-container">
        <el-alert
          v-if="!newFormInline.SensorType"
          type="warning"
          :closable="false"
          show-icon
          class="mb-3"
        >
          <template #title>{{
            t("sensorManage.sensorForm.sensorConfig.noType")
          }}</template>
        </el-alert>

        <div v-else-if="sensorConfigLoading" class="loading-container">
          <el-icon class="is-loading" :size="24">
            <Loading />
          </el-icon>
          <span class="ml-2">{{
            t("sensorManage.sensorForm.sensorConfig.loading")
          }}</span>
        </div>

        <div
          v-else-if="Object.keys(currentSensorConfig).length === 0"
          class="empty-container"
        >
          <el-empty
            :description="t('sensorManage.sensorForm.sensorConfig.empty')"
            :image-size="80"
          />
        </div>

        <div v-else>
          <!-- 配置操作按钮 -->
          <div class="config-actions">
            <el-button
              v-if="!showEditSensorConfig"
              type="primary"
              size="small"
              @click="showEditSensorConfig = true"
            >
              {{ t("sensorManage.sensorForm.sensorConfig.editBtn") }}
            </el-button>
            <template v-else>
              <el-button type="success" size="small" @click="saveSensorConfig">
                {{ t("sensorManage.sensorForm.sensorConfig.saveBtn") }}
              </el-button>
              <el-button size="small" @click="cancelEditConfig">
                {{ t("sensorManage.sensorForm.sensorConfig.cancelBtn") }}
              </el-button>
            </template>
          </div>

          <!-- 编辑模式：INI 文本编辑器 -->
          <div v-if="showEditSensorConfig" class="config-editor">
            <el-input
              v-model="sensorConfigIniText"
              type="textarea"
              :rows="15"
              :placeholder="
                t('sensorManage.sensorForm.sensorConfig.placeholder')
              "
            />
            <el-alert type="info" :closable="false" class="mt-2">
              <template #title>
                <span class="text-xs">
                  {{ t("sensorManage.sensorForm.sensorConfig.tip") }}
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
                  {{ item.value ? t("common.yes") : t("common.no") }}
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
                  {{ t("sensorManage.sensorForm.sensorConfig.reference") }}
                </span>
              </template>
            </el-alert>
          </div>
        </div>
      </div>
    </template>

    <!-- SVID 配置区域 -->
    <template v-if="showSvidConfig">
      <el-divider content-position="left" class="config-divider">
        <span class="text-sm font-semibold text-primary">
          <el-icon class="mr-1"><Document /></el-icon>
          {{ t("sensorManage.sensorForm.svidConfig.title") }}
        </span>
      </el-divider>
      <div class="svid-config-container">
        <SvidConfig v-model="svidList" :station-no="newFormInline.StationNo" />
      </div>
      <!-- 添加底部间距 -->
      <div style="height: 20px" />
    </template>
  </el-form>
</template>

<style scoped lang="scss">
.sensor-form {
  padding: 16px;
  max-height: calc(85vh - 120px); // 调整最大高度，预留底部空间
  overflow-y: auto;
  overflow-x: hidden; // 防止横向滚动

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: var(--el-fill-color-lighter);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--el-border-color-dark);
    border-radius: 4px;

    &:hover {
      background-color: var(--el-border-color-darker);
    }
  }

  :deep(.el-divider) {
    margin: 24px 0 20px;
  }

  :deep(.el-divider__text) {
    background-color: var(--el-bg-color);
    padding: 0 16px;
    font-weight: 600;
  }

  :deep(.el-form-item) {
    margin-bottom: 22px;
  }

  // 配置项开关区域
  .config-switches {
    .switch-item {
      :deep(.el-form-item__label) {
        font-size: 13px;
        white-space: nowrap;
      }
    }
  }

  // 配置区域分割线
  .config-divider {
    margin-top: 32px !important;

    .text-primary {
      display: flex;
      align-items: center;
      color: var(--el-color-primary);
    }
  }

  // 传感器配置容器
  .sensor-config-container {
    padding: 16px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
    margin-bottom: 16px;

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

    .config-actions {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background-color: var(--el-bg-color);
      border-radius: 4px;
    }

    .config-editor {
      :deep(.el-textarea__inner) {
        font-family: "Courier New", monospace;
        font-size: 13px;
        line-height: 1.6;
      }
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

  // SVID 配置容器
  .svid-config-container {
    padding: 16px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
    margin-bottom: 20px; // 增加底部间距
    min-height: 400px; // 确保有足够高度显示内容
  }

  // 响应式调整
  @media (max-width: 768px) {
    max-height: calc(90vh - 100px);

    .config-switches {
      :deep(.el-col) {
        margin-bottom: 12px;
      }
    }
  }
}

// 输入框聚焦效果
:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  border-color: var(--el-color-primary);
}

// Switch 样式优化
:deep(.el-switch) {
  height: 24px;
}

// 数字输入框优化
:deep(.el-input-number) {
  .el-input__inner {
    text-align: left;
  }
}
</style>
