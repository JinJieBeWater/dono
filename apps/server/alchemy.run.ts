import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
import { D1Database, DurableObjectNamespace } from "alchemy/cloudflare";
import { config } from "dotenv";
import path from "path";

config({ path: path.join(import.meta.dirname, ".env") });

const app = await alchemy("server");

const db = await D1Database("auth_db", {
  name: `${app.name}-${app.stage}-auth-db`,
  migrationsDir: "../../packages/db/src/migrations",
});

const syncBackendDO = DurableObjectNamespace("SYNC_BACKEND_DO", {
  className: "SyncBackendDO",
  sqlite: true,
});

export const server = await Worker("server", {
  entrypoint: path.join(import.meta.dirname, "src", "index.ts"),
  compatibility: "node",
  bindings: {
    DB: db,
    SYNC_BACKEND_DO: syncBackendDO,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
  },
  dev: {
    port: 3000,
  },
});

console.log(`Server -> ${server.url}`);

await app.finalize();
