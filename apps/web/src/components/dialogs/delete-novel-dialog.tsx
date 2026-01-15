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

const deleteNovelDialog = AlertDialogPrimitive.createHandle<{
  novelId: string;
  novelTitle: string;
}>();

export function DeleteNovelDialog() {
  const userStore = useUserStore();

  const handleDelete = (novelId: string) => {
    userStore.commit(
      userEvents.novelDeleted({
        id: novelId,
        deleted: new Date(),
      }),
    );
  };

  return (
    <AlertDialog<{ novelId: string; novelTitle: string }> handle={deleteNovelDialog}>
      {({ payload }: { payload?: { novelId: string; novelTitle: string } }) => {
        if (!payload) return null;
        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Novel?</AlertDialogTitle>
              <AlertDialogDescription>
                "{payload.novelTitle}" will be moved to trash. This action can be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDelete(payload.novelId)}
                variant={"destructive"}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        );
      }}
    </AlertDialog>
  );
}

export { deleteNovelDialog };
