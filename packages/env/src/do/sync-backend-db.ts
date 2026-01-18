import * as SyncBackend from "@livestore/sync-cf/cf-worker";

export interface DonoSyncBackendDO extends SyncBackend.SyncBackendRpcInterface {
  purge(): Promise<{
    ok: true;
    closedConnections: number;
  }>;
  test(): Promise<string>;
}
