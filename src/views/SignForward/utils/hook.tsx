import { onMounted, ref } from "vue";
import { getSignOffHistoryList, getSignOffList } from "@/api/signForward";
import { useUserStoreHook } from "@/store/modules/user";
import type { SignForwardItem } from "@/components/ReSignForward/types";

export function useSignForwardList() {
  const pendingList = ref<SignForwardItem[]>([]);
  const historyList = ref<SignForwardItem[]>([]);
  const pendingLoading = ref(false);
  const historyLoading = ref(false);

  async function loadPending() {
    pendingLoading.value = true;
    try {
      const userAccount = useUserStoreHook().username;
      const res = await getSignOffList({ userAccount });
      const raw = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];
      pendingList.value = raw.map((item: any) =>
        typeof item === "string"
          ? {
              proclnsId: item,
              applicant: "",
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
      const res = await getSignOffHistoryList({ userAccount });
      const raw = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
          ? (res as any).data
          : [];
      historyList.value = raw.map((item: any) =>
        typeof item === "string"
          ? {
              proclnsId: item,
              applicant: "",
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
