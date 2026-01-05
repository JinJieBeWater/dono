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
import { novelEvents, useNovelStore } from "@/stores/novel";
import { useParams } from "@tanstack/react-router";
import { id } from "@/utils/id";

const createVolumeDialog = AlertDialogPrimitive.createHandle();

export function CreateVolumeDialog() {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });
  const novelStore = useNovelStore(novelId);
  const [volumeTitle, setVolumeTitle] = useState("");

  const handleCreateVolume = (title: string) => {
    const date = new Date();
    novelStore.commit(
      novelEvents.volumeCreated({
        id: id(),
        title,
        created: date,
        modified: date,
      }),
    );
    setVolumeTitle("");
  };

  return (
    <AlertDialog handle={createVolumeDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Create New Volume</AlertDialogTitle>
          <AlertDialogDescription>Enter a title for the new volume</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="volume-title">Volume Title</Label>
          <Input
            id="volume-title"
            placeholder="Enter volume title..."
            value={volumeTitle}
            onChange={(e) => setVolumeTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateVolume(volumeTitle);
                createVolumeDialog.close();
              }
            }}
            autoFocus
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setVolumeTitle("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleCreateVolume(volumeTitle)}
            disabled={!volumeTitle.trim()}
          >
            Create
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { createVolumeDialog };
