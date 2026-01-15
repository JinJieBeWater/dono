import { generateKeyBetween } from "fractional-indexing";
import type { Store } from "@livestore/livestore";
import { id } from "../utils/id";
import { novelEvents } from "./events";
import { novelTables } from "./tables";
import type { schema } from "./schema";

export function createChapter(
  novelStore: Store<typeof schema>,
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
