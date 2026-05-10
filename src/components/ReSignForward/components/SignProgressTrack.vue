<script setup lang="ts">
import dayjs from "dayjs";
import type { SignProgressNode } from "../types";

defineProps<{
  nodes: SignProgressNode[];
}>();

function nodeColor(status: SignProgressNode["status"]) {
  if (status === "done") return "#303133";
  if (status === "current") return "#67C23A";
  return "#C0C4CC";
}

function formatTime(time?: string) {
  if (!time) return "";
  const parsed = dayjs(time);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm") : time;
}
</script>

<template>
  <div class="track">
    <div class="track-title">签署进度</div>
    <el-timeline>
      <el-timeline-item
        v-for="node in nodes"
        :key="`${node.account}-${node.time || node.status}`"
        :color="nodeColor(node.status)"
      >
        <div class="track-node">
          <span class="node-name" :class="`status-${node.status}`">{{
            node.name
          }}</span>
          <span v-if="node.status === 'current'" class="node-tag">(当前)</span>
          <span v-if="node.time" class="node-time">{{
            formatTime(node.time)
          }}</span>
          <span v-if="node.remark" class="node-remark"
            >备注: {{ node.remark }}</span
          >
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style lang="scss" scoped>
.track-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.track-node {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;

  .node-name {
    color: var(--el-text-color-primary);

    &.status-done {
      color: #303133;
    }

    &.status-current {
      font-weight: 700;
      color: #67c23a;
    }

    &.status-pending {
      color: #c0c4cc;
    }
  }

  .node-time {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  .node-remark {
    width: 100%;
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}
</style>
