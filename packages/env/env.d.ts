import { type server } from "@dono/infra/alchemy.run";
import type { CfTypes, SyncBackendRpcInterface } from "@livestore/sync-cf/cf-worker";
import { YDurableObjects } from "y-durableobjects";

// This file infers types for the cloudflare:workers environment from your Alchemy Worker.
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

export type CloudflareEnv = Omit<typeof server.Env, "SYNC_BACKEND_DO" | "Y_DURABLE_OBJECTS"> & {
  readonly SYNC_BACKEND_DO: CfTypes.DurableObjectNamespace<SyncBackendRpcInterface>;
  readonly Y_DURABLE_OBJECTS: DurableObjectNamespace<
    YDurableObjects<{
      Bindings: Env;
    }>
  >;
};

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}
