<script setup lang="ts">
import { ref, nextTick } from "vue";
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
const activeTab = ref("pending");

function handleTabChange() {
  // 切换 Tab 后触发 resize，让 pure-table adaptive 重新计算高度
  nextTick(() => {
    window.dispatchEvent(new Event("resize"));
  });
}

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
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="待传签" name="pending">
        <SignForwardPendingList @view-detail="handleViewDetail" />
      </el-tab-pane>
      <el-tab-pane label="历史传签" name="history">
        <SignForwardHistoryList @view-detail="handleViewDetail" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
