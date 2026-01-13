import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";

import Editor from "./editor";
import { getChapterRoomId } from "@/utils/get-room-id";

export function ChapterEditArea() {
  const { novelId, chapterId } = useParams({
    from: "/novel/$novelId/$volumeId/$chapterId",
  });

  const roomId = getChapterRoomId(novelId, chapterId);

  return (
    <Editor
      placeholder="Write your chapter content here..."
      className={cn("px-1 pb-[70svh]")}
      room={roomId}
    />
  );
}
