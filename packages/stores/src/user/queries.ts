import { queryDb } from "@livestore/livestore";
import { userTables } from "./tables";

export const visibleNovels$ = () =>
  queryDb(
    () => {
      return userTables.novel
        .where({
          deleted: null,
        })
        .orderBy("created", "desc");
    },
    { label: "visibleNovels" },
  );

export const novel$ = ({ novelId, visible }: { novelId: string; visible?: boolean }) =>
  queryDb(
    () => {
      return userTables.novel
        .where({
          id: novelId,
          ...(visible
            ? {
                deleted: null,
              }
            : {}),
        })
        .first();
    },
    {
      label: "novel",
      deps: [novelId, visible ? 1 : 0],
    },
  );

export const trashedNovels$ = () =>
  queryDb(
    () => {
      return userTables.novel
        .where({
          deleted: { op: "!=", value: null },
        })
        .orderBy("deleted", "desc");
    },
    { label: "trashedNovels" },
  );
