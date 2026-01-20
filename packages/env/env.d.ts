import { type server } from "@dono/infra/alchemy.run";
import type { CfTypes } from "@livestore/sync-cf/cf-worker";
// Reason: 使用我们自己扩展的 YDurableObjects，包含 purge() 方法
import type { YDurableObjects } from "../../apps/server/src/do/y-do";
import type { SyncBackendDO } from "../../apps/server/src/do/sync-backend-do";
import type { UserClientDO } from "../../apps/server/src/do/user-client-do";

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

export type CloudflareEnv = Omit<
  typeof server.Env,
  "SYNC_BACKEND_DO" | "Y_DURABLE_OBJECTS" | "USER_CLIENT_DO"
> & {
  readonly SYNC_BACKEND_DO: CfTypes.DurableObjectNamespace<SyncBackendDO>;
  readonly Y_DURABLE_OBJECTS: CfTypes.DurableObjectNamespace<YDurableObjects>;
  readonly USER_CLIENT_DO: CfTypes.DurableObjectNamespace<UserClientDO>;
};

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
