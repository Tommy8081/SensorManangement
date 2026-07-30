<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

interface SvidItem {
  channel: string;
  svid: string;
  station?: number;
}

interface SvidData {
  svid: string;
  channel: string;
  value: any;
  timestamp: string;
  status: "success" | "error" | "loading";
  message?: string;
}

const props = defineProps<{
  sensorName: string;
  svidList: SvidItem[];
  stationNo: number;
}>();

const svidDataList = ref<SvidData[]>([]);
const loading = ref(false);
const lastQueryTime = ref(0);
const remainingTime = ref(0);
const canQueryNow = ref(true); // 新增：直接控制按钮状态
let countdownTimer: number | null = null;

// 当前选中的 Station
const currentStation = ref(1);

// Station 选项列表
const stationOptions = computed(() => {
  return Array.from({ length: props.stationNo }, (_, i) => ({
    label: `Station ${i + 1}`,
    value: i + 1
  }));
});

// 按 Station 分组的 SVID 列表
const svidsByStation = computed(() => {
  const grouped = new Map<number, SvidItem[]>();

  // 初始化所有 Station
  for (let i = 1; i <= props.stationNo; i++) {
    grouped.set(i, []);
  }

  // 按 station 分组
  props.svidList.forEach(item => {
    const station = item.station || 1;
    if (!grouped.has(station)) {
      grouped.set(station, []);
    }
    grouped.get(station)!.push(item);
  });

  return grouped;
});

// 当前 Station 的 SVID 列表
const currentStationSvidList = computed(() => {
  return svidsByStation.value.get(currentStation.value) || [];
});

// 初始化数据列表
const initDataList = () => {
  svidDataList.value = currentStationSvidList.value.map(item => ({
    svid: item.svid,
    channel: item.channel,
    value: null,
    timestamp: "",
    status: "loading" as const,
    message: ""
  }));
};

// 检查是否可以查询（5秒限制）
const canQuery = computed(() => {
  if (lastQueryTime.value === 0) return true;
  const now = Date.now();
  const elapsed = now - lastQueryTime.value;
  return elapsed >= 5000;
});

// 倒计时
const startCountdown = () => {
  // 清除之前的定时器
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  // 禁用按钮
  canQueryNow.value = false;

  const updateRemaining = () => {
    const now = Date.now();
    const elapsed = now - lastQueryTime.value;
    const remaining = 5000 - elapsed;

    if (remaining <= 0) {
      remainingTime.value = 0;
      canQueryNow.value = true; // 恢复按钮可用状态
      if (countdownTimer !== null) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
      return;
    }

    remainingTime.value = Math.ceil(remaining / 1000);
  };

  // 立即执行一次
  updateRemaining();

  // 每100ms更新一次
  countdownTimer = window.setInterval(updateRemaining, 100);
};

// 查询 SVID 数据
const querySvidData = async () => {
  if (!canQueryNow.value) {
    ElMessage.warning(
      t("sensorManage.svidViewer.message.wait", { time: remainingTime.value })
    );
    return;
  }

  if (currentStationSvidList.value.length === 0) {
    ElMessage.warning(
      t("sensorManage.svidViewer.message.noConfig", {
        station: currentStation.value
      })
    );
    return;
  }

  loading.value = true;
  lastQueryTime.value = Date.now();
  startCountdown();

  try {
    // TODO: 调用实际接口获取 SVID 数据
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟数据 - 每个 SVID 只返回一个数值
    svidDataList.value = currentStationSvidList.value.map(item => {
      if (item.svid === "NA") {
        return {
          svid: item.svid,
          channel: item.channel,
          value: null,
          timestamp: "",
          status: "error" as const,
          message: "未设置 SVID"
        };
      }

      const isSuccess = Math.random() > 0.2;
      return {
        svid: item.svid,
        channel: item.channel,
        value: isSuccess ? (Math.random() * 100).toFixed(2) : null, // 只返回一个数值
        timestamp: new Date().toLocaleString("zh-CN"),
        status: isSuccess ? "success" : "error",
        message: isSuccess ? "" : "数据获取失败"
      };
    });

    ElMessage.success(
      t("sensorManage.svidViewer.message.querySuccess", {
        station: currentStation.value
      })
    );
  } catch (error) {
    console.error("查询失败:", error);
    ElMessage.error(
      t("sensorManage.svidViewer.message.queryError") +
        "：" +
        (error as Error).message
    );
    svidDataList.value = svidDataList.value.map(item => ({
      ...item,
      status: "error",
      message: "查询失败"
    }));
  } finally {
    loading.value = false;
  }
};

// 切换 Station 时重新初始化数据并重置查询状态
watch(currentStation, () => {
  initDataList();
  // 清除倒计时
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  canQueryNow.value = true;
  remainingTime.value = 0;
});

// 初始化
initDataList();

