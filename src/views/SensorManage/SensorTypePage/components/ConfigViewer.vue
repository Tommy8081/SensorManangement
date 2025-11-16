<script setup lang="ts">
import { computed, ref } from "vue";
import { formatConfigForDisplay } from "../utils/iniParser";

const props = defineProps<{
  config: Record<string, any>;
  sensorType: string;
}>();

const formattedConfig = computed(() => formatConfigForDisplay(props.config));
const activeNames = ref<string | number | Array<string | number>>([]);
</script>

<template>
  <div class="config-viewer">
    <div class="config-header">
      <h3>{{ sensorType }} - 配置详情</h3>
    </div>
    <div class="config-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item
          v-for="item in formattedConfig"
          :key="item.key"
          :label="item.label"
        >
          <el-tag
            v-if="typeof item.value === 'boolean'"
            :type="item.value ? 'success' : 'info'"
          >
            {{ item.value ? "是" : "否" }}
          </el-tag>
          <el-tag v-else-if="typeof item.value === 'number'" type="warning">
            {{ item.value }}
          </el-tag>
          <span v-else>{{ item.value }}</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<style scoped lang="scss">
.config-viewer {
  padding: 12px;

  .config-header {
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

  .section-title {
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 14px;
  }
}

:deep(.el-descriptions__label) {
  width: 30%;
  background-color: var(--el-fill-color-light);
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
  height: 48px;
  line-height: 48px;
}
</style>
