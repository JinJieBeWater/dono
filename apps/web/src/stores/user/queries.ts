import { queryDb } from "@livestore/livestore";
import { userTables } from ".";

// 常规可见的小说
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
      return userTables.novel.where({ id: novelId }).first();
    },
    { label: "novel" },
  );

// 处于回收站的小说
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
