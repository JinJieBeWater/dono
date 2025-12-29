import { Schema, State } from "@livestore/livestore";

export const novel = State.SQLite.table({
  name: "novel",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    title: State.SQLite.text({ default: "" }),
    created: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    modified: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    lastAccessed: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
    deleted: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
  },
});

export type Novel = typeof novel.Type;
