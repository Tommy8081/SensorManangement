<script setup lang="ts">
import type { SignFlowNode } from "../types";

defineProps<{
  flow: SignFlowNode[];
}>();
</script>

<template>
  <div class="default-flow">
    <div class="flow-title">默认传签流程</div>
    <div v-for="(node, index) in flow" :key="node.account" class="flow-item">
      <el-tag size="small" type="info">{{ index + 1 }}</el-tag>
      <span class="flow-name">{{ node.name }}</span>
      <span v-if="node.role" class="flow-role">{{ node.role }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flow-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.flow-item {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 0;

  .flow-name {
    color: var(--el-text-color-primary);
  }

  .flow-role {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}
</style>
