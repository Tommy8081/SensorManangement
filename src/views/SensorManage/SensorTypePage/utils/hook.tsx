import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { stringifyINI, parseINI } from "./iniParser";

export function useSensorType() {
  const { t, locale } = useI18n();
  const form = reactive({
    SensorType: ""
  });
  const formRef = ref();
  const dataList = ref<FormItemProps[]>([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });

  // 使用 computed 使列配置响应式
  const columns = computed<TableColumnList>(() => [
    {
      label: t("sensorManage.sensorType.table.sensorType"),
      prop: "SensorType",
      minWidth: 150
    },
    {
      label: t("sensorManage.sensorType.table.sensorDesc"),
      prop: "SensorDesc",
      minWidth: 150
    },
    {
      label: t("sensorManage.sensorType.table.sensorConfigs"),
      prop: "SensorConfigs",
      minWidth: 200,
      cellRenderer: ({ row }) => (
        <el-tag type="info" size="small">
          {row.SensorConfigs ? t("common.yes") : t("common.no")}
        </el-tag>
      )
    },
    {
      label: t("sensorManage.sensorType.table.createTime"),
      prop: "CreateTime",
      minWidth: 180,
      formatter: ({ CreateTime }) =>
        CreateTime ? dayjs(CreateTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: t("sensorManage.sensorType.table.updateTime"),
      prop: "UpdateTime",
      minWidth: 180,
      formatter: ({ UpdateTime }) =>
        UpdateTime ? dayjs(UpdateTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: t("sensorManage.sensorType.table.operation"),
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ]);

  // 监听语言变化，强制刷新列
  const tableKey = ref(0);
  watch(locale, () => {
    tableKey.value++;
  });

  function handleDelete(row: FormItemProps) {
    ElMessageBox.confirm(
      t("sensorManage.sensorType.message.deleteConfirm", {
        type: row.SensorType
      }),
      t("sensorManage.sensorList.message.systemTip"),
      {
        confirmButtonText: t("common.confirm"),
        cancelButtonText: t("common.cancel"),
        type: "warning"
      }
    )
      .then(() => {
        // TODO: 调用删除接口
        message(
          t("sensorManage.sensorType.message.deleteSuccess", {
            type: row.SensorType
          }),
          { type: "success" }
        );
        onSearch();
      })
      .catch(() => {});
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    // TODO: 调用接口
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    const dialogTitle =
      title === "新增"
        ? t("sensorManage.sensorType.dialog.addTitle")
        : t("sensorManage.sensorType.dialog.editTitle");

    // 如果是编辑，将 JSON 转为 INI
    let iniConfig = "";
    if (row?.SensorConfigs) {
      try {
        const configObj = JSON.parse(row.SensorConfigs);
        iniConfig = stringifyINI(configObj);
      } catch (error) {
        console.error("解析配置失败:", error);
      }
    }

    addDialog({
      title: dialogTitle,
      props: {
        formInline: {
          SensorType: row?.SensorType ?? "",
          SensorDesc: row?.SensorDesc ?? "",
          SensorConfigs: iniConfig
        }
      },
      width: "50%",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, formInline: null }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;

        function chores() {
          const messageKey =
            title === "新增"
              ? "sensorManage.sensorType.message.addSuccess"
              : "sensorManage.sensorType.message.editSuccess";

          // 将 INI 转为 JSON
          try {
            const configObj = parseINI(curData.SensorConfigs);
            const jsonConfig = JSON.stringify(configObj);

            console.log("提交数据:", {
              ...curData,
              SensorConfigs: jsonConfig
            });

            message(t(messageKey, { type: curData.SensorType }), {
              type: "success"
            });
            done();
            onSearch();
          } catch (error) {
            console.log(error);
            message(t("sensorManage.sensorType.message.validateError"), {
              type: "error"
            });
          }
        }

        FormRef.validate(valid => {
          if (valid) {
            if (title === "新增") {
              // TODO: 调用新增接口
              chores();
            } else {
              // TODO: 调用修改接口
              chores();
            }
          }
        });
      }
    });
  }

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    tableKey, // 导出 tableKey
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
