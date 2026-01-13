import { Priority, union, withPriority } from "prosekit/core";
import { defineYjsCommands, defineYjsKeymap, defineYjsSyncPlugin } from "prosekit/extensions/yjs";
import { clearDocument, IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

import { env } from "@dono/env/web";
import { userAgent } from "@/utils/user-agent";

/** Yjs 实例结构，WebSocket provider 可选以支持仅本地模式 */
interface YjsInstance {
  doc: Y.Doc;
  room: string;
  provider: WebsocketProvider | null;
  persistence: IndexeddbPersistence;
  wsSyncedPromise: Promise<void> | null;
  dbSyncedPromise: Promise<void>;
}

/** 全局 Yjs 实例缓存，key 为 room 名称 */
const yjsInstanceCache = new Map<string, YjsInstance>();

/** 初始化 Yjs 本地实例（不含 WebSocket） */
function initializeYjsInstance(room: string): YjsInstance {
  const doc = new Y.Doc();
  const persistence = new IndexeddbPersistence(room, doc);
  const dbSyncedPromise = new Promise<void>((resolve) => {
    persistence.on("synced", resolve);
  });

  return {
    doc,
    room,
    provider: null,
    persistence,
    wsSyncedPromise: null,
    dbSyncedPromise,
  };
}

/** 获取或创建 Yjs 实例 */
function getOrCreateYjsInstance(room: string): YjsInstance {
  const existing = yjsInstanceCache.get(room);
  if (existing) return existing;

  const instance = initializeYjsInstance(room);
  yjsInstanceCache.set(room, instance);
  return instance;
}

/** 启用远程同步，仅在网络连接时调用以节省资源 */
export function enableRemoteSync(room: string): Promise<void> | null {
  const instance = yjsInstanceCache.get(room);
  if (!instance) {
    console.warn(`Cannot enable remote sync: Yjs instance for room "${room}" not found`);
    return null;
  }

  // 断开旧连接
  instance.provider?.destroy();

  // 创建 WebSocket 连接
  const wsUrl = env.VITE_SERVER_URL.replace(/^http/, "ws");
  const provider = new WebsocketProvider(`${wsUrl}/yjs/room`, room, instance.doc);

  const wsSyncedPromise = new Promise<void>((resolve) => {
    provider.on("sync", (isSynced: boolean) => {
      if (isSynced) resolve();
    });
  });

  // 设置用户信息
  const ua = userAgent();
  if (provider.awareness) {
    provider.awareness.setLocalStateField("user", { name: ua.osName });
  }

  instance.provider = provider;
  instance.wsSyncedPromise = wsSyncedPromise;

  return wsSyncedPromise;
}

/** 禁用远程同步，网络不佳时仅使用本地 IndexedDB */
export function disableRemoteSync(room: string): void {
  const instance = yjsInstanceCache.get(room);
  if (!instance?.provider) return;

  instance.provider.destroy();
  instance.provider = null;
  instance.wsSyncedPromise = null;
}

/** 设置 Yjs 协同编辑扩展 */
export function setupYjsExtension(room: string) {
  const instance = getOrCreateYjsInstance(room);
  const fragment = instance.doc.getXmlFragment("prosemirror");

  const yjsExtension = withPriority(
    union([defineYjsKeymap(), defineYjsCommands(), defineYjsSyncPlugin({ fragment })]),
    Priority.high,
  );

  return {
    yjsExtension,
    wsSyncedPromise: instance.wsSyncedPromise,
    dbSyncedPromise: instance.dbSyncedPromise,
  };
}

/** 清理 Yjs 实例，释放资源 */
export function cleanupYjsInstance(room: string): void {
  const instance = yjsInstanceCache.get(room);
  if (!instance) return;

  instance.provider?.destroy();
  instance.persistence.destroy();
  yjsInstanceCache.delete(room);
}

export async function purgeYjsRoom(room: string): Promise<void> {
  cleanupYjsInstance(room);
  await clearDocument(room);
}

export async function purgeYjsRoomsByPrefix(prefix: string): Promise<void> {
  const databases = await indexedDB.databases();
  const matchingDbs = databases.filter((db) => db.name?.startsWith(prefix));

  await Promise.allSettled(
    matchingDbs.map((db) => {
      if (!db.name) return Promise.resolve();
      cleanupYjsInstance(db.name);
      return clearDocument(db.name);
    }),
  );
}
