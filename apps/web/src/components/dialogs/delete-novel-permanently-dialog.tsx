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

const deleteNovelPermanentlyDialog = AlertDialogPrimitive.createHandle<{
  novelId: string;
  novelTitle: string;
}>();

export function DeleteNovelPermanentlyDialog() {
  const handleDeleteForever = (novelId: string) => {
    console.log("永久删除小说:", novelId);
  };

  return (
    <AlertDialog<{ novelId: string; novelTitle: string }> handle={deleteNovelPermanentlyDialog}>
      {({ payload }: { payload?: { novelId: string; novelTitle: string } }) => {
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
              <AlertDialogAction
                onClick={() => handleDeleteForever(payload.novelId)}
                variant={"destructive"}
              >
                Delete Forever
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        );
      }}
    </AlertDialog>
  );
}

export { deleteNovelPermanentlyDialog };
