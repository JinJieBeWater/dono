import { cn } from "@/lib/utils";
import { Editable, EditableInput, EditablePreview } from "./ui/editable";
import { chapter$, novelEvents, useNovelStore } from "@/stores/novel";
import { useParams } from "@tanstack/react-router";

export const ChapterHeader = ({ className, ...props }: React.ComponentProps<typeof Editable>) => {
  const { novelId, chapterId } = useParams({
    from: "/novel/$novelId/$volumeId/$chapterId",
  });
  const novelStore = useNovelStore(novelId);
  const chapter = novelStore.useQuery(chapter$({ chapterId }));

  const handleNovelChange = (newTitle: string) => {
    novelStore.commit(
      novelEvents.chapterTitleUpdated({ id: chapterId, title: newTitle, modified: new Date() }),
    );
  };

  return (
    <Editable
      value={chapter.title}
      onSubmit={handleNovelChange}
      className={cn("mb-4 py-2 border-b font-bold text-2xl", className)}
      {...props}
    >
      <EditablePreview placeholder="Write your chapter title..." className="text-2xl" />
      <EditableInput placeholder="Write your chapter title..." className="text-2xl!" />
    </Editable>
  );
};
