<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  SignForwardPendingList,
  SignForwardHistoryList
} from "@/components/ReSignForward";
import type { SignForwardItem } from "@/components/ReSignForward/types";

defineOptions({
  name: "SignForwardPage"
});

const router = useRouter();

function handleViewDetail({
  item,
  isHistory
}: {
  item: SignForwardItem;
  isHistory: boolean;
}) {
  router.push({
    path: "/sign/detail",
    query: {
      ORDER_NO: item.ORDER_NO,
      isHistory: isHistory ? "1" : "0"
    }
  });
}
</script>

<template>
  <div class="main">
    <el-tabs>
      <el-tab-pane label="待传签" name="pending">
        <SignForwardPendingList @view-detail="handleViewDetail" />
      </el-tab-pane>
      <el-tab-pane label="历史传签" name="history">
        <SignForwardHistoryList @view-detail="handleViewDetail" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
