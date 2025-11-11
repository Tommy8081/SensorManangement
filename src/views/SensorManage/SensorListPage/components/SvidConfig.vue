<script setup lang="ts">
import { ref, watch, computed, h } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Download, Upload, Plus, Delete } from "@element-plus/icons-vue";

interface SvidItem {
  channel: string;
  svid: string;
  station?: number; // 添加站点标识
}

const props = defineProps<{
  modelValue: SvidItem[];
  stationNo?: number; // 站点数量
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: SvidItem[]): void;
}>();

// 当前选中的 Station
const currentStation = ref(1);

// 总 Station 数量
const totalStations = computed(() => {
  return props.stationNo || 1;
});

// Station 选项列表
const stationOptions = computed(() => {
  return Array.from({ length: totalStations.value }, (_, i) => ({
    label: `Station ${i + 1}`,
    value: i + 1
  }));
});

// 每个 Station 的基础通道数（默认8个）
const channelsPerStation = 8;

// 获取所有 Station 的 SVID 数据（按 Station 分组）
const allStationsSvids = computed(() => {
  const result: Map<number, SvidItem[]> = new Map();

  // 初始化所有 Station
  for (let station = 1; station <= totalStations.value; station++) {
    result.set(station, []);
  }

  // 如果有现有数据，按 Station 分组
  if (props.modelValue && props.modelValue.length > 0) {
    props.modelValue.forEach(item => {
      const station = item.station || 1;
      if (!result.has(station)) {
        result.set(station, []);
      }
      result.get(station)!.push(item);
    });
  }

  // 确保每个 Station 至少有 8 个通道
  result.forEach((items, station) => {
    while (items.length < channelsPerStation) {
      items.push({
        channel: `Channel${items.length + 1}`,
        svid: "",
        station
      });
    }
  });

  return result;
});

// 当前 Station 的 SVID 列表
const currentStationSvids = computed({
  get: () => {
    return allStationsSvids.value.get(currentStation.value) || [];
  },
  set: (newValue: SvidItem[]) => {
    const allData: SvidItem[] = [];

    // 收集所有 Station 的数据
    allStationsSvids.value.forEach((items, station) => {
      if (station === currentStation.value) {
        allData.push(...newValue.map(item => ({ ...item, station })));
      } else {
        allData.push(...items);
      }
    });

    emit("update:modelValue", allData);
  }
});

// 本地编辑列表
const svidList = ref<SvidItem[]>([...currentStationSvids.value]);

// 监听 Station 切换
watch(currentStation, () => {
  svidList.value = [...currentStationSvids.value];
});

// 监听列表变化，同步到父组件
watch(
  svidList,
  newVal => {
    currentStationSvids.value = newVal;
  },
  { deep: true }
);

// 添加新的 SVID 项
const addSvidItem = () => {
  const nextChannel = svidList.value.length + 1;
  svidList.value.push({
    channel: `Channel${nextChannel}`,
    svid: "",
    station: currentStation.value
  });
};

// 删除 SVID 项（至少保留8个）
const removeSvidItem = (index: number) => {
  if (svidList.value.length <= channelsPerStation) {
    ElMessage.warning(`至少需要保留${channelsPerStation}个通道配置`);
    return;
  }
  svidList.value.splice(index, 1);
};

// 批量生成所有 Station 的 SVID
const batchGenerateAllStations = () => {
  ElMessageBox({
    title: "批量生成 SVID",
    message: h("div", { style: "line-height: 1.8" }, [
      h("p", { class: "mb-2" }, "将为所有站点生成完整的 SVID 配置："),
      h("ul", { class: "list-disc pl-6 text-sm space-y-1" }, [
        h("li", [
          "总站点数: ",
          h(
            "span",
            { class: "text-primary font-semibold" },
            `${totalStations.value}`
          )
        ]),
        h("li", [
          "每站通道数: ",
          h(
            "span",
            { class: "text-primary font-semibold" },
            `${channelsPerStation}`
          )
        ]),
        h("li", [
          "总配置数: ",
          h(
            "span",
            { class: "text-success font-semibold" },
            `${totalStations.value * channelsPerStation}`
          )
        ])
      ]),
      h(
        "p",
        { class: "text-xs text-gray-500 mt-3" },
        "格式: Channel{N}_S{站点} = SVID{N:03d}_S{站点}"
      ),
      h(
        "p",
        { class: "text-xs text-warning mt-2" },
        "⚠️ 此操作将覆盖所有现有配置"
      )
    ]),
    showCancelButton: true,
    confirmButtonText: "确定生成",
    cancelButtonText: "取消",
    type: "warning",
    draggable: true
  })
    .then(() => {
      generateAllStationsSvids();
    })
    .catch(() => {
      // 用户取消
    });
};

