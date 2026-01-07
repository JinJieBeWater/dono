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
      className={cn("mb-4", className)}
      {...props}
    >
      <EditablePreview placeholder="Unamed Chapter" className="text-2xl font-bold py-2 border-b" />
      <EditableInput className="text-2xl font-bold py-2 border-b" />
    </Editable>
  );
};
