import { auth } from "@dono/auth";
import * as SyncBackend from "@livestore/sync-cf/cf-worker";
import { userIdFromStoreId } from "@dono/stores/utils";
import type { DonoSyncBackendDO } from "@dono/env/server";

export class SyncBackendDO
  extends SyncBackend.makeDurableObject({
    forwardHeaders: ["Cookie"],
    onPush: async (_message, context) => {
      const { storeId, headers } = context;

      const session = await auth.api.getSession({
        headers: headers as HeadersInit,
      });

      if (!session?.user.id) {
        throw new Error("Invalid session");
      }

      await ensureTenantAccess(session.user.id, storeId);
    },
  })
  implements DonoSyncBackendDO
{
  ctx: DurableObjectState;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.ctx = ctx;
  }
  test(): Promise<string> {
    return Promise.resolve("ok");
  }
  async purge() {
    const closeAllWebSockets = (
      state: DurableObjectState,
      { code, reason }: { code: number; reason: string },
    ) => {
      const sockets = state.getWebSockets();
      for (const ws of sockets) {
        ws.close(code, reason);
      }
      return sockets.length;
    };

    const closedConnections = closeAllWebSockets(this.ctx, {
      code: 1012,
      reason: "purge",
    });

    // sync-cf caches storage/head/backendId refs on the DO instance; drop that cache so the next request rebuilds from empty DB.
    // We can't import the internal cache symbol, but its description is stable in current sync-cf versions.
    for (const sym of Object.getOwnPropertySymbols(this)) {
      if (sym.description === "Cache") {
        // @ts-expect-error - dynamic symbol cache
        delete this[sym];
      }
    }

    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();

    return { ok: true as const, closedConnections };
  }
}

const ensureTenantAccess = async (userId: string, storeId: string) => {
  const storeOwner = userIdFromStoreId(storeId);

  if (storeOwner !== userId) {
    throw new Error("Access denied");
  }
};
