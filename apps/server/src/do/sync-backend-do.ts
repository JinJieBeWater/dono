import { auth } from "@dono/auth";
import * as SyncBackend from "@livestore/sync-cf/cf-worker";
import { userIdFromStoreId } from "../utils/shared";

export class SyncBackendDO extends SyncBackend.makeDurableObject({
  forwardHeaders: ["Cookie"],
  onPush: async (_message, context) => {
    const { storeId, headers } = context;
    // console.log("SyncBackendDO:headers", headers);

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
}) {}

const ensureTenantAccess = async (userId: string, storeId: string) => {
  const storeOwner = userIdFromStoreId(storeId);

  if (storeOwner !== userId) {
    throw new Error("Access denied");
  }
};
