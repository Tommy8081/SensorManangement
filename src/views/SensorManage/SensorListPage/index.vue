<script setup lang="ts">
import { useSensor } from "./utils/hook";
import { ref, onMounted } from "vue";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getSensorTypeList, type SensorTypeResult } from "@/api/sensor";
import { useI18n } from "vue-i18n";

import Delete from "~icons/ep/delete";
import EditPen from "~icons/ep/edit-pen";
import Refresh from "~icons/ep/refresh";
import AddFill from "~icons/ri/add-circle-line";
import View from "~icons/ep/view";

defineOptions({
  name: "SensorManage"
});

const { t, locale } = useI18n();
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
  tableKey, // 添加 tableKey
  onSearch,
  resetForm,
  openDialog,
  handleDelete,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange,
  handleViewSvidData
} = useSensor();

// 获取传感器类型列表
const loadSensorTypes = async () => {
  sensorTypeLoading.value = true;
  try {
    const data = await getSensorTypeList();
    sensorTypeList.value = data || [];
  } catch (error) {
    console.error("获取传感器类型失败:", error);
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
      <el-form-item
        :label="t('sensorManage.sensorList.search.sensorName') + '：'"
        prop="SensorName"
      >
        <el-input
          v-model="form.SensorName"
          :placeholder="t('sensorManage.sensorList.search.sensorName')"
          clearable
          class="w-[180px]!"
        />
      </el-form-item>
      <el-form-item
        :label="t('sensorManage.sensorList.search.sensorType') + '：'"
        prop="SensorType"
      >
        <el-select
          v-model="form.SensorType"
          :placeholder="t('sensorManage.sensorList.search.sensorType')"
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
      <el-form-item
        :label="t('sensorManage.sensorList.search.enable') + '：'"
        prop="Enable"
      >
        <el-select
          v-model="form.Enable"
          :placeholder="t('sensorManage.sensorList.search.enable')"
          clearable
          class="w-[180px]!"
        >
          <el-option
            :label="t('sensorManage.sensorList.search.enabled')"
            :value="true"
          />
          <el-option
            :label="t('sensorManage.sensorList.search.disabled')"
            :value="false"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('ri/search-line')"
          :loading="loading"
          @click="onSearch"
        >
          {{ t("sensorManage.sensorList.search.searchBtn") }}
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          {{ t("sensorManage.sensorList.search.resetBtn") }}
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar
      :key="`sensor-list-${tableKey}`"
      :title="t('sensorManage.sensorList.title')"
      :columns="columns"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          {{ t("sensorManage.sensorList.button.add") }}
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
              {{ t("sensorManage.sensorList.button.view") }}
            </el-button>
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('修改', row)"
            >
              {{ t("sensorManage.sensorList.button.edit") }}
            </el-button>
            <el-popconfirm
              :title="
                t('common.confirm') +
                t('sensorManage.sensorList.button.delete') +
                t('common.sensor') +
                row.SensorName +
                '？'
              "
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
                  {{ t("sensorManage.sensorList.button.delete") }}
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
