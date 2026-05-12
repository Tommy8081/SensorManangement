<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { ElMessage } from "element-plus";
import { parseINI } from "./utils/iniParser";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    SensorType: "",
    SensorDesc: "",
    SensorConfigs: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

const iniTemplate = `unit=℃
protocol=Modbus RTU
enable=true
min=-40
max=125
accuracy=0.5
baudRate=9600
dataBits=8
stopBits=1
parity=None
address=1`;

const insertExample = () => {
  newFormInline.value.SensorConfigs = iniTemplate;
  ElMessage.success(t("sensorManage.sensorType.message.validateSuccess"));
};

const validateIni = () => {
  try {
    parseINI(newFormInline.value.SensorConfigs);
    ElMessage.success(t("sensorManage.sensorType.message.validateSuccess"));
  } catch (error) {
    ElMessage.error(
      t("sensorManage.sensorType.message.validateError") +
        "：" +
        (error as Error).message
    );
  }
};

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="120px"
  >
    <el-form-item
      :label="t('sensorManage.sensorType.form.sensorType')"
      prop="SensorType"
    >
      <el-input
        v-model="newFormInline.SensorType"
        clearable
        :placeholder="t('sensorManage.sensorType.form.placeholder.sensorType')"
      />
    </el-form-item>

    <el-form-item
      :label="t('sensorManage.sensorType.form.sensorDesc')"
      prop="SensorDesc"
    >
      <el-input
        v-model="newFormInline.SensorDesc"
        clearable
        :placeholder="t('sensorManage.sensorType.form.placeholder.sensorDesc')"
      />
    </el-form-item>

    <el-form-item
      :label="t('sensorManage.sensorType.form.sensorConfigs')"
      prop="SensorConfigs"
    >
      <div class="w-full">
        <div class="mb-2 flex gap-2">
          <el-button type="primary" link @click="insertExample">
            {{ t("sensorManage.sensorType.form.actions.insertExample") }}
          </el-button>
          <el-button type="success" link @click="validateIni">
            {{ t("sensorManage.sensorType.form.actions.validate") }}
          </el-button>
        </div>
        <el-input
          v-model="newFormInline.SensorConfigs"
          type="textarea"
          :rows="12"
          :placeholder="
            t('sensorManage.sensorType.form.placeholder.sensorConfigs')
          "
        />
        <div class="mt-2 text-xs text-gray-500">
          <p>{{ t("sensorManage.sensorType.form.tips.title") }}</p>
          <ul class="ml-4 list-disc">
            <li>{{ t("sensorManage.sensorType.form.tips.format") }}</li>
            <li>{{ t("sensorManage.sensorType.form.tips.comment") }}</li>
            <li>{{ t("sensorManage.sensorType.form.tips.oneLine") }}</li>
          </ul>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<style scoped>
:deep(.el-textarea__inner) {
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
}
</style>