// 组件卸载时清除定时器
const cleanup = () => {
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

onBeforeUnmount(() => {
  cleanup();
});

defineExpose({ cleanup });
</script>

<template>
  <div class="svid-data-viewer">
    <div class="viewer-header">
      <div class="header-left">
        <h3>{{ sensorName }} - {{ t("sensorManage.svidViewer.title") }}</h3>
        <div class="station-info">
          <el-tag type="primary"
            >{{ t("sensorManage.svidViewer.totalStations") }}:
            {{ stationNo }}</el-tag
          >
          <el-tag type="info" class="ml-2">
            {{ t("sensorManage.svidViewer.currentStationCount") }}:
            {{ currentStationSvidList.length }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-select
          v-model="currentStation"
          :placeholder="t('sensorManage.svidViewer.selectStation')"
          style="width: 150px; margin-right: 12px"
        >
          <el-option
            v-for="option in stationOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-button
          type="primary"
          :icon="Refresh"
          :loading="loading"
          :disabled="!canQueryNow"
          @click="querySvidData"
        >
          {{
            canQueryNow
              ? t("sensorManage.svidViewer.queryBtn")
              : t("sensorManage.svidViewer.waitBtn", { time: remainingTime })
          }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="currentStationSvidList.length === 0"
      type="warning"
      :closable="false"
      show-icon
    >
      {{
        t("sensorManage.svidViewer.message.noConfig", {
          station: currentStation
        })
      }}
    </el-alert>

    <div v-else class="data-list">
      <el-table :data="svidDataList" border stripe>
        <el-table-column
          type="index"
          :label="t('sensorManage.svidViewer.table.index')"
          width="60"
          align="center"
        />
        <el-table-column
          prop="channel"
          :label="t('sensorManage.svidViewer.table.channel')"
          width="150"
        >
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.channel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="svid"
          :label="t('sensorManage.svidViewer.table.svid')"
          width="180"
        >
          <template #default="{ row }">
            <span class="font-mono text-sm">{{ row.svid }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('sensorManage.svidViewer.table.status')"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag v-if="row.status === 'success'" type="success" size="small">
              {{ t("sensorManage.svidViewer.table.statusNormal") }}
            </el-tag>
            <el-tag
              v-else-if="row.status === 'error'"
              type="danger"
              size="small"
            >
              {{ t("sensorManage.svidViewer.table.statusError") }}
            </el-tag>
            <el-tag v-else type="info" size="small">{{
              t("sensorManage.svidViewer.table.statusLoading")
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :label="t('sensorManage.svidViewer.table.value')"
          min-width="150"
          align="center"
        >
          <template #default="{ row }">
            <div
              v-if="row.status === 'success' && row.value"
              class="data-value"
            >
              <el-tag type="warning" size="large" effect="dark">
                {{ row.value }}
              </el-tag>
            </div>
            <span v-else-if="row.status === 'error'" class="error-message">
              {{
                row.message || t("sensorManage.svidViewer.table.statusError")
              }}
            </span>
            <span v-else class="text-gray-400">{{
              t("sensorManage.svidViewer.table.noData")
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="timestamp"
          :label="t('sensorManage.svidViewer.table.updateTime')"
          width="180"
        />
      </el-table>
    </div>

    <el-alert type="info" :closable="false" show-icon class="mt-3">
      <template #title>
        <div class="text-xs">
          <p class="mb-1">
            <strong>{{ t("sensorManage.svidViewer.tips.title") }}</strong>
          </p>
          <ul class="pl-4 space-y-1">
            <li>
              •
              {{
                t("sensorManage.svidViewer.tips.currentView", {
                  current: currentStation,
                  total: stationNo
                })
              }}
            </li>
            <li>
              •
              {{
                t("sensorManage.svidViewer.tips.totalCount", {
                  count: currentStationSvidList.length
                })
              }}
            </li>
            <li>• {{ t("sensorManage.svidViewer.tips.rateLimit") }}</li>
            <li>• {{ t("sensorManage.svidViewer.tips.switchStation") }}</li>
            <li>• {{ t("sensorManage.svidViewer.tips.naSkip") }}</li>
          </ul>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<style scoped lang="scss">
.svid-data-viewer {
  padding: 12px;

  .viewer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--el-border-color);
    flex-wrap: wrap;
    gap: 12px;

    .header-left {
      flex: 1;
      min-width: 300px;

      h3 {
        margin: 0 0 8px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .station-info {
        display: flex;
        gap: 8px;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .data-list {
    margin-top: 16px;
  }

  .data-value {
    display: flex;
    justify-content: center;
    align-items: center;

    :deep(.el-tag) {
      font-size: 16px;
      font-weight: 600;
      padding: 8px 16px;
    }
  }

  .error-message {
    color: var(--el-color-danger);
    font-size: 12px;
  }

  .font-mono {
    font-family: "Courier New", monospace;
  }
}
</style>
