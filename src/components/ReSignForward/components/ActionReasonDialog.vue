<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { FormInstance } from "element-plus";

const props = defineProps<{
  visible: boolean;
  action: "approve" | "disapprove";
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: "update:visible", val: boolean): void;
  (e: "confirm", reason: string): void;
}>();

const formRef = ref<FormInstance>();
const formState = reactive({ reason: "" });

const dialogTitle = computed(() =>
  props.action === "approve" ? "确认同意传签" : "确认拒绝传签"
);

function closeDialog() {
  emit("update:visible", false);
}

function handleClosed() {
  formState.reason = "";
  formRef.value?.clearValidate();
}

function handleConfirm() {
  formRef.value?.validate(valid => {
    if (!valid) return;
    emit("confirm", formState.reason);
  });
}

watch(
  () => props.visible,
  val => {
    if (!val) handleClosed();
  }
);
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="560px"
    align-center
    draggable
    :close-on-click-modal="false"
    @update:model-value="emit('update:visible', $event)"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="formState" label-width="80px">
      <el-form-item
        label="处理意见"
        prop="reason"
        :rules="[
          { required: true, message: '请输入处理意见', trigger: 'blur' }
        ]"
      >
        <el-input
          v-model="formState.reason"
          type="textarea"
          :rows="4"
          placeholder="请输入处理意见"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button class="dialog-btn cancel-btn" @click="closeDialog"
        >取消</el-button
      >
      <el-button
        class="dialog-btn confirm-btn"
        type="primary"
        :loading="loading"
        @click="handleConfirm"
      >
        确认
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-btn {
  min-width: 112px;
  height: 42px;
  padding: 0 20px;
  font-size: 15px;
  border-radius: 8px;
  font-weight: 600;
}

.cancel-btn {
  background: #fff;
  border-color: #dcdfe6;
  color: #303133;

  &:hover,
  &:focus {
    background: #fff;
    border-color: #c0c4cc;
    color: #303133;
  }
}
</style>
