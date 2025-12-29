import { Events, Schema } from "@livestore/livestore";

const novelEvents = {
  novelCreated: Events.synced({
    name: "v1.NovelCreated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      created: Schema.DateFromNumber,
      modified: Schema.DateFromNumber,
    }),
  }),
  novelTitleUpdated: Events.synced({
    name: "v1.NovelTitleUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      modified: Schema.DateFromNumber,
    }),
  }),
  novelDeleted: Events.synced({
    name: "v1.NovelDeleted",
    schema: Schema.Struct({
      id: Schema.String,
      deleted: Schema.DateFromNumber,
    }),
  }),
};

export const userEvents = {
  ...novelEvents,
};
