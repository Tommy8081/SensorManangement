import dayjs from "dayjs";
import editForm from "../form.vue";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import type { FormItemProps } from "../utils/types";
import type { PaginationProps } from "@pureadmin/table";
import { deviceDetection } from "@pureadmin/utils";
import { reactive, ref, onMounted, h } from "vue";
import { useI18n } from "vue-i18n";
import SvidDataViewer from "../components/SvidDataViewer.vue";

export function useSensor() {
  const { t } = useI18n();
  const form = reactive({
    SensorName: "",
    SensorType: "",
    Enable: "" // 保持为空字符串，清除时为 ""
  });
  const formRef = ref();
  const dataList = ref<FormItemProps[]>([]);
  const loading = ref(true);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: t("sensorManage.sensorList.table.sensorName"),
      prop: "SensorName",
      minWidth: 120
    },
    {
      label: t("sensorManage.sensorList.table.sensorType"),
      prop: "SensorType",
      minWidth: 100
    },
    {
      label: t("sensorManage.sensorList.table.portType"),
      prop: "PortType",
      minWidth: 100
    },
    {
      label: t("sensorManage.sensorList.table.wsid"),
      prop: "WSID",
      minWidth: 100
    },
    {
      label: t("sensorManage.sensorList.table.location"),
      prop: "Location",
      minWidth: 120
    },
    {
      label: t("sensorManage.sensorList.table.eqpid"),
      prop: "EQPID",
      minWidth: 100
    },
    {
      label: t("sensorManage.sensorList.table.ip"),
      prop: "IP",
      minWidth: 120
    },
    {
      label: t("sensorManage.sensorList.table.stationNo"),
      prop: "StationNo",
      minWidth: 100
    },
    {
      label: t("sensorManage.sensorList.table.port"),
      prop: "Port",
      minWidth: 80
    },
    {
      label: t("sensorManage.sensorList.table.com"),
      prop: "Com",
      minWidth: 80
    },
    {
      label: t("sensorManage.sensorList.table.enable"),
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.Enable}
          active-value={true}
          inactive-value={false}
          active-text={t("sensorManage.sensorList.table.enabled")}
          inactive-text={t("sensorManage.sensorList.table.disabled")}
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      ),
      minWidth: 100
    },
    {
      label: t("sensorManage.sensorList.table.lastUpdateUser"),
      prop: "LastUpdateUser",
      minWidth: 120
    },
    {
      label: t("sensorManage.sensorList.table.lastUpdateTime"),
      prop: "LastUpdateTime",
      minWidth: 160,
      formatter: ({ LastUpdateTime }) =>
        dayjs(LastUpdateTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: t("sensorManage.sensorList.table.operation"),
      fixed: "right",
      width: 180,
      slot: "operation"
    }
  ];

  const viewerRef = ref();

  function onChange({ row, index }) {
    const action = row.Enable
      ? t("sensorManage.sensorList.message.disable")
      : t("sensorManage.sensorList.message.enable");

    const confirmMessage = `确认要<strong>${action}</strong>传感器<strong style='color:var(--el-color-primary)'>${row.SensorName}</strong>吗?`;

    ElMessageBox.confirm(
      confirmMessage,
      t("sensorManage.sensorList.message.systemTip"),
      {
        confirmButtonText: t("sensorManage.sensorList.message.confirm"),
        cancelButtonText: t("sensorManage.sensorList.message.cancel"),
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        switchLoadMap.value[index] = Object.assign(
          {},
          switchLoadMap.value[index],
          {
            loading: true
          }
        );
        setTimeout(() => {
          switchLoadMap.value[index] = Object.assign(
            {},
            switchLoadMap.value[index],
            {
              loading: false
            }
          );
          const successKey = row.Enable
            ? "sensorManage.sensorList.message.enableSuccess"
            : "sensorManage.sensorList.message.disableSuccess";
          message(t(successKey, { name: row.SensorName }), {
            type: "success"
          });
        }, 300);
      })
      .catch(() => {
        row.Enable = !row.Enable;
      });
  }

  function handleDelete(row: FormItemProps) {
    message(
      t("sensorManage.sensorList.message.deleteSuccess", {
        name: row.SensorName
      }),
      {
        type: "success"
      }
    );
    onSearch();
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

  function handleViewSvidData(row: FormItemProps) {
    if (!row.SvidList || row.SvidList.length === 0) {
      message("该传感器没有配置 SVID 列表", { type: "warning" });
      return;
    }

    addDialog({
      title: "SVID 数据查看",
      props: {
        sensorName: row.SensorName,
        svidList: row.SvidList
      },
      width: "800px",
      draggable: true,
      fullscreen: deviceDetection(),
      fullscreenIcon: true,
      closeOnClickModal: false,
      hideFooter: true,
      contentRenderer: () =>
        h(SvidDataViewer, {
          ref: viewerRef,
          sensorName: row.SensorName,
          svidList: row.SvidList
        }),
      beforeClose: done => {
        // 清理定时器
        if (viewerRef.value?.cleanup) {
          viewerRef.value.cleanup();
        }
        done();
      }
    });
  }

  async function onSearch() {
    loading.value = true;

    // 构建查询参数，过滤掉 null 值

    // TODO: 替换为实际的传感器列表接口
    // const { data } = await getSensorList(queryParams);

    // 模拟数据
    const mockData = {
      list: [] as FormItemProps[],
      total: 0,
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
    const dialogTitle =
      title === "新增"
        ? t("sensorManage.sensorList.dialog.addTitle")
        : t("sensorManage.sensorList.dialog.editTitle");

    addDialog({
      title: dialogTitle,
      props: {
        formInline: {
          SensorType: row?.SensorType ?? "",
          PortType: row?.PortType ?? "",
          SensorName: row?.SensorName ?? "",
          Enable: row?.Enable ?? false,
          WSID: row?.WSID ?? "",
          Location: row?.Location ?? "",
          EQPID: row?.EQPID ?? "",
          IP: row?.IP ?? "",
          StationNo: row?.StationNo ?? 0,
          Port: row?.Port ?? 0,
          Com: row?.Com ?? "",
          LastUpdateUser: row?.LastUpdateUser ?? "",
          LastUpdateTime: row?.LastUpdateTime ?? "",
          SvidList: row?.SvidList ?? [],
          SensorConfigs: row?.SensorConfigs ?? "" // 传递已有配置
        }
      },
      width: "60%",
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
              ? "sensorManage.sensorList.message.addSuccess"
              : "sensorManage.sensorList.message.editSuccess";

          // 提交时包含完整数据
          console.log("提交数据:", {
            ...curData,
            SensorConfigs: curData.SensorConfigs, // JSON 字符串
            SvidList: curData.SvidList
          });

          message(t(messageKey, { name: curData.SensorName }), {
            type: "success"
          });
          done();
          onSearch();
        }

        FormRef.validate(valid => {
          if (valid) {
            if (title === "新增") {
              // TODO: 调用新增传感器接口
              // await addSensor(curData);
              chores();
            } else {
              // TODO: 调用修改传感器接口
              // await updateSensor(curData);
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
    onSearch,
    resetForm,
    openDialog,
    handleDelete,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange,
    handleViewSvidData
  };
}
