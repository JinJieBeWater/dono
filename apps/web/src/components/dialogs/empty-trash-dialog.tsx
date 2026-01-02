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

const emptyTrashDialog = AlertDialogPrimitive.createHandle<{ count: number }>();

export function EmptyTrashDialog() {
  const userStore = useUserStore();
  const trashedNovels = userStore.useQuery(trashedNovels$());

  const handleEmptyTrash = () => {
    trashedNovels.forEach((novel) => {
      userStore.commit(
        userEvents.novelDeleted({
          id: novel.id,
          deleted: new Date(),
        }),
      );
    });
  };

  return (
    <AlertDialog<{ count: number }> handle={emptyTrashDialog}>
      {({ payload }: { payload?: { count: number } }) => {
        const count = payload?.count ?? trashedNovels.length;
        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
              <AlertDialogDescription>
                All {count} {count === 1 ? "item" : "items"} will be permanently deleted. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleEmptyTrash} variant={"destructive"}>
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
