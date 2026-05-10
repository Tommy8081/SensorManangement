<script setup lang="ts">
import { ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import View from "~icons/ep/view";
import Send from "~icons/ri/send-plane-line";
import type { SignForwardItem } from "./types";

defineProps<{
  pendingList: SignForwardItem[];
  historyList: SignForwardItem[];
  pendingLoading: boolean;
  historyLoading: boolean;
}>();

const emit = defineEmits<{
  (
    e: "view-detail",
    payload: { item: SignForwardItem; isHistory: boolean }
  ): void;
  (e: "refresh-pending"): void;
  (e: "refresh-history"): void;
}>();

const activeTab = ref("pending");

const tableColumns: TableColumnList = [
  {
    label: "序号",
    type: "index",
    width: 70,
    fixed: "left"
  },
  {
    label: "申请单号",
    prop: "proclnsId",
    minWidth: 180
  },
  {
    label: "申请人",
    prop: "applicant",
    minWidth: 140
  },
  {
    label: "变更内容",
    prop: "changeContent",
    minWidth: 120,
    slot: "changeContent"
  },
  {
    label: "申请时间",
    prop: "createTime",
    minWidth: 180
  },
  {
    label: "操作",
    width: 120,
    fixed: "right",
    slot: "operation"
  }
];

function handleTabChange(name: string | number) {
  if (name === "pending") {
    emit("refresh-pending");
    return;
  }
  emit("refresh-history");
}
</script>

<template>
  <el-tabs v-model="activeTab" @tab-change="handleTabChange">
    <el-tab-pane label="待传签" name="pending">
      <PureTableBar
        title="待传签列表"
        :columns="tableColumns"
        @refresh="emit('refresh-pending')"
      >
        <template #buttons>
          <el-button
            :icon="useRenderIcon(Refresh)"
            @click="emit('refresh-pending')"
            >刷新</el-button
          >
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="pendingLoading"
            :size="size"
            adaptive
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="pendingList"
            :columns="dynamicColumns"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
          >
            <template #changeContent="{ row }">
              <el-button
                link
                type="primary"
                @click="emit('view-detail', { item: row, isHistory: false })"
              >
                查看变更
              </el-button>
            </template>
            <template #operation="{ row }">
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(Send)"
                @click="emit('view-detail', { item: row, isHistory: false })"
              >
                传签
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </el-tab-pane>

    <el-tab-pane label="历史传签" name="history">
      <PureTableBar
        title="历史传签记录"
        :columns="tableColumns"
        @refresh="emit('refresh-history')"
      >
        <template #buttons>
          <el-button
            :icon="useRenderIcon(Refresh)"
            @click="emit('refresh-history')"
            >刷新</el-button
          >
        </template>
        <template v-slot="{ size, dynamicColumns }">
          <pure-table
            align-whole="center"
            showOverflowTooltip
            table-layout="auto"
            :loading="historyLoading"
            :size="size"
            adaptive
            :adaptiveConfig="{ offsetBottom: 108 }"
            :data="historyList"
            :columns="dynamicColumns"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
          >
            <template #changeContent="{ row }">
              <el-button
                link
                type="primary"
                @click="emit('view-detail', { item: row, isHistory: true })"
              >
                查看变更
              </el-button>
            </template>
            <template #operation="{ row }">
              <el-button
                class="reset-margin"
                link
                type="primary"
                :size="size"
                :icon="useRenderIcon(View)"
                @click="emit('view-detail', { item: row, isHistory: true })"
              >
                查看详情
              </el-button>
            </template>
          </pure-table>
        </template>
      </PureTableBar>
    </el-tab-pane>
  </el-tabs>
</template>

<style lang="scss" scoped>
:deep(.el-tabs__content) {
  min-height: 520px;
}
</style>
