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
import { userEvents, useUserStore, trashedNovels$ } from "@/stores/user";

interface EmptyTrashPayload {
  count: number;
}

const emptyTrashDialog = AlertDialogPrimitive.createHandle<EmptyTrashPayload>();

export function EmptyTrashDialog() {
  const userStore = useUserStore();
  const trashedNovels = userStore.useQuery(trashedNovels$());

  function handleEmptyTrash(): void {
    const now = new Date();
    for (const novel of trashedNovels) {
      userStore.commit(userEvents.novelPurged({ id: novel.id, purged: now }));
    }
  }

  return (
    <AlertDialog<EmptyTrashPayload> handle={emptyTrashDialog}>
      {({ payload }) => {
        const count = payload?.count ?? trashedNovels.length;
        const itemLabel = count === 1 ? "item" : "items";
        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
              <AlertDialogDescription>
                All {count} {itemLabel} will be permanently deleted. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEmptyTrash} variant="destructive">
                Empty Trash
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        );
      }}
    </AlertDialog>
  );
}

export { emptyTrashDialog };
