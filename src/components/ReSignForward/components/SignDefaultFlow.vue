<script setup lang="ts">
import type { SignFlowNode } from "../types";

defineProps<{
  flow: SignFlowNode[];
}>();
</script>

<template>
  <div class="default-flow">
    <div class="flow-title">默认传签流程</div>
    <div class="flow-timeline-wrap">
      <el-timeline>
        <el-timeline-item
          v-for="(node, index) in flow"
          :key="node.account"
          color="#67c23a"
        >
          <div class="flow-item">
            <el-tag size="small" type="info">{{ index + 1 }}</el-tag>
            <span class="flow-name">{{ node.name }}</span>
            <span v-if="node.role" class="flow-role">{{ node.role }}</span>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flow-title {
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 700;
  text-align: left;
  color: var(--el-text-color-primary);
}

.flow-timeline-wrap {
  display: flex;
  justify-content: flex-start;

  :deep(.el-timeline) {
    width: 100%;
    padding-left: 18px;
  }

  :deep(.el-timeline-item) {
    padding-bottom: 64px;
  }
}

.flow-item {
  display: flex;
  gap: 12px;
  align-items: center;
  min-height: 28px;

  .flow-name {
    font-size: 17px;
    color: var(--el-text-color-primary);
  }

  .flow-role {
    font-size: 15px;
    color: var(--el-text-color-regular);
  }
}
</style>