// 生成所有 Station 的 SVID
const generateAllStationsSvids = () => {
  const allSvids: SvidItem[] = [];

  for (let station = 1; station <= totalStations.value; station++) {
    for (let channel = 1; channel <= channelsPerStation; channel++) {
      allSvids.push({
        channel: `Channel${channel}_S${station}`,
        svid: `SVID${String(channel).padStart(3, "0")}_S${station}`,
        station
      });
    }
  }

  emit("update:modelValue", allSvids);
  svidList.value = [...currentStationSvids.value];

  ElMessage.success({
    message: `成功生成 ${allSvids.length} 条 SVID 配置`,
    duration: 3000
  });
};

// 复制到其他 Station
const copyToOtherStations = () => {
  if (svidList.value.length === 0) {
    ElMessage.warning("当前站点没有配置数据");
    return;
  }

  ElMessageBox({
    title: "复制到其他站点",
    message: h("div", { style: "line-height: 1.8" }, [
      h(
        "p",
        { class: "mb-2" },
        `将 Station ${currentStation.value} 的配置复制到其他所有站点：`
      ),
      h("p", { class: "text-sm" }, [
        "当前配置通道数: ",
        h(
          "span",
          { class: "text-primary font-semibold" },
          `${svidList.value.length}`
        )
      ]),
      h("p", { class: "text-sm mt-2" }, [
        "将复制到: ",
        h(
          "span",
          { class: "text-success font-semibold" },
          `${totalStations.value - 1} 个其他站点`
        )
      ]),
      h(
        "p",
        { class: "text-xs text-warning mt-3" },
        "⚠️ 此操作将覆盖其他站点的现有配置"
      )
    ]),
    showCancelButton: true,
    confirmButtonText: "确定复制",
    cancelButtonText: "取消",
    type: "warning",
    draggable: true
  })
    .then(() => {
      const allSvids: SvidItem[] = [];

      // 复制当前站点配置到所有站点
      for (let station = 1; station <= totalStations.value; station++) {
        svidList.value.forEach((item, index) => {
          // 提取基础 SVID（去除站点后缀）
          const baseSvid = item.svid.replace(/_S\d+$/, "");
          const baseChannel = item.channel.replace(/_S\d+$/, "");

          allSvids.push({
            channel: station === 1 ? baseChannel : `${baseChannel}_S${station}`,
            svid:
              baseSvid === "NA" || !baseSvid
                ? "NA"
                : station === 1
                  ? baseSvid
                  : `${baseSvid}_S${station}`,
            station
          });
        });
      }

      emit("update:modelValue", allSvids);
      ElMessage.success(`配置已复制到所有 ${totalStations.value} 个站点`);
    })
    .catch(() => {
      // 用户取消
    });
};

