import { makeSchema, State } from "@livestore/livestore";
import { userEvents } from "./events";
import { userTables } from "./tables";

export const materializers = State.SQLite.materializers(userEvents, {
  "v1.NovelCreated": (data) =>
    userTables.novel.insert({
      id: data.id,
      title: data.title,
      created: data.created,
      modified: data.modified,
    }),
  "v1.NovelTitleUpdated": (data) =>
    userTables.novel.update({ title: data.title, modified: data.modified }).where({ id: data.id }),
  "v1.NovelDeleted": (data) =>
    userTables.novel.update({ deleted: data.deleted }).where({ id: data.id }),
  "v1.NovelRestored": (data) =>
    userTables.novel.update({ deleted: null, modified: data.modified }).where({ id: data.id }),
  "v1.NovelPurged": (data) => userTables.novel.delete().where({ id: data.id }),
});

const state = State.SQLite.makeState({ tables: userTables, materializers });

export const schema = makeSchema({ events: userEvents, state });
