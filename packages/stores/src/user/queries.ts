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

export const novel$ = ({ novelId }: { novelId: string }) =>
  queryDb(
    () => {
      return userTables.novel.where({ id: novelId }).first({
        behaviour: "error",
      });
    },
    {
      label: "novel",
      deps: [novelId],
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
