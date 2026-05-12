<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SignForwardDetail } from "@/components/ReSignForward";
import { getSignOffDetail, actionSignForward } from "@/api/signForward";
import { useUserStoreHook } from "@/store/modules/user";
import { message } from "@/utils/message";
import type { SignForwardDetailData } from "@/components/ReSignForward/types";

defineOptions({
  name: "SignForwardDetail"
});

const route = useRoute();
const router = useRouter();
const proclnsId = route.query.proclnsId as string;
const isHistory = route.query.isHistory === "1";

const detailData = ref<SignForwardDetailData | null>(null);
const loading = ref(false);

async function loadDetail() {
  loading.value = true;
  try {
    const res = await getSignOffDetail({ proclnsId });
    const data = (res as any)?.data ?? res;
    detailData.value = {
      ...data,
      isHistory
    };
  } catch {
    message("获取详情失败", { type: "error" });
  } finally {
    loading.value = false;
  }
}

async function handleApprove(reason: string) {
  try {
    await actionSignForward({
      action: "Approve",
      fromAccount: useUserStoreHook().username,
      proclnsId,
      remark: reason,
      toAccount: ""
    });
    message("已同意传签", { type: "success" });
    router.back();
  } catch (e: any) {
    message("操作失败：" + (e?.message || String(e)), { type: "error" });
  }
}

async function handleDisapprove(reason: string) {
  try {
    await actionSignForward({
      action: "Disapprove",
      fromAccount: useUserStoreHook().username,
      proclnsId,
      remark: reason,
      toAccount: ""
    });
    message("已拒绝传签", { type: "success" });
    router.back();
  } catch (e: any) {
    message("操作失败：" + (e?.message || String(e)), { type: "error" });
  }
}

onMounted(loadDetail);
</script>

<template>
  <SignForwardDetail
    :data="detailData"
    :loading="loading"
    @approve="handleApprove"
    @disapprove="handleDisapprove"
    @back="router.back()"
  />
</template>
