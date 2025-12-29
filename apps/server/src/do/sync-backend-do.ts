import { auth } from "@dono/auth";
import * as SyncBackend from "@livestore/sync-cf/cf-worker";
import type { SyncMessage } from "@livestore/sync-cf/common";

export class SyncBackendDO extends SyncBackend.makeDurableObject({
  forwardHeaders: ["Cookie"],
  onPush: async (message, context) => {
    const { storeId, headers } = context;
    console.log("SyncBackendDO:headers", headers);

    const session = await auth.api.getSession({
      headers: headers as HeadersInit,
    });
    console.log("SyncBackendDO:sessionToken", session);

    if (!session?.user.id) {
      throw new Error("Invalid session");
    }

    await ensureTenantAccess(session.user.id, message.batch);

    console.log("Push from user:", session.user.id, "store:", storeId);

    console.log("onPush", message.batch);
  },
  onPull: async (message, context) => {
    const { storeId, headers } = context;
    console.log("SyncBackendDO:headers", headers);

    const session = await auth.api.getSession({
      headers: headers as HeadersInit,
    });
    console.log("SyncBackendDO:sessionToken", session);

    if (!session?.user.id) {
      throw new Error("Invalid session");
    }

    console.log("Pull from user:", session.user.id, "store:", storeId);

    console.log("onPull", message);
  },
}) {}

const ensureTenantAccess = async (_userId: string, _batch: SyncMessage.PushRequest["batch"]) => {
  // Replace with your application-specific access checks.
};
