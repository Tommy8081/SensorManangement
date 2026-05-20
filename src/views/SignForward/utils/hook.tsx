import { onMounted, ref } from "vue";
import { getSignOffHistoryList, getSignOffList } from "@/api/signForward";
import { useUserStoreHook } from "@/store/modules/user";
import type { SignForwardItem } from "@/components/ReSignForward/types";

export function useSignForwardList() {
  const pendingList = ref<SignForwardItem[]>([]);
  const historyList = ref<SignForwardItem[]>([]);
  const pendingLoading = ref(false);
  const historyLoading = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(20);

  async function loadPending() {
    pendingLoading.value = true;
    try {
      const userAccount = useUserStoreHook().username;
      const res = await getSignOffList({
        userAccount,
        pageNo: pageNo.value,
        pageSize: pageSize.value
      });
      const data = (res as any)?.data ?? res;
      const raw = Array.isArray(data?.list) ? data.list : [];
      pendingList.value = raw.map((item: any) =>
        typeof item === "string"
          ? {
              ORDER_NO: item,
              SUBMITTER: "",
              changeContent: "{}",
              createTime: "",
              status: "pending" as const
            }
          : { ...item, status: "pending" as const }
      );
    } catch {
      pendingList.value = [];
    } finally {
      pendingLoading.value = false;
    }
  }

  async function loadHistory() {
    historyLoading.value = true;
    try {
      const userAccount = useUserStoreHook().username;
      const res = await getSignOffHistoryList({
        userAccount,
        pageNo: pageNo.value,
        pageSize: pageSize.value
      });
      const data = (res as any)?.data ?? res;
      const raw = Array.isArray(data?.list) ? data.list : [];
      historyList.value = raw.map((item: any) =>
        typeof item === "string"
          ? {
              ORDER_NO: item,
              SUBMITTER: "",
              changeContent: "{}",
              createTime: "",
              status: "done" as const
            }
          : { ...item, status: "done" as const }
      );
    } catch {
      historyList.value = [];
    } finally {
      historyLoading.value = false;
    }
  }

  onMounted(() => {
    loadPending();
    loadHistory();
  });

  return {
    pendingList,
    historyList,
    pendingLoading,
    historyLoading,
    loadPending,
    loadHistory
  };
}
