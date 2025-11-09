import dayjs from "dayjs";
import editForm from "../form.vue";
import ConfigViewer from "../components/ConfigViewer.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h } from "vue";
import { parseINI, stringifyINI } from "./iniParser";

export function useSensorType() {
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

  const columns: TableColumnList = [
    {
      label: "传感器类型",
      prop: "SensorType",
      minWidth: 120
    },
    {
      label: "传感器描述",
      prop: "SensorDesc",
      minWidth: 200
    },
    {
      label: "传感器配置",
      prop: "SensorConfigs",
      minWidth: 120,
      cellRenderer: ({ row }) => (
        <el-button type="primary" link onClick={() => handleViewConfig(row)}>
          查看配置
        </el-button>
      )
    },
    {
      label: "创建时间",
      prop: "CreateTime",
      minWidth: 160,
      formatter: ({ CreateTime }) =>
        CreateTime ? dayjs(CreateTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "更新时间",
      prop: "UpdateTime",
      minWidth: 160,
      formatter: ({ UpdateTime }) =>
        UpdateTime ? dayjs(UpdateTime).format("YYYY-MM-DD HH:mm:ss") : "-"
    },
    {
      label: "操作",
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  function handleViewConfig(row: FormItemProps) {
    let configObj;
    try {
      // 尝试解析 JSON 字符串
      configObj = JSON.parse(row.SensorConfigs);
    } catch {
      message("配置数据格式错误", { type: "error" });
      return;
    }

    addDialog({
      title: "配置查看",
      props: {
        config: configObj,
        sensorType: row.SensorType
      },
      width: "700px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      hideFooter: true,
      contentRenderer: () =>
        h(ConfigViewer, {
          config: configObj,
          sensorType: row.SensorType
        })
    });
  }

  function handleDelete(row: FormItemProps) {
    ElMessageBox.confirm(
      `确认要删除传感器类型"${row.SensorType}"吗？`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true
      }
    )
      .then(() => {
        // TODO: 调用删除接口
        message(`已删除传感器类型 ${row.SensorType}`, { type: "success" });
        onSearch();
      })
      .catch(() => {});
  }

  function handleSizeChange(val: number) {
    pagination.pageSize = val;
    onSearch();
  }

  function handleCurrentChange(val: number) {
    pagination.currentPage = val;
    onSearch();
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    // TODO: 替换为实际的传感器类型列表接口

    // 模拟数据
    const mockData = {
      list: [
        {
          SensorType: "Temperature",
          SensorDesc: "温度传感器",
          SensorConfigs: JSON.stringify({
            General: {
              unit: "℃",
              protocol: "Modbus RTU",
              enable: true
            },
            Range: {
              min: -40,
              max: 125
            },
            Communication: {
              baudRate: 9600,
              dataBits: 8,
              stopBits: 1,
              parity: "None",
              address: 1
            }
          }),
          CreateTime: "2024-01-15 10:30:00",
          UpdateTime: "2024-01-20 15:45:00"
        },
        {
          SensorType: "Humidity",
          SensorDesc: "湿度传感器",
          SensorConfigs: JSON.stringify({
            General: {
              unit: "%RH",
              protocol: "I2C",
              enable: true
            },
            Range: {
              min: 0,
              max: 100
            },
            Communication: {
              address: 0x40,
              timeout: 1000
            }
          }),
          CreateTime: "2024-01-16 09:20:00",
          UpdateTime: "2024-01-21 11:30:00"
        }
      ] as FormItemProps[],
      total: 2,
      pageSize: 10,
      currentPage: 1
    };

    dataList.value = mockData.list;
    pagination.total = mockData.total;
    pagination.pageSize = mockData.pageSize;
    pagination.currentPage = mockData.currentPage;

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
    // 如果是编辑，需要将 JSON 转回 INI 格式
    let iniConfig = "";
    if (row?.SensorConfigs) {
      try {
        const configObj = JSON.parse(row.SensorConfigs);
        // 将 JSON 对象转换为 INI 格式
        iniConfig = stringifyINI(configObj);
      } catch (e) {
        console.error("配置解析失败", e);
      }
    }

    addDialog({
      title: `${title}传感器类型`,
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
          message(`您${title}了传感器类型${curData.SensorType}`, {
            type: "success"
          });
          done();
          onSearch();
        }

        FormRef.validate(valid => {
          if (valid) {
            // 将 INI 格式转换为 JSON 字符串
            try {
              const configObj = parseINI(curData.SensorConfigs);
              const jsonConfig = JSON.stringify(configObj);

              console.log("提交数据:", {
                SensorType: curData.SensorType,
                SensorDesc: curData.SensorDesc,
                SensorConfigs: jsonConfig
              });

              if (title === "新增") {
                // TODO: 调用新增传感器类型接口
                // await addSensorType({ ...curData, SensorConfigs: jsonConfig });
                chores();
              } else {
                // TODO: 调用修改传感器类型接口
                // await updateSensorType({ ...curData, SensorConfigs: jsonConfig });
                chores();
              }
            } catch {
              message("配置格式转换失败", { type: "error" });
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
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
