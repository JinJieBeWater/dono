import { cn } from "@/lib/utils";
import Editor from "./editor";
import { useParams } from "@tanstack/react-router";
import { useLocalUserInfoOrThrow } from "./local-user-info-provider";

export const ChapterEditArea = () => {
  const localUserInfo = useLocalUserInfoOrThrow();

  const chapterId = useParams({
    from: "/novel/$novelId/$volumeId/$chapterId",
    select: (params) => params.chapterId,
  });

  const roomId = `user-${localUserInfo.id}-chapter-${chapterId}`;

  return <Editor className={cn("h-full px-1")} room={roomId}></Editor>;
};
