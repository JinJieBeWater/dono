import type { ClientDoWithRpcCallback } from "@livestore/adapter-cloudflare";

export interface UserClientDOInterface extends ClientDoWithRpcCallback {
  initialize(storeId: string): Promise<void>;
}
