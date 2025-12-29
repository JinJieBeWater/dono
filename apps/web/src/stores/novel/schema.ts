import { Schema, State } from "@livestore/livestore";

export const volume = State.SQLite.table({
  name: "volume",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    novelId: State.SQLite.text(),
    title: State.SQLite.text({ default: "" }),
    created: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    modified: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    deleted: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
  },
});

export type Volume = typeof volume.Type;

export const chapter = State.SQLite.table({
  name: "chapter",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    volumeId: State.SQLite.text(),
    title: State.SQLite.text({ default: "" }),
    body: State.SQLite.text({ default: "" }),
    /** Fractional index for ordering tasks in the list */
    order: State.SQLite.text({ nullable: false, default: "" }),
    created: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    modified: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    deleted: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
  },
  indexes: [
    /** Index for efficient ordering queries */
    { name: "chapter_order", columns: ["order"] },
  ],
  deriveEvents: true,
});

export type Chapter = typeof chapter.Type;

export const tables = {
  volume,
  chapter,
};
