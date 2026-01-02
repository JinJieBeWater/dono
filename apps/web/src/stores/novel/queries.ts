import { queryDb, sql, Schema } from "@livestore/livestore";
import { novelTables } from ".";
import { chapter } from "./schema/chapter";

export const visibleVolumesCount$ = () =>
  queryDb(
    () => {
      return novelTables.volume.count();
    },
    {
      label: "visibleVolumesCount",
    },
  );

export const visibleVolumes$ = () =>
  queryDb(
    () => {
      return novelTables.volume
        .where({
          deleted: null,
        })
        .orderBy("created", "asc");
    },
    { label: "visibleVolumes" },
  );

export const visibleChaptersCount$ = ({ volumeId }: { volumeId: string }) =>
  queryDb(
    () => {
      return novelTables.chapter.count().where({ volumeId: volumeId });
    },
    {
      label: "visibleChaptersCount",
      deps: [volumeId],
    },
  );

export const visibleChapters$ = () =>
  queryDb(
    () => {
      return novelTables.chapter
        .where({
          deleted: null,
        })
        .orderBy("order", "asc");
    },
    {
      label: "visibleChapters",
    },
  );

export const lastVisibleChapter$ = () =>
  queryDb({
    query: sql`
        SELECT c.* FROM chapter c
        WHERE c.volumeId IN (
          SELECT v.id FROM volume v
          WHERE v.deleted IS NULL
            AND v.id IN (SELECT ch.volumeId FROM chapter ch WHERE ch.deleted IS NULL)
          ORDER BY v.created DESC
          LIMIT 1
        )
        AND c.deleted IS NULL
        ORDER BY c."order" DESC
        LIMIT 1
    `,
    schema: Schema.Array(chapter.rowSchema),
  });
