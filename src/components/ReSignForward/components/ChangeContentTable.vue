<script setup lang="ts">
import type { ChangeContentDetail } from "../types";

defineProps<{
  content: ChangeContentDetail;
}>();
</script>

<template>
  <el-descriptions title="变更内容对比" :column="1" border>
    <el-descriptions-item label="修改前值">
      {{ content.beforeValue || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="修改后值">
      <el-tag type="warning">{{ content.afterValue || "-" }}</el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="变更描述">
      {{ content.description || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="修改人">
      {{ content.modifier || "-" }}
    </el-descriptions-item>
    <el-descriptions-item label="申请时间">
      {{ content.modifyTime || "-" }}
    </el-descriptions-item>
  </el-descriptions>
</template>
