import { makeWorker } from "@livestore/adapter-web/worker";
import { makeWsSync } from "@livestore/sync-cf/client";
import { schema } from "@dono/stores/user";
import { env } from "@dono/env/web";

makeWorker({
  schema,
  sync: {
    backend: makeWsSync({ url: `${env.VITE_SERVER_URL}/livestore` }),
    initialSyncOptions: {
      _tag: "Blocking",
      timeout: 5000,
    },
  },
});
