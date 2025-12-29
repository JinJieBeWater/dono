import { queryDb } from "@livestore/livestore";
import { tables } from ".";

export const visibleVolumes$ = () =>
  queryDb(
    () => {
      return tables.volume.where({
        deleted: null,
      });
    },
    { label: "visibleVolumes" },
  );
