<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  before: string;
  after: string;
  title?: string;
}>();

// ─── JSON 格式化 ─────────────────────────────────────────────────

function tryFormatJson(val: string): string {
  if (val == null || val === "") return "";
  const trimmed = String(val).trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      return JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      /* not valid JSON */
    }
  }
  return trimmed;
}

// ─── 字符级 diff ─────────────────────────────────────────────────

type CharSegment = { text: string; highlight: boolean };

function charDiff(
  oldLine: string,
  newLine: string
): { left: CharSegment[]; right: CharSegment[] } {
  const a = oldLine;
  const b = newLine;
  const m = a.length;
  const n = b.length;

  if (m > 400 || n > 400) {
    return {
      left: [{ text: a, highlight: true }],
      right: [{ text: b, highlight: true }]
    };
  }

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let ii = 1; ii <= m; ii++) {
    for (let jj = 1; jj <= n; jj++) {
      dp[ii][jj] =
        a[ii - 1] === b[jj - 1]
          ? dp[ii - 1][jj - 1] + 1
          : Math.max(dp[ii - 1][jj], dp[ii][jj - 1]);
    }
  }

  const leftSegs: CharSegment[] = [];
  const rightSegs: CharSegment[] = [];
  let ci = m,
    cj = n;
  const ops: Array<"eq" | "del" | "ins"> = [];
  while (ci > 0 || cj > 0) {
    if (ci > 0 && cj > 0 && a[ci - 1] === b[cj - 1]) {
      ops.unshift("eq");
      ci--;
      cj--;
    } else if (cj > 0 && (ci === 0 || dp[ci][cj - 1] >= dp[ci - 1][cj])) {
      ops.unshift("ins");
      cj--;
    } else {
      ops.unshift("del");
      ci--;
    }
  }

  let oi = 0,
    oj = 0;
  for (const op of ops) {
    if (op === "eq") {
      leftSegs.push({ text: a[oi++], highlight: false });
      rightSegs.push({ text: b[oj++], highlight: false });
    } else if (op === "del") {
      leftSegs.push({ text: a[oi++], highlight: true });
    } else {
      rightSegs.push({ text: b[oj++], highlight: true });
    }
  }

  return { left: leftSegs, right: rightSegs };
}

// ─── 行级 LCS diff → split rows ─────────────────────────────────

type LineType = "added" | "removed" | "unchanged" | "empty";

interface SplitCell {
  no: number | null;
  content: string;
  type: LineType;
  charSegs?: CharSegment[];
}

interface SplitRow {
  left: SplitCell;
  right: SplitCell;
}

function buildSplitRows(oldStr: string, newStr: string): SplitRow[] {
  const oldLines = oldStr === "" ? [] : oldStr.split("\n");
  const newLines = newStr === "" ? [] : newStr.split("\n");
  const m = oldLines.length;
  const n = newLines.length;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let ii = 1; ii <= m; ii++) {
    for (let jj = 1; jj <= n; jj++) {
      dp[ii][jj] =
        oldLines[ii - 1] === newLines[jj - 1]
          ? dp[ii - 1][jj - 1] + 1
          : Math.max(dp[ii - 1][jj], dp[ii][jj - 1]);
    }
  }

  type RawOp = { type: "removed" | "added" | "unchanged"; content: string };
  const raw: RawOp[] = [];
  let ri = m,
    rj = n;
  while (ri > 0 || rj > 0) {
    if (ri > 0 && rj > 0 && oldLines[ri - 1] === newLines[rj - 1]) {
      raw.unshift({ type: "unchanged", content: oldLines[ri - 1] });
      ri--;
      rj--;
    } else if (rj > 0 && (ri === 0 || dp[ri][rj - 1] >= dp[ri - 1][rj])) {
      raw.unshift({ type: "added", content: newLines[rj - 1] });
      rj--;
    } else {
      raw.unshift({ type: "removed", content: oldLines[ri - 1] });
      ri--;
    }
  }

  const rows: SplitRow[] = [];
  let oldNo = 1,
    newNo = 1;

  for (let k = 0; k < raw.length; k++) {
    const cur = raw[k];
    if (cur.type === "removed") {
      const next = raw[k + 1];
      if (next?.type === "added") {
        const { left: leftSegs, right: rightSegs } = charDiff(
          cur.content,
          next.content
        );
        rows.push({
          left: {
            no: oldNo++,
            content: cur.content,
            type: "removed",
            charSegs: leftSegs
          },
          right: {
            no: newNo++,
            content: next.content,
            type: "added",
            charSegs: rightSegs
          }
        });
        k++;
      } else {
        rows.push({
          left: { no: oldNo++, content: cur.content, type: "removed" },
          right: { no: null, content: "", type: "empty" }
        });
      }
    } else if (cur.type === "added") {
      rows.push({
        left: { no: null, content: "", type: "empty" },
        right: { no: newNo++, content: cur.content, type: "added" }
      });
    } else {
      rows.push({
        left: { no: oldNo++, content: cur.content, type: "unchanged" },
        right: { no: newNo++, content: cur.content, type: "unchanged" }
      });
    }
  }

  return rows;
}

// ─── Computed ────────────────────────────────────────────────────

const splitRows = computed<SplitRow[]>(() => {
  const b = tryFormatJson(props.before);
  const a = tryFormatJson(props.after);
  return buildSplitRows(b, a);
});

const stats = computed(() => ({
  added: splitRows.value.filter(r => r.right.type === "added").length,
  removed: splitRows.value.filter(r => r.left.type === "removed").length,
  hasChanges: splitRows.value.some(
    r => r.left.type !== "unchanged" || r.right.type !== "unchanged"
  )
}));
</script>