// 下载当前 Station 的模板
const downloadTemplate = () => {
  const template = svidList.value.map((item, index) => ({
    Channel: item.channel,
    SVID:
      item.svid ||
      `SVID${String(index + 1).padStart(3, "0")}_S${currentStation.value}`
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
  link.setAttribute(
    "download",
    `SVID_Template_Station${currentStation.value}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  ElMessage.success(`Station ${currentStation.value} 模板文件下载成功`);
};

// 导入文件（仅导入当前 Station）
const handleFileUpload = (file: File) => {
  const reader = new FileReader();

  reader.onload = (e: ProgressEvent<FileReader>) => {
    try {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());

      if (lines.length < 2) {
        throw new Error("文件内容为空或格式不正确");
      }

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

        const channelMatch = channel.match(/Channel(\d+)/i);
        const channelNum = channelMatch ? parseInt(channelMatch[1]) : i + 1;

        if (channelNum > maxChannelNum) {
          maxChannelNum = channelNum;
        }

        const svidValue = svid && svid.trim() !== "" ? svid : "NA";

        importedDataMap.set(channelNum, {
          channel: `Channel${channelNum}`,
          svid: svidValue,
          station: currentStation.value
        });
      }

      const minChannels = Math.max(maxChannelNum, channelsPerStation);
      const importedData: SvidItem[] = [];

      for (let i = 1; i <= minChannels; i++) {
        if (importedDataMap.has(i)) {
          importedData.push(importedDataMap.get(i)!);
        } else {
          importedData.push({
            channel: `Channel${i}`,
            svid: "NA",
            station: currentStation.value
          });
        }
      }

      svidList.value = importedData;

      ElMessage.success({
        message: `Station ${currentStation.value} 成功导入 ${importedData.length} 条配置`,
        duration: 3000
      });

      const emptyCount = importedData.filter(item => item.svid === "NA").length;
      if (emptyCount > 0) {
        ElMessage.info({
          message: `其中 ${emptyCount} 个通道的 SVID 值为空，已设置为 "NA"`,
          duration: 4000
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
  return false;
};

// 清空当前 Station
const clearCurrentStation = () => {
  svidList.value = Array.from({ length: channelsPerStation }, (_, i) => ({
    channel: `Channel${i + 1}`,
    svid: "",
    station: currentStation.value
  }));
  ElMessage.success(`已清空 Station ${currentStation.value} 的配置`);
};
</script>

<template>
  <div class="svid-config">
    <!-- Station 选择和批量操作栏 -->
    <div class="station-header">
      <div class="station-selector">
        <span class="label">选择站点:</span>
        <el-select
          v-model="currentStation"
          placeholder="选择站点"
          style="width: 150px"
        >
          <el-option
            v-for="option in stationOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-tag type="info" class="ml-2">
          {{ currentStation }} / {{ totalStations }}
        </el-tag>
      </div>

      <div v-if="totalStations > 1" class="batch-actions">
        <el-button
          type="primary"
          size="small"
          @click="batchGenerateAllStations"
        >
          批量生成所有站点
        </el-button>
        <el-button type="success" size="small" @click="copyToOtherStations">
          复制到其他站点
        </el-button>
      </div>
    </div>

    <!-- 操作按钮栏 -->
    <div class="action-bar">
      <el-space>
        <el-upload
          :before-upload="handleFileUpload"
          :show-file-list="false"
          accept=".csv"
        >
          <el-button type="primary" :icon="Upload" size="small">
            导入当前站点
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
        <el-button type="warning" size="small" @click="clearCurrentStation">
          清空当前站点
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
            :readonly="index < channelsPerStation"
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
            v-if="index >= channelsPerStation"
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
            <li>
              • 当前编辑
              <strong class="text-primary">Station {{ currentStation }}</strong>
              的配置
            </li>
            <li>• 每个站点默认 {{ channelsPerStation }} 个通道，可添加更多</li>
            <li>• 支持导入 CSV 文件（仅导入当前站点）</li>
            <li v-if="totalStations > 1">
              • <strong class="text-success">批量生成</strong>：为所有
              {{ totalStations }} 个站点自动生成配置
            </li>
            <li v-if="totalStations > 1">
              •
              <strong class="text-success">复制功能</strong
              >：将当前站点配置复制到其他站点
            </li>
            <li>• 切换站点会自动保存当前配置</li>
          </ul>
        </div>
      </template>
    </el-alert>
  </div>
</template>

<style scoped lang="scss">
.svid-config {
  .station-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
    background-color: var(--el-fill-color-lighter);
    border-radius: 4px;
    flex-wrap: wrap;
    gap: 12px;

    .station-selector {
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }

    .batch-actions {
      display: flex;
      gap: 8px;
    }
  }

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
