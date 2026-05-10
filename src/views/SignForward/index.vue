<script setup lang="ts">
import { useRouter } from "vue-router";
import { SignForwardListPanel } from "@/components/ReSignForward";
import { useSignForwardList } from "./utils/hook";
import type { SignForwardViewDetailPayload } from "./utils/types";

defineOptions({
  name: "SignForwardPage"
});

const router = useRouter();

const {
  pendingList,
  historyList,
  pendingLoading,
  historyLoading,
  loadPending,
  loadHistory
} = useSignForwardList();

function handleViewDetail({ item, isHistory }: SignForwardViewDetailPayload) {
  router.push({
    path: "/sign/detail",
    query: {
      proclnsId: item.proclnsId,
      isHistory: isHistory ? "1" : "0"
    }
  });
}
</script>

<template>
  <div class="main">
    <SignForwardListPanel
      :pending-list="pendingList"
      :history-list="historyList"
      :pending-loading="pendingLoading"
      :history-loading="historyLoading"
      @view-detail="handleViewDetail"
      @refresh-pending="loadPending"
      @refresh-history="loadHistory"
    />
  </div>
</template>
