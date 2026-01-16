import alchemy from "alchemy";
import { Worker } from "alchemy/cloudflare";
import { D1Database, DurableObjectNamespace } from "alchemy/cloudflare";
import { config } from "dotenv";
import path from "path";

const ENV_FILE = process.env.NODE_ENV ? `./.env.${process.env.NODE_ENV}` : "./.env";

config({ path: path.join(import.meta.dirname, ENV_FILE), debug: true, override: true });

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

const userClientDO = DurableObjectNamespace("USER_CLIENT_DO", {
  className: "UserClientDO",
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
    USER_CLIENT_DO: userClientDO,
  },
  dev: {
    port: 3000,
  },
});

console.log(`${app.name}-${app.stage}-server -> ${server.url}`);

await app.finalize();
