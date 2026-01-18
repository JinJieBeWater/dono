import type { ClientDoWithRpcCallback } from "@livestore/adapter-cloudflare";

export interface UserClientDOInterface extends ClientDoWithRpcCallback {
  initialize(storeId: string): Promise<void>;
  canNovelBeSynced(storeId: string, novelId: string): Promise<boolean>;
}
