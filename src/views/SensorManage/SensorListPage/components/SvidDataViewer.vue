<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { Refresh } from "@element-plus/icons-vue";

interface SvidItem {
  channel: string;
  svid: string;
}

interface SvidData {
  svid: string;
  value: any;
  timestamp: string;
  status: "success" | "error" | "loading";
  message?: string;
}

const props = defineProps<{
  sensorName: string;
  svidList: SvidItem[];
}>();

const svidDataList = ref<SvidData[]>([]);
const loading = ref(false);
const lastQueryTime = ref(0);
const remainingTime = ref(0);
let countdownTimer: NodeJS.Timeout | null = null;

// 初始化数据列表
const initDataList = () => {
  svidDataList.value = props.svidList.map(item => ({
    svid: item.svid,
    value: null,
    timestamp: "",
    status: "loading",
    message: ""
  }));
};

// 检查是否可以查询（5秒限制）
const canQuery = computed(() => {
  const now = Date.now();
  const diff = now - lastQueryTime.value;
  return diff >= 5000;
});

// 倒计时
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }

  const updateRemaining = () => {
    const now = Date.now();
    const diff = 5000 - (now - lastQueryTime.value);
    remainingTime.value = Math.ceil(diff / 1000);

    if (remainingTime.value <= 0) {
      remainingTime.value = 0;
      if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
      }
    }
  };

  updateRemaining();
  countdownTimer = setInterval(updateRemaining, 100);
};

// 查询 SVID 数据
const querySvidData = async () => {
  if (!canQuery.value) {
    ElMessage.warning(`请等待 ${remainingTime.value} 秒后再查询`);
    return;
  }

  loading.value = true;
  lastQueryTime.value = Date.now();
  startCountdown();

  try {
    // TODO: 调用实际接口获取 SVID 数据
    // const responses = await Promise.all(
    //   props.svidList.map(item => getSvidData(item.svid))
    // );

    // 模拟接口调用
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟数据
    svidDataList.value = props.svidList.map(item => {
      const isSuccess = Math.random() > 0.2; // 80% 成功率
      return {
        svid: item.svid,
        value: isSuccess
          ? {
              temperature: (Math.random() * 100).toFixed(2),
              humidity: (Math.random() * 100).toFixed(2),
              pressure: (Math.random() * 1000).toFixed(2)
            }
          : null,
        timestamp: new Date().toLocaleString("zh-CN"),
        status: isSuccess ? "success" : "error",
        message: isSuccess ? "" : "数据获取失败"
      };
    });

    ElMessage.success("数据查询成功");
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

// 初始化
initDataList();

// 组件卸载时清除定时器
const cleanup = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

defineExpose({ cleanup });
</script>

<template>
  <div class="svid-data-viewer">
    <div class="viewer-header">
      <h3>{{ sensorName }} - SVID 数据</h3>
      <el-button
        type="primary"
        :icon="Refresh"
        :loading="loading"
        :disabled="!canQuery"
        @click="querySvidData"
      >
        {{ canQuery ? "查询数据" : `等待 ${remainingTime}s` }}
      </el-button>
    </div>

    <el-alert
      v-if="svidList.length === 0"
      type="warning"
      :closable="false"
      show-icon
    >
      该传感器没有配置 SVID 列表
    </el-alert>

    <div v-else class="data-list">
      <el-table :data="svidDataList" border stripe>
        <el-table-column prop="svid" label="SVID" width="150" />
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
        <el-table-column label="数据值" min-width="200">
          <template #default="{ row }">
            <div
              v-if="row.status === 'success' && row.value"
              class="data-value"
            >
              <el-descriptions :column="1" size="small" border>
                <el-descriptions-item
                  v-for="(value, key) in row.value"
                  :key="key"
                  :label="String(key)"
                >
                  <el-tag type="warning" size="small">{{ value }}</el-tag>
                </el-descriptions-item>
              </el-descriptions>
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
        <span class="text-xs">
          提示：为避免频繁查询，限制每5秒只能查询一次。数据为实时查询结果。
        </span>
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

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .data-list {
    margin-top: 16px;
  }

  .data-value {
    :deep(.el-descriptions__label) {
      width: 40%;
      background-color: var(--el-fill-color-lighter);
    }
  }

  .error-message {
    color: var(--el-color-danger);
    font-size: 12px;
  }
}
</style>
