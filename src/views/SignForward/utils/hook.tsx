import { ref, reactive, onMounted } from "vue";
import { message } from "@/utils/message";
import { getSignOffList, assignSignForward } from "@/api/signForward";
import { useUserStoreHook } from "@/store/modules/user";
import type { FormInstance } from "element-plus";

export function useSignForward() {
  const signList = ref<string[]>([]);
  const loading = ref(false);

  const columns: TableColumnList = [
    {
      label: "序号",
      type: "index",
      width: 70,
      fixed: "left"
    },
    {
      label: "流程单号",
      prop: "proclnsId",
      minWidth: 200
    },
    {
      label: "操作",
      fixed: "right",
      width: 120,
      slot: "operation"
    }
  ];

  // 传签对话框
  const dialogVisible = ref(false);
  const currentProclnsId = ref("");
  const assignForm = reactive({ toAccount: "", remark: "" });
  const assignFormRef = ref<FormInstance>();
  const assignLoading = ref(false);

  async function onSearch() {
    loading.value = true;
    try {
      const userAccount = useUserStoreHook().username;
      const response = await getSignOffList({ userAccount });
      // 兼容 response 直接是数组 或 response.data 是数组两种情况
      let list: string[] = [];
      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray((response as any)?.data)) {
        list = (response as any).data;
      }
      signList.value = list;
    } catch (error) {
      console.error("获取待传签列表失败:", error);
      signList.value = [];
    } finally {
      loading.value = false;
    }
  }

  function openAssignDialog(proclnsId: string) {
    currentProclnsId.value = proclnsId;
    assignForm.toAccount = "";
    assignForm.remark = "";
    dialogVisible.value = true;
  }

  async function handleAssign() {
    if (!assignFormRef.value) return;
    await assignFormRef.value.validate(async valid => {
      if (!valid) return;
      assignLoading.value = true;
      try {
        await assignSignForward({
          action: "Assign",
          fromAccount: useUserStoreHook().username,
          proclnsId: currentProclnsId.value,
          remark: assignForm.remark,
          toAccount: assignForm.toAccount
        });
        message("传签成功", { type: "success" });
        dialogVisible.value = false;
        onSearch();
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message || error?.message || String(error);
        message("传签失败：" + errorMsg, { type: "error" });
      } finally {
        assignLoading.value = false;
      }
    });
  }

  function handleCancel() {
    dialogVisible.value = false;
  }

  onMounted(() => {
    onSearch();
  });

  return {
    signList,
    loading,
    columns,
    onSearch,
    dialogVisible,
    currentProclnsId,
    assignForm,
    assignFormRef,
    assignLoading,
    openAssignDialog,
    handleAssign,
    handleCancel
  };
}
