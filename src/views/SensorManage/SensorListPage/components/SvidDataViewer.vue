<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";

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
  // 检查是否可以查询
  if (!canQueryNow.value) {
    ElMessage.warning(`请等待 ${remainingTime.value} 秒后再查询`);
    return;
  }

  if (currentStationSvidList.value.length === 0) {
    ElMessage.warning(`Station ${currentStation.value} 没有配置 SVID`);
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

    ElMessage.success(`Station ${currentStation.value} 数据查询成功`);
  } catch (error) {
    console.error("查询失败:", error);
    ElMessage.error("数据查询失败：" + (error as Error).message);
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
        <h3>{{ sensorName }} - SVID 数据</h3>
        <div class="station-info">
          <el-tag type="primary">总站点数: {{ stationNo }}</el-tag>
          <el-tag type="info" class="ml-2">
            当前站点 SVID 数: {{ currentStationSvidList.length }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-select
          v-model="currentStation"
          placeholder="选择站点"
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
          {{ canQueryNow ? "查询数据" : `等待 ${remainingTime}s` }}
        </el-button>
      </div>
    </div>

    <el-alert
      v-if="currentStationSvidList.length === 0"
      type="warning"
      :closable="false"
      show-icon
    >
      Station {{ currentStation }} 没有配置 SVID 列表
    </el-alert>

    <div v-else class="data-list">
      <el-table :data="svidDataList" border stripe>
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="channel" label="通道" width="150">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.channel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="svid" label="SVID" width="180">
          <template #default="{ row }">
            <span class="font-mono text-sm">{{ row.svid }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'success'" type="success" size="small">
              正常
            </el-tag>
            <el-tag
              v-else-if="row.status === 'error'"
              type="danger"
              size="small"
            >
              失败
            </el-tag>
            <el-tag v-else type="info" size="small">未查询</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="数据值" min-width="150" align="center">
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
              {{ row.message || "数据获取失败" }}
            </span>
            <span v-else class="text-gray-400">暂无数据</span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="更新时间" width="180" />
      </el-table>
    </div>

    <el-alert type="info" :closable="false" show-icon class="mt-3">
      <template #title>
        <div class="text-xs">
          <p class="mb-1">
            <strong>提示：</strong>
          </p>
          <ul class="pl-4 space-y-1">
            <li>
              • 当前查看
              <strong class="text-primary"
                >Station {{ currentStation }}/{{ stationNo }}</strong
              >
              的数据
            </li>
            <li>
              • 本站点共有
              <strong class="text-success">{{
                currentStationSvidList.length
              }}</strong>
              个 SVID
            </li>
            <li>• 限制每 5 秒只能查询一次，避免频繁查询</li>
            <li>• 切换站点会重新初始化数据，需要重新查询</li>
            <li>• SVID 值为 "NA" 的通道不会查询数据</li>
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
