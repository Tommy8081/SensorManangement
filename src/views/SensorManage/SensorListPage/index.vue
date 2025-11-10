<script setup lang="ts">
import { useSensor } from "./utils/hook";
import { ref, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getSensorTypeList, type SensorTypeResult } from "@/api/sensor";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import View from "~icons/ep/view";

defineOptions({
  name: "SensorManage"
});

const formRef = ref();
const tableRef = ref();
const sensorTypeList = ref<SensorTypeResult[]>([]);
const sensorTypeLoading = ref(false);

const {
  form,
  loading,
  columns,
  dataList,
  pagination,
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleViewSvidData,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useSensor();

// 获取传感器类型列表
const loadSensorTypes = async () => {
  sensorTypeLoading.value = true;
  try {
    const data = await getSensorTypeList();
    sensorTypeList.value = data || [];
  } catch (error) {
    console.error("获取传感器类型失败:", error);
    // 使用默认数据
    sensorTypeList.value = [
      { SensorType: "Temperature", SensorDesc: "温度传感器" },
      { SensorType: "Humidity", SensorDesc: "湿度传感器" },
      { SensorType: "Pressure", SensorDesc: "压力传感器" }
    ];
  } finally {
    sensorTypeLoading.value = false;
  }
};

onMounted(() => {
  loadSensorTypes();
});
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-full pl-8 pt-[12px] overflow-auto"
    >
      <el-form-item label="传感器名称：" prop="SensorName">
        <el-input
          v-model="form.SensorName"
          placeholder="请输入传感器名称"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item label="传感器类型：" prop="SensorType">
        <el-select
          v-model="form.SensorType"
          placeholder="请选择传感器类型"
          clearable
          class="w-[180px]!"
          :loading="sensorTypeLoading"
        >
          <el-option
            v-for="item in sensorTypeList"
            :key="item.SensorType"
            :label="item.SensorDesc"
            :value="item.SensorType"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态：" prop="Enable">
        <el-select
          v-model="form.Enable"
          placeholder="请选择状态"
          clearable
          class="w-[180px]!"
        >
          <el-option label="已启用" value="true" />
          <el-option label="已停用" value="false" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri/search-line')"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="传感器列表" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          新增传感器
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          adaptive
          :adaptiveConfig="{ offsetBottom: 108 }"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="{ ...pagination, size }"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(View)"
              @click="handleViewSvidData(row)"
            >
              查看
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
            >
              修改
            </el-button>
            <el-popconfirm
              :title="`是否确认删除传感器${row.SensorName}？`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.main-content {
  margin: 24px 24px 0 !important;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
