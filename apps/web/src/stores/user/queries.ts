import { queryDb } from "@livestore/livestore";
import { tables } from ".";

// 常规可见的小说
export const visibleNovels$ = () =>
  queryDb(
    () => {
      return tables.novel
        .where({
          deleted: null,
        })
        .orderBy("modified", "desc");
    },
    { label: "visibleNovels" },
  );

export const novel$ = ({ novelId }: { novelId: string }) =>
  queryDb(
    () => {
      return tables.novel.where({ id: novelId }).first();
    },
    { label: "novel" },
  );

// 处于回收站的小说
export const trashedNovels$ = () =>
  queryDb(
    () => {
      return tables.novel
        .where({
          deleted: { op: "!=", value: null },
        })
        .orderBy("deleted", "desc");
    },
    { label: "trashedNovels" },
  );
