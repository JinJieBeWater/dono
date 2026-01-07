import { id } from "@/utils/id";
import { novelEvents, novelTables } from ".";
import type { useNovelStore } from "./store";
import { generateKeyBetween } from "fractional-indexing";

export function createChapter(
  novelStore: ReturnType<typeof useNovelStore>,
  params: {
    volumeId: string;
    title?: string;
  },
) {
  const newId = id();
  const date = new Date();
  const highestOrder = novelStore.query(
    novelTables.chapter
      .select("order")
      .where({
        volumeId: params.volumeId,
      })
      .orderBy("order", "desc")
      .limit(1),
  )[0];

  const order = generateKeyBetween(highestOrder, null);

  const data: Parameters<typeof novelEvents.chapterCreated>[0] = {
    id: newId,
    volumeId: params.volumeId,
    title: params.title ?? "",
    order,
    created: date,
    modified: date,
  };

  novelStore.commit(novelEvents.chapterCreated(data));

  return data;
}
