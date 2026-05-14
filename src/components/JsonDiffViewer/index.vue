<template>
  <div class="json-diff-viewer">
    <div v-if="diffLines.length === 0" class="no-diff">
      <span>无变更</span>
    </div>
    <table v-else class="diff-table">
      <colgroup>
        <col class="col-indicator" />
        <col class="col-key" />
        <col class="col-value" />
      </colgroup>
      <tbody>
        <template v-for="(line, idx) in diffLines" :key="idx">
          <!-- Section Header (nested object path) -->
          <tr v-if="line.type === 'section'" class="diff-section-row">
            <td colspan="3" class="diff-section">
              <span class="section-icon">▸</span>
              {{ line.path }}
            </td>
          </tr>
          <!-- Removed line -->
          <tr v-else-if="line.type === 'removed'" class="diff-row diff-removed">
            <td class="diff-indicator">－</td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value">
              <span class="value-tag removed-tag">{{ formatValue(line.oldValue) }}</span>
            </td>
          </tr>
          <!-- Added line -->
          <tr v-else-if="line.type === 'added'" class="diff-row diff-added">
            <td class="diff-indicator">＋</td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value">
              <span class="value-tag added-tag">{{ formatValue(line.newValue) }}</span>
            </td>
          </tr>
          <!-- Modified line -->
          <tr v-else-if="line.type === 'modified'" class="diff-row diff-modified">
            <td class="diff-indicator">~</td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value diff-value-modified">
              <span class="value-tag removed-tag">{{ formatValue(line.oldValue) }}</span>
              <span class="arrow">→</span>
              <span class="value-tag added-tag">{{ formatValue(line.newValue) }}</span>
            </td>
          </tr>
          <!-- Unchanged line (only shown when showUnchanged is true) -->
          <tr v-else-if="line.type === 'unchanged' && showUnchanged" class="diff-row diff-unchanged">
            <td class="diff-indicator"> </td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value">{{ formatValue(line.oldValue) }}</td>
          </tr>
        </template>
      </tbody>
    </table>

    <div v-if="showUnchangedToggle" class="toggle-bar">
      <button class="toggle-btn" @click="showUnchanged = !showUnchanged">
        {{ showUnchanged ? '隐藏未变更字段' : '显示未变更字段' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface DiffLine {
  type: 'added' | 'removed' | 'modified' | 'unchanged' | 'section'
  key: string
  path: string
  oldValue?: unknown
  newValue?: unknown
}

interface Props {
  beforeValue: string | Record<string, unknown>
  afterValue: string | Record<string, unknown>
  /** 是否显示切换未变更字段的按钮，默认 true */
  showUnchangedToggle?: boolean
  /** 初始是否展示未变更字段，默认 false */
  defaultShowUnchanged?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showUnchangedToggle: true,
  defaultShowUnchanged: false,
})

const showUnchanged = ref(props.defaultShowUnchanged)

function parseJson(val: string | Record<string, unknown>): Record<string, unknown> {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val)
    } catch {
      return {}
    }
  }
  return val ?? {}
}

function formatValue(val: unknown): string {
  if (val === null) return 'null'
  if (val === undefined) return ''
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
}

function collectDiff(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  parentPath: string,
  lines: DiffLine[],
) {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)])

  for (const key of allKeys) {
    const hasOld = Object.prototype.hasOwnProperty.call(before, key)
    const hasNew = Object.prototype.hasOwnProperty.call(after, key)
    const oldVal = before[key]
    const newVal = after[key]
    const currentPath = parentPath ? `${parentPath}.${key}` : key

    if (!hasOld) {
      // Added
      if (isObject(newVal)) {
        lines.push({ type: 'section', key, path: currentPath, newValue: newVal })
        collectDiff({}, newVal as Record<string, unknown>, currentPath, lines)
      } else {
        lines.push({ type: 'added', key, path: currentPath, newValue: newVal })
      }
    } else if (!hasNew) {
      // Removed
      if (isObject(oldVal)) {
        lines.push({ type: 'section', key, path: currentPath, oldValue: oldVal })
        collectDiff(oldVal as Record<string, unknown>, {}, currentPath, lines)
      } else {
        lines.push({ type: 'removed', key, path: currentPath, oldValue: oldVal })
      }
    } else if (isObject(oldVal) && isObject(newVal)) {
      // Both are objects — recurse
      lines.push({ type: 'section', key, path: currentPath })
      collectDiff(
        oldVal as Record<string, unknown>,
        newVal as Record<string, unknown>,
        currentPath,
        lines,
      )
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      // Modified
      lines.push({ type: 'modified', key, path: currentPath, oldValue: oldVal, newValue: newVal })
    } else {
      // Unchanged
      lines.push({ type: 'unchanged', key, path: currentPath, oldValue: oldVal })
    }
  }
}

const diffLines = computed<DiffLine[]>(() => {
  const before = parseJson(props.beforeValue)
  const after = parseJson(props.afterValue)
  const lines: DiffLine[] = []
  collectDiff(before, after, '', lines)
  return lines
})
</script>

<style scoped>
.json-diff-viewer {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.no-diff {
  padding: 16px;
  color: #6a737d;
  text-align: center;
}

.diff-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.col-indicator {
  width: 32px;
}
.col-key {
  width: 200px;
}
.col-value {
  width: auto;
}

/* Section header row */
.diff-section-row {
  background: #f1f8ff;
}
.diff-section {
  padding: 4px 12px;
  color: #0366d6;
  font-weight: 600;
  font-size: 12px;
  border-top: 1px solid #c8e1ff;
  border-bottom: 1px solid #c8e1ff;
}
.section-icon {
  margin-right: 4px;
  opacity: 0.7;
}

/* Common row */
.diff-row td {
  padding: 3px 8px;
  vertical-align: middle;
  white-space: pre-wrap;
  word-break: break-all;
  border-bottom: 1px solid #f0f0f0;
}

.diff-indicator {
  text-align: center;
  font-weight: bold;
  width: 32px;
  user-select: none;
}

.diff-key {
  color: #24292e;
  font-weight: 500;
  padding-left: 16px !important;
}

/* Removed */
.diff-removed {
  background-color: #ffeef0;
}
.diff-removed .diff-indicator {
  color: #cb2431;
}
.diff-removed .diff-key {
  color: #86181d;
}

/* Added */
.diff-added {
  background-color: #e6ffed;
}
.diff-added .diff-indicator {
  color: #22863a;
}
.diff-added .diff-key {
  color: #165c26;
}

/* Modified */
.diff-modified {
  background-color: #fffbdd;
}
.diff-modified .diff-indicator {
  color: #b08800;
}
.diff-modified .diff-key {
  color: #735c0f;
}
.diff-value-modified {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}

/* Unchanged */
.diff-unchanged {
  background-color: #fff;
  color: #6a737d;
}
.diff-unchanged .diff-indicator {
  color: #d1d5da;
}

/* Value tags */
.value-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 12px;
}
.removed-tag {
  background: #ffdce0;
  color: #86181d;
  text-decoration: line-through;
  text-decoration-color: #cb243180;
}
.added-tag {
  background: #cdffd8;
  color: #165c26;
}

.arrow {
  color: #586069;
  font-size: 14px;
}

/* Toggle button */
.toggle-bar {
  border-top: 1px solid #e1e4e8;
  padding: 8px 12px;
  background: #fafbfc;
  text-align: right;
}
.toggle-btn {
  font-size: 12px;
  color: #0366d6;
  background: none;
  border: 1px solid #c8e1ff;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.toggle-btn:hover {
  background: #f1f8ff;
}
</style>
