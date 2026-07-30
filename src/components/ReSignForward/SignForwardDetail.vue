<script setup lang="ts">
import { computed, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Back from "~icons/ep/arrow-left";
import Check from "~icons/ep/check";
import Close from "~icons/ep/close";
import ChangeContentTable from "./components/ChangeContentTable.vue";
import JsonDiffViewer from "./components/JsonDiffViewer.vue";
import SignProgressTrack from "./components/SignProgressTrack.vue";
import SignDefaultFlow from "./components/SignDefaultFlow.vue";
import ActionReasonDialog from "./components/ActionReasonDialog.vue";
import type { ChangeContentDetail, SignForwardDetailData } from "./types";

const props = defineProps<{
  data: SignForwardDetailData | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "approve", reason: string): void;
  (e: "disapprove", reason: string): void;
  (e: "back"): void;
}>();

const dialogVisible = ref(false);
const dialogAction = ref<"approve" | "disapprove">("approve");

const parsedChangeContent = computed<ChangeContentDetail>(() => {
  const raw = props.data?.changeContent;
  if (!raw) {
    return {
      beforeValue: "",
      afterValue: "",
      description: "",
      modifier: "",
      modifyTime: ""
    };
  }
  if (typeof raw === "string") {
    try {
      const data = JSON.parse(raw);
      return {
        beforeValue: data.beforeValue ?? "",
        afterValue: data.afterValue ?? "",
        description: data.description ?? "",
        modifier: data.modifier ?? "",
        modifyTime: data.modifyTime ?? "",
        ...data
      };
    } catch {
      return {
        beforeValue: "",
        afterValue: raw,
        description: "",
        modifier: "",
        modifyTime: ""
      };
    }
  }
  return {
    beforeValue: raw.beforeValue ?? "",
    afterValue: raw.afterValue ?? "",
    description: raw.description ?? "",
    modifier: raw.modifier ?? "",
    modifyTime: raw.modifyTime ?? "",
    ...raw
  };
});

function openDialog(action: "approve" | "disapprove") {
  dialogAction.value = action;
  dialogVisible.value = true;
}

function handleConfirm(reason: string) {
  dialogVisible.value = false;
  if (dialogAction.value === "approve") {
    emit("approve", reason);
    return;
  }
  emit("disapprove", reason);
}
</script>

<template>
  <el-skeleton v-if="loading" :rows="10" animated class="sign-skeleton" />
  <div v-else-if="data" class="sign-detail-wrapper">
    <div class="sign-top">
      <el-button
        link
        :icon="useRenderIcon(Back)"
        class="back-btn"
        @click="emit('back')"
      />
      <span class="sign-number">{{ data.ORDER_NO }}</span>
    </div>

    <div class="sign-content">
      <div class="sign-left">
        <ChangeContentTable :content="parsedChangeContent" />
        <JsonDiffViewer
          class="mt-3"
          title="字段值 Diff 对比"
          :before="String(parsedChangeContent.beforeValue ?? '')"
          :after="String(parsedChangeContent.afterValue ?? '')"
        />
      </div>
      <div class="sign-right">
        <div class="sign-right-progress">
          <SignProgressTrack :nodes="data.signProgress || []" />
        </div>
        <div class="sign-right-flow">
          <SignDefaultFlow :flow="data.defaultFlow || []" />
        </div>
      </div>
    </div>

    <div class="sign-bottom">
      <template v-if="!data.isHistory">
        <el-button
          :icon="useRenderIcon(Close)"
          class="reject-btn"
          @click="openDialog('disapprove')"
        >
          Disapprove
        </el-button>
        <el-button
          :icon="useRenderIcon(Check)"
          type="primary"
          @click="openDialog('approve')"
        >
          Approve
        </el-button>
      </template>
    </div>

    <ActionReasonDialog
      v-model:visible="dialogVisible"
      :action="dialogAction"
      :loading="false"
      @confirm="handleConfirm"
    />
  </div>
  <el-empty v-else description="暂无详情数据" />
</template>

<style lang="scss" scoped>
.sign-skeleton {
  padding: 24px;
  background: #fff;
}

.sign-detail-wrapper {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: calc(100vh - 180px);
  min-height: 520px;
  max-height: calc(100vh - 180px);
  overflow: hidden;
  font-size: 15px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 6px rgb(0 0 0 / 8%);

  .sign-top {
    display: flex;
    gap: 10px;
    align-items: center;
    min-height: 52px;
    padding: 0 18px;
    border-bottom: 1px solid var(--el-border-color-light);

    .back-btn {
      font-size: 22px;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .sign-number {
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
  }

  .sign-content {
    display: flex;
    flex: 1;
    overflow: hidden;

    .sign-left {
      flex: 2;
      padding: 18px 22px;
      overflow-y: auto;
      border-right: 1px solid var(--el-border-color-light);
    }

    .sign-right {
      display: flex;
      flex: 1.03;
      flex-direction: column;
      margin-left: 12px;
      overflow: hidden;

      .sign-right-progress {
        flex: 1;
        padding: 16px 12px;
        overflow-y: auto;
        border-bottom: 1px solid var(--el-border-color-light);
      }

      .sign-right-flow {
        flex: 1;
        padding: 16px 12px;
        overflow-y: auto;
      }
    }
  }

  .sign-bottom {
    position: absolute;
    right: 18px;
    bottom: 24px;
    z-index: 2;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 0;
    border-top: 0;
    transform: none;

    :deep(.el-button) {
      min-width: 112px;
      height: 42px;
      padding: 0 20px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
    }

    :deep(.reject-btn) {
      color: #303133;
      background: #fff;
      border-color: #dcdfe6;

      &:hover,
      &:focus {
        color: #303133;
        background: #fff;
        border-color: #c0c4cc;
      }
    }
  }
}
</style>
