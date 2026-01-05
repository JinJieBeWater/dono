import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userEvents, useUserStore } from "@/stores/user";
import { useStoreRegistry } from "@livestore/react";
import { novelStoreOptions } from "@/stores/novel";
import { id } from "@/utils/id";

const createNovelDialog = AlertDialogPrimitive.createHandle();

export function CreateNovelDialog() {
  const storeRegistry = useStoreRegistry();
  const userStore = useUserStore();
  const [newNovelTitle, setNewNovelTitle] = useState("");

  const createNovel = () => {
    if (!newNovelTitle.trim()) return;
    const newNovelId = id();
    const date = new Date();
    userStore.commit(
      userEvents.novelCreated({
        id: newNovelId,
        title: newNovelTitle,
        created: date,
        modified: date,
      }),
      userEvents.uiStateSet({ lastAccessedNovelId: newNovelId }),
    );
    storeRegistry.preload(novelStoreOptions(newNovelId));
    setNewNovelTitle("");
  };

  return (
    <AlertDialog handle={createNovelDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Novel</AlertDialogTitle>
          <AlertDialogDescription>Enter a title for your new novel</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="novel-title">Novel Title</Label>
          <Input
            id="novel-title"
            placeholder="Enter novel title..."
            value={newNovelTitle}
            onChange={(e) => setNewNovelTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createNovel();
                createNovelDialog.close();
              }
            }}
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setNewNovelTitle("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={createNovel} disabled={!newNovelTitle.trim()}>
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { createNovelDialog };
