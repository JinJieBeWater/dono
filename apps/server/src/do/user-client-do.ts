import { DurableObject } from "cloudflare:workers";
import { createStoreDoPromise } from "@livestore/adapter-cloudflare";
import { nanoid, type Store, type Unsubscribe } from "@livestore/livestore";
import { schema } from "@dono/stores/user/schema";
import { handleSyncUpdateRpc } from "@livestore/sync-cf/client";
import type { CfTypes } from "@livestore/sync-cf/common";
import { userTables, type Novel } from "@dono/stores/user";
import type { UserClientDOInterface } from "@dono/env/server";

export class UserClientDO extends DurableObject<Env> implements UserClientDOInterface {
  private cachedStore: Store<typeof schema> | undefined;
  private novelChangeSubscription: Unsubscribe | undefined;

  async initialize(storeId: string) {
    if (this.cachedStore !== undefined) return;
    this.cachedStore = await createStoreDoPromise({
      schema,
      storeId,
      clientId: "user-client-do",
      sessionId: nanoid(),
      durableObject: {
        ctx: this.ctx as CfTypes.DurableObjectState,
        env: this.env,
        bindingName: "USER_CLIENT_DO",
      },
      syncBackendStub: this.env.SYNC_BACKEND_DO.getByName(storeId),
      livePull: true,
    });

    await this.subscribeToStore();
  }

  private async subscribeToStore() {
    if (this.novelChangeSubscription) return;

    if (!this.cachedStore) throw new Error("Store not initialized. Call initialize() first.");

    this.novelChangeSubscription = this.cachedStore.subscribe(
      userTables.novel,
      this.publishNovelChange,
    );
  }

  private publishNovelChange = async (currentNovels: ReadonlyArray<Novel>) => {
    console.log("publishNovelChange", currentNovels);
  };

  async syncUpdateRpc(payload: unknown) {
    // Make sure to wake up the store before processing the sync update
    // await this.subscribeToStore();
    await handleSyncUpdateRpc(payload);
  }
}
