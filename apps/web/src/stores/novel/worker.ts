import { makeWorker } from "@livestore/adapter-web/worker";
import { makeWsSync } from "@livestore/sync-cf/client";
import { schema } from ".";
import { env } from "@dono/env/web";

makeWorker({
  schema,
  sync: {
    // Use /sync path to avoid Assets binding intercepting root path requests (alternative: wrangler.toml `run_worker_first = true` but less efficient)
    backend: makeWsSync({ url: `${env.VITE_SERVER_URL}/sync` }),
  },
});
