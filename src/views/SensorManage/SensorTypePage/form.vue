<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { parseINI } from "./utils/iniParser";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    SensorType: "",
    SensorDesc: "",
    SensorConfigs: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

// 示例INI模板
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

// 插入示例
const insertExample = () => {
  newFormInline.value.SensorConfigs = iniTemplate;
};

// 验证INI格式
const validateIni = () => {
  if (!newFormInline.value.SensorConfigs) {
    ElMessage.warning("请先输入配置内容");
    return;
  }

  try {
    const parsed = parseINI(newFormInline.value.SensorConfigs);
    console.log("解析结果:", parsed);
    ElMessage.success("INI格式验证通过！");
  } catch (e) {
    ElMessage.error("INI格式验证失败：" + (e as Error).message);
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
    <el-form-item label="传感器类型" prop="SensorType">
      <el-input
        v-model="newFormInline.SensorType"
        clearable
        placeholder="请输入传感器类型（如：Temperature）"
      />
    </el-form-item>

    <el-form-item label="传感器描述" prop="SensorDesc">
      <el-input
        v-model="newFormInline.SensorDesc"
        clearable
        placeholder="请输入传感器描述"
      />
    </el-form-item>

    <el-form-item label="传感器配置" prop="SensorConfigs">
      <div class="w-full">
        <div class="mb-2 flex gap-2">
          <el-button type="primary" link @click="insertExample">
            插入示例模板
          </el-button>
          <el-button type="success" link @click="validateIni">
            验证格式
          </el-button>
        </div>
        <el-input
          v-model="newFormInline.SensorConfigs"
          type="textarea"
          :rows="12"
          placeholder="请输入配置内容，格式：
key=value
例如：
unit=℃
protocol=Modbus RTU
min=-40
max=125"
        />
        <div class="mt-2 text-xs text-gray-500">
          <p>提示：</p>
          <ul class="ml-4 list-disc">
            <li>使用 key=value 格式定义配置项</li>
            <li>支持注释（以 ; 或 # 开头的行）</li>
            <li>每行一个配置项</li>
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
