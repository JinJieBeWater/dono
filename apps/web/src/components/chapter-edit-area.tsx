import { cn } from "@/lib/utils";
import Editor from "./editor";
import { useParams } from "@tanstack/react-router";
import { getChapterRoomId } from "@/utils/get-room-id";

export const ChapterEditArea = () => {
  const chapterId = useParams({
    from: "/novel/$novelId/$volumeId/$chapterId",
    select: (params) => params.chapterId,
  });

  const roomId = getChapterRoomId(chapterId);

  return (
    <Editor
      placeholder="Write your chapter content here..."
      className={cn("px-1 pb-[70svh]")}
      room={roomId}
    ></Editor>
  );
};
