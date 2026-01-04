import { volume, type Volume } from "./schema/volume";
import { chapter, type Chapter } from "./schema/chapter";
import { makeSchema, State } from "@livestore/livestore";
import { novelEvents } from "./events";

export { volume, chapter, type Volume, type Chapter };

export * from "./store";
export * from "./queries";
export * from "./events";

export const novelTables = {
  volume,
  chapter,
};

export const materializers = State.SQLite.materializers(novelEvents, {
  "v1.VolumeCreated": (data) =>
    novelTables.volume.insert({
      id: data.id,
      title: data.title,
      created: data.created,
      modified: data.modified,
    }),
  "v1.VolumeTitleUpdated": (data) =>
    novelTables.volume
      .update({ title: data.title, modified: data.modified })
      .where({ id: data.id }),
  "v1.VolumeDeleted": (data) =>
    novelTables.volume.update({ deleted: data.deleted }).where({ id: data.id }),

  "v1.ChapterCreated": (data) =>
    novelTables.chapter.insert({
      id: data.id,
      volumeId: data.volumeId,
      title: data.title,
      order: data.order,
      created: data.created,
      modified: data.modified,
    }),
  "v1.ChapterTitleUpdated": (data) =>
    novelTables.chapter
      .update({ title: data.title, modified: data.modified })
      .where({ id: data.id }),
  "v1.ChapterBodyUpdated": (data) =>
    novelTables.chapter.update({ modified: data.modified }).where({ id: data.id }),
  "v1.ChapterMoved": (data) =>
    novelTables.chapter
      .update({ order: data.order, modified: data.modified })
      .where({ id: data.id }),

  "v1.ChapterDeleted": (data) =>
    novelTables.chapter.update({ deleted: data.deleted }).where({ id: data.id }),
});

const state = State.SQLite.makeState({ tables: novelTables, materializers });

export const schema = makeSchema({ events: novelEvents, state });
