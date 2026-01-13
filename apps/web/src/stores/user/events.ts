import { Events, Schema } from "@livestore/livestore";
import { uiState } from "./schema/ui-state";

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
  novelRestored: Events.synced({
    name: "v1.NovelRestored",
    schema: Schema.Struct({
      id: Schema.String,
      modified: Schema.DateFromNumber,
    }),
  }),
  novelPurged: Events.synced({
    name: "v1.NovelPurged",
    schema: Schema.Struct({
      id: Schema.String,
      purged: Schema.DateFromNumber,
    }),
  }),
  uiStateSet: uiState.set,
};

export const userEvents = {
  ...novelEvents,
};
