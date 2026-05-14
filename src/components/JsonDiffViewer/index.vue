<template>
  <div class="json-diff-viewer">
    <!-- Title Header -->
    <div class="diff-header">
      <div class="diff-header-before">
        <span class="header-dot dot-removed"></span>
        {{ beforeTitle }}
      </div>
      <div class="diff-header-after">
        <span class="header-dot dot-added"></span>
        {{ afterTitle }}
      </div>
    </div>

    <div v-if="diffLines.length === 0" class="no-diff">
      <span>无变更</span>
    </div>

    <!-- Split view table -->
    <table v-else class="diff-table">
      <colgroup>
        <col class="col-indicator" />
        <col class="col-key" />
        <col class="col-value-before" />
        <col class="col-divider" />
        <col class="col-value-after" />
      </colgroup>
      <thead class="diff-col-header">
        <tr>
          <th></th>
          <th class="col-header-key">字段</th>
          <th class="col-header-before">修改前</th>
          <th class="col-header-divider"></th>
          <th class="col-header-after">修改后</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(line, idx) in visibleLines" :key="idx">
          <!-- Section Header (nested object path) -->
          <tr v-if="line.type === 'section'" class="diff-section-row">
            <td colspan="5" class="diff-section">
              <span class="section-icon">▸</span>
              {{ line.path }}
            </td>
          </tr>

          <!-- Removed -->
          <tr v-else-if="line.type === 'removed'" class="diff-row diff-removed">
            <td class="diff-indicator">－</td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value side-before">
              <span class="value-tag removed-tag">{{ formatValue(line.oldValue) }}</span>
            </td>
            <td class="col-divider-cell"></td>
            <td class="diff-value side-after"></td>
          </tr>

          <!-- Added -->
          <tr v-else-if="line.type === 'added'" class="diff-row diff-added">
            <td class="diff-indicator">＋</td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value side-before"></td>
            <td class="col-divider-cell"></td>
            <td class="diff-value side-after">
              <span class="value-tag added-tag">{{ formatValue(line.newValue) }}</span>
            </td>
          </tr>

          <!-- Modified -->
          <tr v-else-if="line.type === 'modified'" class="diff-row diff-modified">
            <td class="diff-indicator">~</td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value side-before">
              <span class="value-tag removed-tag">{{ formatValue(line.oldValue) }}</span>
            </td>
            <td class="col-divider-cell"><span class="arrow">→</span></td>
            <td class="diff-value side-after">
              <span class="value-tag added-tag">{{ formatValue(line.newValue) }}</span>
            </td>
          </tr>

          <!-- Unchanged -->
          <tr v-else-if="line.type === 'unchanged'" class="diff-row diff-unchanged">
            <td class="diff-indicator"> </td>
            <td class="diff-key">{{ line.key }}</td>
            <td class="diff-value side-before">{{ formatValue(line.oldValue) }}</td>
            <td class="col-divider-cell"></td>
            <td class="diff-value side-after">{{ formatValue(line.oldValue) }}</td>
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
  /** 修改前的标题，默认「修改前」 */
  beforeTitle?: string
  /** 修改后的标题，默认「修改后」 */
  afterTitle?: string
  /** 是否显示切换未变更字段的按钮，默认 true */
  showUnchangedToggle?: boolean
  /** 初始是否展示未变更字段，默认 false */
  defaultShowUnchanged?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  beforeTitle: '修改前',
  afterTitle: '修改后',
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
      if (isObject(newVal)) {
        lines.push({ type: 'section', key, path: currentPath, newValue: newVal })
        collectDiff({}, newVal as Record<string, unknown>, currentPath, lines)
      } else {
        lines.push({ type: 'added', key, path: currentPath, newValue: newVal })
      }
    } else if (!hasNew) {
      if (isObject(oldVal)) {
        lines.push({ type: 'section', key, path: currentPath, oldValue: oldVal })
        collectDiff(oldVal as Record<string, unknown>, {}, currentPath, lines)
      } else {
        lines.push({ type: 'removed', key, path: currentPath, oldValue: oldVal })
      }
    } else if (isObject(oldVal) && isObject(newVal)) {
      lines.push({ type: 'section', key, path: currentPath })
      collectDiff(
        oldVal as Record<string, unknown>,
        newVal as Record<string, unknown>,
        currentPath,
        lines,
      )
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      lines.push({ type: 'modified', key, path: currentPath, oldValue: oldVal, newValue: newVal })
    } else {
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

const visibleLines = computed(() =>
  diffLines.value.filter((l) => l.type !== 'unchanged' || showUnchanged.value),
)
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

/* ── Top title header ───────────────────────── */
.diff-header {
  display: flex;
  border-bottom: 1px solid #e1e4e8;
}
.diff-header-before,
.diff-header-after {
  flex: 1;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}
.diff-header-before {
  background: #fff5f5;
  color: #86181d;
  border-right: 2px solid #e1e4e8;
}
.diff-header-after {
  background: #f0fff4;
  color: #165c26;
}
.header-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-removed { background: #cb2431; }
.dot-added   { background: #22863a; }

/* ── Table ────────────────────────────────── */
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

.col-indicator   { width: 32px; }
.col-key         { width: 160px; }
.col-divider     { width: 36px; }
.col-value-before,
.col-value-after { width: auto; }

/* Column sub-header */
.diff-col-header th {
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid #e1e4e8;
  background: #fafbfc;
  color: #6a737d;
}
.col-header-key     { padding-left: 16px !important; }
.col-header-before  { background: #fff8f8; color: #cb2431; }
.col-header-after   { background: #f6fff8; color: #22863a; }
.col-header-divider { background: #fafbfc; }

/* ── Diff rows ──────────────────────────────── */
.diff-section-row { background: #f1f8ff; }
.diff-section {
  padding: 4px 12px;
  color: #0366d6;
  font-weight: 600;
  font-size: 12px;
  border-top: 1px solid #c8e1ff;
  border-bottom: 1px solid #c8e1ff;
}
.section-icon { margin-right: 4px; opacity: 0.7; }

.diff-row td {
  padding: 4px 8px;
  vertical-align: middle;
  white-space: pre-wrap;
  word-break: break-all;
  border-bottom: 1px solid #f0f0f0;
}

.diff-indicator {
  text-align: center;
  font-weight: bold;
  user-select: none;
}
.diff-key {
  color: #24292e;
  font-weight: 500;
  padding-left: 16px !important;
}
.col-divider-cell {
  text-align: center;
  background: #f6f8fa;
  border-left: 1px solid #e1e4e8;
  border-right: 1px solid #e1e4e8;
}

/* Removed */
.diff-removed                  { background-color: #ffeef0; }
.diff-removed .diff-indicator  { color: #cb2431; }
.diff-removed .diff-key        { color: #86181d; }
.diff-removed .side-before     { background: #ffdce0; }
.diff-removed .side-after      { background: #ffeef0; }

/* Added */
.diff-added                    { background-color: #e6ffed; }
.diff-added .diff-indicator    { color: #22863a; }
.diff-added .diff-key          { color: #165c26; }
.diff-added .side-before       { background: #e6ffed; }
.diff-added .side-after        { background: #cdffd8; }

/* Modified */
.diff-modified                 { background-color: #fffbdd; }
.diff-modified .diff-indicator { color: #b08800; }
.diff-modified .diff-key       { color: #735c0f; }
.diff-modified .side-before    { background: #fff5b1; }
.diff-modified .side-after     { background: #e6ffed; }

/* Unchanged */
.diff-unchanged                { background-color: #fff; color: #6a737d; }
.diff-unchanged .diff-indicator{ color: #d1d5da; }
.diff-unchanged .side-before,
.diff-unchanged .side-after    { color: #6a737d; }

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

.arrow { color: #586069; font-size: 14px; }

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
.toggle-btn:hover { background: #f1f8ff; }
</style>
