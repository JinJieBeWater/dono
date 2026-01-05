import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
import { D1Database, DurableObjectNamespace } from "alchemy/cloudflare";
import { config } from "dotenv";
import path from "path";

config({ path: path.join(import.meta.dirname, ".env") });

const app = await alchemy("dono-server");

const db = await D1Database("auth_db", {
  name: `${app.name}-${app.stage}-auth-db`,
  migrationsDir: "../../packages/db/src/migrations",
});

const syncBackendDO = DurableObjectNamespace("SYNC_BACKEND_DO", {
  className: "SyncBackendDO",
  sqlite: true,
});

const yDurableObjects = DurableObjectNamespace("Y_DURABLE_OBJECTS", {
  className: "YDurableObjects",
  sqlite: true,
});

export const server = await Worker("worker", {
  entrypoint: path.join(import.meta.dirname, "src", "index.ts"),
  compatibility: "node",
  bindings: {
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.secret.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    DB: db,
    SYNC_BACKEND_DO: syncBackendDO,
    Y_DURABLE_OBJECTS: yDurableObjects,
  },
  dev: {
    port: 3000,
  },
});

console.log(`Server -> ${server.url}`);

await app.finalize();
