import { useNovelStore } from "@/stores/novel";
import { novelEvents } from "@/stores/novel";
import { id } from "@/utils/id";

/**
 * 创建章节的自定义 Hook
 * @param novelId 小说 ID
 * @param volumeId 卷 ID（可选，如果不传则创建到指定的卷）
 * @returns 创建章节的函数
 */
export function useCreateChapter(novelId: string, volumeId?: string) {
  const novelStore = useNovelStore(novelId);

  const createChapter = (params: { title: string; volumeId?: string; order?: string }) => {
    const date = new Date();
    const finalVolumeId = volumeId || params.volumeId;

    if (!finalVolumeId) {
      throw new Error("volumeId is required");
    }

    novelStore.commit(
      novelEvents.chapterCreated({
        id: id(),
        volumeId: finalVolumeId,
        title: params.title,
        order: params.order || "",
        created: date,
        modified: date,
      }),
    );
  };

  return { createChapter };
}
