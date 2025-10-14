<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    SensorType: "",
    PortType: "",
    SensorName: "",
    Enable: false,
    WSID: "",
    Location: "",
    EQPID: "",
    IP: "",
    StationNo: 0,
    Port: 0,
    Com: "",
    LastUpdateUser: "",
    LastUpdateTime: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

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
    label-width="100px"
  >
    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="传感器名称" prop="SensorName">
          <el-input
            v-model="newFormInline.SensorName"
            clearable
            placeholder="请输入传感器名称"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="传感器类型" prop="SensorType">
          <el-select
            v-model="newFormInline.SensorType"
            clearable
            placeholder="请选择传感器类型"
            class="w-full"
          >
            <el-option label="温度传感器" value="Temperature" />
            <el-option label="湿度传感器" value="Humidity" />
            <el-option label="压力传感器" value="Pressure" />
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="连接方式" prop="PortType">
          <el-select
            v-model="newFormInline.PortType"
            clearable
            placeholder="请选择连接方式"
            class="w-full"
          >
            <el-option label="TCP/IP" value="TCP" />
            <el-option label="串口" value="Serial" />
            <el-option label="USB" value="USB" />
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="是否启用" prop="Enable">
          <el-switch
            v-model="newFormInline.Enable"
            active-text="启用"
            inactive-text="停用"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="OPI编号" prop="WSID">
          <el-input
            v-model="newFormInline.WSID"
            clearable
            placeholder="请输入OPI编号"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="OPI位置" prop="Location">
          <el-input
            v-model="newFormInline.Location"
            clearable
            placeholder="请输入OPI位置"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="机台编号" prop="EQPID">
          <el-input
            v-model="newFormInline.EQPID"
            clearable
            placeholder="请输入机台编号"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="IP地址" prop="IP">
          <el-input
            v-model="newFormInline.IP"
            clearable
            placeholder="请输入IP地址"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="站点编号" prop="StationNo">
          <el-input-number
            v-model="newFormInline.StationNo"
            :min="0"
            placeholder="请输入站点编号"
            class="w-full"
          />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="端口" prop="Port">
          <el-input-number
            v-model="newFormInline.Port"
            :min="0"
            :max="65535"
            placeholder="请输入端口号"
            class="w-full"
          />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-form-item label="COM口" prop="Com">
          <el-input
            v-model="newFormInline.Com"
            clearable
            placeholder="请输入COM口（如：COM1）"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
