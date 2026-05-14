# JsonDiffViewer

以字段维度展示两个 JSON 值之间的差异，类似 Git diff 风格，但展示的是字段内容而非原始 JSON 字符串。

## Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `beforeValue` | `string \| object` | — | 变更前的 JSON 字符串或对象 |
| `afterValue` | `string \| object` | — | 变更后的 JSON 字符串或对象 |
| `showUnchangedToggle` | `boolean` | `true` | 是否显示「显示/隐藏未变更字段」按钮 |
| `defaultShowUnchanged` | `boolean` | `false` | 初始是否展示未变更字段 |

## 使用示例

```vue
<template>
  <JsonDiffViewer
    :before-value="beforeJson"
    :after-value="afterJson"
  />
</template>

<script setup lang="ts">
import JsonDiffViewer from '@/components/JsonDiffViewer/index.vue'

const beforeJson = `{
  "name": "温度传感器A",
  "status": "online",
  "threshold": 80,
  "location": {
    "building": "A栋",
    "floor": 3
  }
}`

const afterJson = `{
  "name": "温度传感器A",
  "status": "offline",
  "threshold": 90,
  "location": {
    "building": "A栋",
    "floor": 5
  },
  "remark": "已维修"
}`
</script>
```

## 展示效果说明

| 样式 | 含义 |
|------|------|
| 🟥 红色 `－` | 字段被删除 |
| 🟩 绿色 `＋` | 字段被新增 |
| 🟨 黄色 `~` | 字段值被修改（同时展示旧值→新值）|
| ⬜ 白色（可选显示）| 字段未变更 |
| 🔵 蓝色标题行 | 嵌套对象的路径分组 |
