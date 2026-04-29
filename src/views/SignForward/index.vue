<script setup lang="ts">
import { ref, computed } from "vue";
import { useSignForward } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Refresh from "~icons/ep/refresh";

defineOptions({
  name: "SignForwardPage"
});

const tableRef = ref();

const {
  signList,
  loading,
  columns,
  onSearch,
  dialogVisible,
  currentProclnsId,
  assignForm,
  assignFormRef,
  assignLoading,
  openAssignDialog,
  handleAssign,
  handleCancel
} = useSignForward();

/** 将字符串数组转换为表格所需的对象数组 */
const tableData = computed(() =>
  signList.value.map((proclnsId, index) => ({ proclnsId, index: index + 1 }))
);
</script>

<template>
  <div class="main">
    <PureTableBar title="待传签列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button :icon="useRenderIcon(Refresh)" @click="onSearch">
          刷新
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="tableData"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon('ri/send-plane-line')"
              @click="openAssignDialog(row.proclnsId)"
            >
              传签
            </el-button>
          </template>
        </pure-table>
      </template>
    </PureTableBar>

    <!-- 传签确认对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="传签确认"
      width="500px"
      draggable
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border class="mb-4">
        <el-descriptions-item label="流程单号">
          {{ currentProclnsId }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form
        ref="assignFormRef"
        :model="assignForm"
        label-width="90px"
        label-position="right"
      >
        <el-form-item
          label="副理账号"
          prop="toAccount"
          :rules="[{ required: true, message: '请输入副理账号', trigger: 'blur' }]"
        >
          <el-input
            v-model="assignForm.toAccount"
            placeholder="请输入副理账号"
            clearable
          />
        </el-form-item>
        <el-form-item label="传签备注" prop="remark">
          <el-input
            v-model="assignForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入传签备注（选填）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">取消</el-button>
        <el-button
          type="primary"
          :loading="assignLoading"
          @click="handleAssign"
        >
          确认传签
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
