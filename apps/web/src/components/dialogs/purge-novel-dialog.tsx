import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogPrimitive,
} from "@/components/ui/alert-dialog";
import { userEvents } from "@dono/stores/user";
import { useUserStore } from "@/stores/user";

interface PurgeNovelPayload {
  novelId: string;
  novelTitle: string;
}

const purgeNovelDialog = AlertDialogPrimitive.createHandle<PurgeNovelPayload>();

export function PurgeNovelDialog() {
  const userStore = useUserStore();

  function handlePurge(novelId: string): void {
    userStore.commit(userEvents.novelPurged({ id: novelId, purged: new Date() }));
  }

  return (
    <AlertDialog<PurgeNovelPayload> handle={purgeNovelDialog}>
      {({ payload }) => {
        if (!payload) return null;
        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Forever?</AlertDialogTitle>
              <AlertDialogDescription>
                "{payload.novelTitle}" will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handlePurge(payload.novelId)} variant="destructive">
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        );
      }}
    </AlertDialog>
  );
}

export { purgeNovelDialog };