<template>
  <div class="json-diff-viewer">
    <!-- 标题栏 -->
    <div class="diff-header">
      <span class="diff-title">{{ title || "变更 Diff 对比" }}</span>
      <span v-if="stats.hasChanges" class="diff-stats">
        <span class="stat-added">+{{ stats.added }}</span>
        <span class="stat-removed">-{{ stats.removed }}</span>
      </span>
      <span v-else class="diff-no-change">无差异</span>
    </div>

    <!-- 列标题 -->
    <div class="diff-col-header">
      <div class="col-label col-label--left">修改前</div>
      <div class="col-label col-label--right">修改后</div>
    </div>

    <!-- Split diff 正文 -->
    <div class="diff-body">
      <div v-for="(row, idx) in splitRows" :key="idx" class="split-row">
        <!-- 左侧：修改前 -->
        <div :class="['split-cell', `split-cell--${row.left.type}`]">
          <span class="line-no">{{ row.left.no ?? "" }}</span>
          <span class="line-sign">{{
            row.left.type === "removed" ? "-" : " "
          }}</span>
          <span class="line-content">
            <template v-if="row.left.charSegs">
              <span
                v-for="(seg, si) in row.left.charSegs"
                :key="si"
                :class="{ 'char-hl': seg.highlight }"
                >{{ seg.text }}</span
              >
            </template>
            <template v-else>{{ row.left.content }}</template>
          </span>
        </div>

        <!-- 分隔线 -->
        <div class="split-divider" />

        <!-- 右侧：修改后 -->
        <div :class="['split-cell', `split-cell--${row.right.type}`]">
          <span class="line-no">{{ row.right.no ?? "" }}</span>
          <span class="line-sign">{{
            row.right.type === "added" ? "+" : " "
          }}</span>
          <span class="line-content">
            <template v-if="row.right.charSegs">
              <span
                v-for="(seg, si) in row.right.charSegs"
                :key="si"
                :class="{ 'char-hl': seg.highlight }"
                >{{ seg.text }}</span
              >
            </template>
            <template v-else>{{ row.right.content }}</template>
          </span>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="splitRows.length === 0" class="diff-empty">暂无内容可对比</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$font-mono: "Cascadia Code", "Fira Code", Consolas, "Courier New", monospace;
$color-added-bg: #e6ffed;
$color-removed-bg: #ffeef0;
$color-added-char: #acf2bd;
$color-removed-char: #fdb8c0;
$color-added-sign: #22863a;
$color-removed-sign: #cb2431;
$color-lineno-bg: #f6f8fa;

.json-diff-viewer {
  font-family: $font-mono;
  font-size: 12.5px;
  line-height: 1.65;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  overflow: hidden;

  .diff-header {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 7px 14px;
    font-size: 13px;
    font-weight: 600;
    background: var(--el-fill-color);
    border-bottom: 1px solid var(--el-border-color);

    .diff-title {
      flex: 1;
      color: var(--el-text-color-primary);
    }

    .diff-stats {
      display: flex;
      gap: 6px;
    }

    .stat-added {
      color: $color-added-sign;
      font-weight: 700;
    }

    .stat-removed {
      color: $color-removed-sign;
      font-weight: 700;
    }

    .diff-no-change {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  .diff-col-header {
    display: flex;

    .col-label {
      flex: 1;
      padding: 3px 0 3px 52px;
      font-size: 11.5px;
      font-weight: 600;
      background: #f1f3f5;
      border-bottom: 1px solid var(--el-border-color-lighter);

      &--left {
        color: $color-removed-sign;
        border-right: 2px solid var(--el-border-color);
      }

      &--right {
        color: $color-added-sign;
      }
    }
  }

  .diff-body {
    overflow-x: auto;
    background: #fff;
  }

  .split-row {
    display: flex;
    min-height: 22px;

    &:hover {
      .split-cell--unchanged {
        background: #f5f7fa;
      }
    }
  }

  .split-divider {
    flex-shrink: 0;
    width: 2px;
    background: var(--el-border-color);
  }

  .split-cell {
    display: flex;
    flex: 1;
    align-items: flex-start;
    min-width: 0;
    overflow: hidden;

    &--unchanged {
      background: transparent;
    }

    &--removed {
      background: $color-removed-bg;

      .line-sign {
        color: $color-removed-sign;
        font-weight: 700;
      }
    }

    &--added {
      background: $color-added-bg;

      .line-sign {
        color: $color-added-sign;
        font-weight: 700;
      }
    }

    &--empty {
      background: #fafafa;
      opacity: 0.55;
    }
  }

  .line-no {
    display: inline-block;
    flex-shrink: 0;
    width: 38px;
    padding: 0 6px;
    color: #a0a0a0;
    text-align: right;
    user-select: none;
    background: $color-lineno-bg;
    border-right: 1px solid var(--el-border-color-lighter);
  }

  .line-sign {
    flex-shrink: 0;
    width: 16px;
    padding: 0 2px 0 4px;
    color: var(--el-text-color-secondary);
    user-select: none;
  }

  .line-content {
    flex: 1;
    padding: 0 6px;
    word-break: break-all;
    white-space: pre-wrap;
  }

  .char-hl {
    border-radius: 2px;

    .split-cell--removed & {
      background: $color-removed-char;
    }

    .split-cell--added & {
      background: $color-added-char;
    }
  }

  .diff-empty {
    padding: 20px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}
</style>
