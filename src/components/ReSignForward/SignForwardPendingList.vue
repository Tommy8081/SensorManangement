<script setup lang="ts">
import { onMounted, ref } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";
import Send from "~icons/ri/send-plane-line";
import { getSignOffList } from "@/api/signForward";
import { useUserStoreHook } from "@/store/modules/user";
import type { SignForwardItem } from "./types";

const emit = defineEmits<{
  (
    e: "view-detail",
    payload: { item: SignForwardItem; isHistory: false }
  ): void;
}>();

const list = ref<SignForwardItem[]>([]);
const loading = ref(false);
const total = ref(0);
const pageNo = ref(1);
const pageSize = ref(20);

const tableColumns: TableColumnList = [
  {
    label: "序号",
    type: "index",
    width: 70,
    fixed: "left"
  },
  {
    label: "ORDER NO",
    prop: "ORDER_NO",
    minWidth: 180
  },
  {
    label: "SUBMITTER",
    prop: "SUBMITTER",
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
    label: "ACTION",
    width: 120,
    fixed: "right",
    slot: "action"
  }
];

async function loadData() {
  loading.value = true;
  try {
    const userAccount = useUserStoreHook().username;
    const res = await getSignOffList({
      userAccount,
      pageNo: pageNo.value,
      pageSize: pageSize.value
    });
    const data = (res as any)?.data ?? res;
    list.value = Array.isArray(data?.list) ? data.list : [];
    total.value = Number(data?.total ?? 0);
  } catch {
    list.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page: number) {
  pageNo.value = page;
  loadData();
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  pageNo.value = 1;
  loadData();
}

onMounted(loadData);
</script>

<template>
  <PureTableBar title="待传签列表" :columns="tableColumns" @refresh="loadData">
    <template #buttons>
      <el-button :icon="useRenderIcon(Refresh)" @click="loadData"
        >刷新</el-button
      >
    </template>
    <template v-slot="{ size, dynamicColumns }">
      <pure-table
        align-whole="center"
        showOverflowTooltip
        table-layout="auto"
        :loading="loading"
        :size="size"
        adaptive
        :adaptiveConfig="{ offsetBottom: 148 }"
        :data="list"
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
        <template #action="{ row }">
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
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pageNo"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </template>
  </PureTableBar>
</template>

<style lang="scss" scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 0 4px;
  margin-top: 12px;
}
</style>
