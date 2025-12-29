import { volume, type Volume } from "./schema/volume";
import { chapter, type Chapter } from "./schema/chapter";
import { makeSchema, State } from "@livestore/livestore";
import { novelEvents } from "./events";

export { volume, chapter, type Volume, type Chapter };

export * from "./store";
export * from "./queries";
export * from "./events";

export const tables = {
  volume,
  chapter,
};

export const materializers = State.SQLite.materializers(novelEvents, {
  "v1.VolumeCreated": (data) =>
    tables.volume.insert({
      id: data.id,
      title: data.title,
      created: data.created,
      modified: data.modified,
    }),
  "v1.VolumeTitleUpdated": (data) =>
    tables.volume.update({ title: data.title, modified: data.modified }).where({ id: data.id }),
  "v1.VolumeDeleted": (data) =>
    tables.volume.update({ deleted: data.deleted }).where({ id: data.id }),

  "v1.ChapterCreated": (data) =>
    tables.chapter.insert({
      id: data.id,
      volumeId: data.volumeId,
      title: data.title,
      order: data.order,
      created: data.created,
      modified: data.modified,
    }),
  "v1.ChapterTitleUpdated": (data) =>
    tables.chapter.update({ title: data.title, modified: data.modified }).where({ id: data.id }),
  "v1.ChapterBodyUpdated": (data) =>
    tables.chapter.update({ body: data.body, modified: data.modified }).where({ id: data.id }),
  "v1.ChapterMoved": (data) =>
    tables.chapter.update({ order: data.order, modified: data.modified }).where({ id: data.id }),

  "v1.ChapterDeleted": (data) =>
    tables.chapter.update({ deleted: data.deleted }).where({ id: data.id }),
});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events: novelEvents, state });
