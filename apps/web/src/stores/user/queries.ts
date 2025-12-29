import { queryDb } from "@livestore/livestore";
import { tables } from ".";

export const visibleNovels$ = () =>
  queryDb(
    () => {
      return tables.novel.where({
        deleted: null,
      });
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
