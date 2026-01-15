import { Events, Schema } from "@livestore/livestore";

const volumeEvents = {
  volumeCreated: Events.synced({
    name: "v1.VolumeCreated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      created: Schema.DateFromNumber,
      modified: Schema.DateFromNumber,
    }),
  }),
  volumeTitleUpdated: Events.synced({
    name: "v1.VolumeTitleUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      modified: Schema.DateFromNumber,
    }),
  }),
  volumeDeleted: Events.synced({
    name: "v1.VolumeDeleted",
    schema: Schema.Struct({
      id: Schema.String,
      deleted: Schema.DateFromNumber,
    }),
  }),
};

const chapterEvents = {
  chapterCreated: Events.synced({
    name: "v1.ChapterCreated",
    schema: Schema.Struct({
      id: Schema.String,
      volumeId: Schema.String,
      title: Schema.String,
      order: Schema.String,
      created: Schema.DateFromNumber,
      modified: Schema.DateFromNumber,
    }),
  }),
  chapterTitleUpdated: Events.synced({
    name: "v1.ChapterTitleUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      title: Schema.String,
      modified: Schema.DateFromNumber,
    }),
  }),
  chapterBodyUpdated: Events.synced({
    name: "v1.ChapterBodyUpdated",
    schema: Schema.Struct({
      id: Schema.String,
      body: Schema.String,
      modified: Schema.DateFromNumber,
    }),
  }),
  chapterMoved: Events.synced({
    name: "v1.ChapterMoved",
    schema: Schema.Struct({
      id: Schema.String,
      order: Schema.String,
      modified: Schema.DateFromNumber,
    }),
  }),
  chapterDeleted: Events.synced({
    name: "v1.ChapterDeleted",
    schema: Schema.Struct({
      id: Schema.String,
      deleted: Schema.DateFromNumber,
    }),
  }),
};

export const novelEvents = {
  ...volumeEvents,
  ...chapterEvents,
};
