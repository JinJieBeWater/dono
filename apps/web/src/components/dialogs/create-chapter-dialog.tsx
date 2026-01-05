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
import { novelEvents, novelTables } from "@/stores/novel";
import { useNovelStore } from "@/stores/novel";
import { id } from "@/utils/id";
import { useNavigate, useParams } from "@tanstack/react-router";
import { generateKeyBetween } from "fractional-indexing";

const createChapterDialog = AlertDialogPrimitive.createHandle<{ volumeId: string }>();

export function CreateChapterDialog() {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });
  const novelStore = useNovelStore(novelId);
  const [chapterTitle, setChapterTitle] = useState("");
  const navigate = useNavigate();

  const handleCreate = (volumeId: string) => {
    const newId = id();
    const date = new Date();
    const highestOrder = novelStore.query(
      novelTables.chapter
        .select("order")
        .where({
          volumeId,
        })
        .orderBy("order", "desc")
        .limit(1),
    )[0];

    const order = generateKeyBetween(highestOrder, null);

    novelStore.commit(
      novelEvents.chapterCreated({
        id: newId,
        volumeId,
        title: chapterTitle,
        order,
        created: date,
        modified: date,
      }),
    );
    setChapterTitle("");
    navigate({
      to: "/novel/$novelId/$volumeId/$chapterId",
      params: {
        novelId,
        volumeId,
        chapterId: newId,
      },
    });
  };

  return (
    <AlertDialog<{ volumeId: string }> handle={createChapterDialog}>
      {({ payload }: { payload?: { volumeId: string } }) => {
        if (!payload) return null;
        return (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Chapter</AlertDialogTitle>
              <AlertDialogDescription>Enter a title for the new chapter</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <Label htmlFor="chapter-title">Chapter Title</Label>
              <Input
                id="chapter-title"
                placeholder="Enter chapter title..."
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreate(payload.volumeId);
                    createChapterDialog.close();
                  }
                }}
                autoFocus
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setChapterTitle("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleCreate(payload.volumeId)}
                disabled={!chapterTitle.trim()}
              >
                Create
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        );
      }}
    </AlertDialog>
  );
}

export { createChapterDialog };
