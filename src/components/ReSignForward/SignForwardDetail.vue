<script setup lang="ts">
import { computed, ref } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Back from "~icons/ep/arrow-left";
import Check from "~icons/ep/check";
import Close from "~icons/ep/close";
import ChangeContentTable from "./components/ChangeContentTable.vue";
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
      <el-button link :icon="useRenderIcon(Back)" @click="emit('back')"
        >返回</el-button
      >
      <span class="sign-number">传签单号: {{ data.proclnsId }}</span>
    </div>

    <div class="sign-content">
      <div class="sign-left">
        <ChangeContentTable :content="parsedChangeContent" />
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
          type="danger"
          plain
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
}

.sign-detail-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 600px;

  .sign-top {
    display: flex;
    gap: 8px;
    align-items: center;
    height: 10%;
    min-height: 60px;
    padding: 0 24px;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);

    .sign-number {
      font-size: 16px;
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
      padding: 20px 24px;
      overflow-y: auto;
      border-right: 1px solid var(--el-border-color-light);
    }

    .sign-right {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;

      .sign-right-progress {
        flex: 1;
        padding: 20px 16px;
        overflow-y: auto;
        border-bottom: 1px solid var(--el-border-color-light);
      }

      .sign-right-flow {
        flex: 1;
        padding: 20px 16px;
        overflow-y: auto;
      }
    }
  }

  .sign-bottom {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 12px 24px;
    background: var(--el-bg-color);
    border-top: 1px solid var(--el-border-color-light);
  }
}
</style>
