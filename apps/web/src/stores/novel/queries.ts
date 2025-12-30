import { queryDb } from "@livestore/livestore";
import { novelTables } from ".";

export const visibleVolumes$ = () =>
  queryDb(
    () => {
      return novelTables.volume.where({
        deleted: null,
      });
    },
    { label: "visibleVolumes" },
  );
