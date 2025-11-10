<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Download, Upload, Plus, Delete } from "@element-plus/icons-vue";

interface SvidItem {
  channel: string;
  svid: string;
}

const props = defineProps<{
  modelValue: SvidItem[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: SvidItem[]): void;
}>();

// 初始化列表，确保至少有8个默认值
const initSvidList = () => {
  if (props.modelValue && props.modelValue.length > 0) {
    // 如果有传入值且长度大于等于8，直接使用
    if (props.modelValue.length >= 8) {
      return props.modelValue;
    }
    // 如果少于8个，补充到8个
    const result = [...props.modelValue];
    while (result.length < 8) {
      result.push({
        channel: `Channel${result.length + 1}`,
        svid: ""
      });
    }
    return result;
  }
  // 没有传入值，创建默认的8个
  return Array.from({ length: 8 }, (_, i) => ({
    channel: `Channel${i + 1}`,
    svid: ""
  }));
};

const svidList = ref<SvidItem[]>(initSvidList());

watch(
  svidList,
  newVal => {
    emit("update:modelValue", newVal);
  },
  { deep: true }
);

// 添加新的 SVID 项
const addSvidItem = () => {
  const nextChannel = svidList.value.length + 1;
  svidList.value.push({
    channel: `Channel${nextChannel}`,
    svid: ""
  });
};

// 删除 SVID 项（至少保留8个）
const removeSvidItem = (index: number) => {
  if (svidList.value.length <= 8) {
    ElMessage.warning("至少需要保留8个通道配置");
    return;
  }
  svidList.value.splice(index, 1);
};

// 下载模板文件
const downloadTemplate = () => {
  const template = svidList.value.map((item, index) => ({
    Channel: item.channel,
    SVID: item.svid || `SVID_${index + 1}_Example`
  }));

  const csvContent = [
    "Channel,SVID",
    ...template.map(item => `${item.Channel},${item.SVID}`)
  ].join("\n");

  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;"
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "SVID_Template.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  ElMessage.success("模板文件下载成功");
};

// 导入文件
const handleFileUpload = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    try {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error("文件内容为空或格式不正确");
      }

      // 跳过表头
      const dataLines = lines.slice(1);
      const importedDataMap = new Map<number, SvidItem>();
      let maxChannelNum = 0;

      for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (!line) continue;

        const [channel, svid] = line.split(",").map(s => s.trim());

        if (!channel) {
          throw new Error(`第 ${i + 2} 行的通道名称不能为空`);
        }

        // 提取通道编号
        const channelMatch = channel.match(/Channel(\d+)/i);
        const channelNum = channelMatch ? parseInt(channelMatch[1]) : i + 1;

        // 更新最大通道编号
        if (channelNum > maxChannelNum) {
          maxChannelNum = channelNum;
        }

        // 处理空值：如果 SVID 为空，设置为 "NA"
        const svidValue = svid && svid.trim() !== "" ? svid : "NA";

        importedDataMap.set(channelNum, {
          channel: `Channel${channelNum}`,
          svid: svidValue
        });
      }

      // 确保至少有8个通道
      const minChannels = Math.max(maxChannelNum, 8);

      // 填充完整的通道列表，补全缺失的通道
      const importedData: SvidItem[] = [];
      for (let i = 1; i <= minChannels; i++) {
        if (importedDataMap.has(i)) {
          importedData.push(importedDataMap.get(i)!);
        } else {
          // 补充缺失的通道，SVID 设置为 "NA"
          importedData.push({
            channel: `Channel${i}`,
            svid: "NA"
          });
        }
      }

      if (importedData.length === 0) {
        throw new Error("没有有效的数据");
      }

      svidList.value = importedData;

      ElMessage.success({
        message: `成功导入 ${importedData.length} 条 SVID 配置`,
        duration: 3000,
        showClose: true
      });

      // 显示详细信息
      const emptyCount = importedData.filter(item => item.svid === "NA").length;
      if (emptyCount > 0) {
        ElMessage.info({
          message: `其中 ${emptyCount} 个通道的 SVID 值为空，已设置为 "NA"`,
          duration: 4000,
          showClose: true
        });
      }
    } catch (error) {
      console.error("导入失败:", error);
      ElMessage.error(`导入失败: ${(error as Error).message}`);
    }
  };

  reader.onerror = () => {
    ElMessage.error("文件读取失败");
  };

  reader.readAsText(file);
  return false; // 阻止自动上传
};

// 清空所有 SVID
const clearAllSvid = () => {
  svidList.value = Array.from({ length: 8 }, (_, i) => ({
    channel: `Channel${i + 1}`,
    svid: ""
  }));
  ElMessage.success("已清空所有 SVID 配置");
};
</script>

<template>
  <div class="svid-config">
    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <el-space>
        <el-upload
          :before-upload="handleFileUpload"
          :show-file-list="false"
          accept=".csv"
        >
          <el-button type="primary" :icon="Upload" size="small">
            导入文件
          </el-button>
        </el-upload>
        <el-button
          type="success"
          :icon="Download"
          size="small"
          @click="downloadTemplate"
        >
          下载模板
        </el-button>
        <el-button type="warning" size="small" @click="clearAllSvid">
          清空配置
        </el-button>
        <el-button type="info" :icon="Plus" size="small" @click="addSvidItem">
          添加通道
        </el-button>
      </el-space>
    </div>

    <!-- SVID 列表 -->
    <div class="svid-list">
      <el-row
        v-for="(item, index) in svidList"
        :key="index"
        :gutter="10"
        class="svid-item"
      >
        <el-col :span="6">
          <el-input
            v-model="item.channel"
            placeholder="通道名称"
            :readonly="index < 8"
          >
            <template #prepend>
              <span class="channel-label">{{ index + 1 }}</span>
            </template>
          </el-input>
        </el-col>
        <el-col :span="16">
          <el-input v-model="item.svid" placeholder="请输入 SVID 值" clearable>
            <template #prepend>SVID</template>
            <template v-if="item.svid === 'NA'" #suffix>
              <el-tag type="info" size="small">未设置</el-tag>
            </template>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button
            v-if="index >= 8"
            type="danger"
            :icon="Delete"
            circle
            size="small"
            @click="removeSvidItem(index)"
          />
        </el-col>
      </el-row>
    </div>

    <!-- 提示信息 -->
    <el-alert type="info" :closable="false" show-icon class="mt-3">
      <template #title>
        <div class="text-xs">
          <p class="font-semibold mb-2">使用说明：</p>
          <ul class="pl-4 space-y-1">
            <li>• 默认提供 8 个通道配置，可根据需要添加更多通道</li>
            <li>• 支持导入 CSV 文件批量配置（格式：Channel,SVID）</li>
            <li>
              • <strong>导入时会自动补全缺失的通道</strong>，并将空值设置为 "NA"
            </li>
            <li>
              • 例如：导入 Channel1,Channel3,Channel5 会自动补充
              Channel2,Channel4...
            </li>
            <li>• 可下载模板文件作为导入参考</li>
            <li>• 前 8 个通道名称不可修改，额外添加的通道可自定义名称</li>
          </ul>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<style scoped lang="scss">
.svid-config {
  .action-bar {
    margin-bottom: 16px;
    padding: 12px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
  }

  .svid-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    background-color: var(--el-bg-color);

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--el-border-color);
      border-radius: 3px;
    }

    .svid-item {
      margin-bottom: 12px;
      padding: 8px;
      background-color: var(--el-fill-color-lighter);
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background-color: var(--el-fill-color-light);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .channel-label {
        display: inline-block;
        min-width: 20px;
        text-align: center;
        font-weight: 500;
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
