import { novel, type Novel } from "./schema/novel";
import { makeSchema, State } from "@livestore/livestore";
import { userEvents } from "./events";

export { novel, type Novel };

export * from "./store";
export * from "./queries";
export * from "./events";

export const tables = {
  novel,
};

export const materializers = State.SQLite.materializers(userEvents, {
  "v1.NovelCreated": (data) =>
    tables.novel.insert({
      id: data.id,
      title: data.title,
      created: data.created,
      modified: data.modified,
    }),
  "v1.NovelTitleUpdated": (data) =>
    tables.novel.update({ title: data.title, modified: data.modified }).where({ id: data.id }),
  "v1.NovelDeleted": (data) =>
    tables.novel.update({ deleted: data.deleted }).where({ id: data.id }),
  "v1.NovelRestored": (data) =>
    tables.novel.update({ deleted: null, modified: data.modified }).where({ id: data.id }),
  "v1.NovelAccessed": (data) =>
    tables.novel.update({ lastAccessed: data.lastAccessed }).where({ id: data.id }),
});

const state = State.SQLite.makeState({ tables, materializers });

export const schema = makeSchema({ events: userEvents, state });
