import { Schema, State } from "@livestore/livestore";

export const volume = State.SQLite.table({
  name: "volume",
  columns: {
    id: State.SQLite.text({ primaryKey: true }),
    title: State.SQLite.text({ default: "" }),
    created: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    modified: State.SQLite.integer({ schema: Schema.DateFromNumber }),
    deleted: State.SQLite.integer({ nullable: true, schema: Schema.DateFromNumber }),
  },
});

export type Volume = typeof volume.Type;
