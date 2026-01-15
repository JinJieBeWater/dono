import { auth } from "@dono/auth";
import * as SyncBackend from "@livestore/sync-cf/cf-worker";
import { userIdFromStoreId } from "@dono/stores/utils";
import { env } from "@dono/env/server";

export class SyncBackendDO extends SyncBackend.makeDurableObject({
  forwardHeaders: ["Cookie"],
  onPush: async (message, context) => {
    const { storeId, headers } = context;
    // console.log("SyncBackendDO:headers", headers);
    console.log("message", message);
    console.log("context", context);

    const id = env.SYNC_BACKEND_DO.idFromName(storeId);
    const stub = env.SYNC_BACKEND_DO.get(id);
    console.log("stub.name", stub.name);
    console.log("stub", stub);

    const session = await auth.api.getSession({
      headers: headers as HeadersInit,
    });
    // console.log("SyncBackendDO:sessionToken", session);

    if (!session?.user.id) {
      throw new Error("Invalid session");
    }

    await ensureTenantAccess(session.user.id, storeId);

    // console.log("Push from user:", session.user.id, "store:", storeId);

    // console.log("onPush", message.batch);
  },
  onPull: async (_message, _context) => {
    // const { storeId, headers } = context;
    // const session = await auth.api.getSession({
    //   headers: headers as HeadersInit,
    // });
    // if (!session?.user.id) {
    //   throw new Error("Invalid session");
    // }
    // await ensureTenantAccess(session.user.id, storeId);
  },
}) {
  storage: DurableObjectStorage;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.storage = ctx.storage;
  }
  async fetch(request: SyncBackend.CfTypes.Request) {
    if (new URL(request.url).pathname === "/purge-all-data") {
      await this.storage.deleteAll();
      return new Response("Storage cleared");
    }
    return new Response("Not Found");
  }
}

const ensureTenantAccess = async (userId: string, storeId: string) => {
  const storeOwner = userIdFromStoreId(storeId);

  if (storeOwner !== userId) {
    throw new Error("Access denied");
  }
};
