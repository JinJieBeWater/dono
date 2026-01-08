import { defineYjsCommands, defineYjsKeymap, defineYjsSyncPlugin } from "prosekit/extensions/yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { env } from "@dono/env/web";
import { userAgent } from "@/utils/user-agent";
import { Priority, union, withPriority } from "prosekit/core";

/**
 * Yjs 实例缓存
 */
interface YjsInstance {
  doc: Y.Doc;
  provider: WebsocketProvider;
  persistence: IndexeddbPersistence;
  syncedPromise: Promise<void>;
}

/**
 * 全局缓存，存储已初始化的 Yjs 实例
 * key: room 名称
 * value: Yjs 实例对象
 */
const yjsInstanceCache = new Map<string, YjsInstance>();

/**
 * 初始化 Yjs 实例
 * @param room - 房间名称
 * @returns Yjs 实例对象
 */
function initializeYjsInstance(room: string): YjsInstance {
  // 创建 Yjs 文档实例
  const doc = new Y.Doc();

  // 将 http/https 协议替换为 ws/wss 用于 WebSocket 连接
  const wsUrl = env.VITE_SERVER_URL.replace(/^http/, "ws");

  // 创建 WebSocket 提供者，用于实时同步
  const provider = new WebsocketProvider(`${wsUrl}/yjs/room`, room, doc);

  // 创建 IndexedDB 持久化，用于本地存储
  const persistence = new IndexeddbPersistence(room, doc);

  // 创建同步完成的 Promise
  const syncedPromise = new Promise<void>((resolve) => {
    persistence.on("synced", () => {
      console.log(doc);

      resolve();
    });
  });

  // 设置用户信息到 awareness
  const ua = userAgent();
  if (provider.awareness) {
    provider.awareness.setLocalStateField("user", { name: ua.osName });
  }

  return { doc, provider, persistence, syncedPromise };
}

/**
 * 获取或创建 Yjs 实例
 * @param room - 房间名称
 * @returns Yjs 实例对象
 */
function getOrCreateYjsInstance(room: string): YjsInstance {
  // 检查缓存中是否已存在
  let instance = yjsInstanceCache.get(room);

  if (!instance) {
    // 不存在则创建新实例
    instance = initializeYjsInstance(room);
    yjsInstanceCache.set(room, instance);
  }

  return instance;
}

/**
 * 预加载 Yjs 实例（用于路由 loader）
 * @param room - 房间名称
 * @param isPreload - 是否是预加载，如果是则加载完成后自动清理实例
 * @returns Promise，在 IndexedDB 同步完成后 resolve
 */
export async function preloadYjsInstance(room: string, isPreload = false): Promise<void> {
  const instance = getOrCreateYjsInstance(room);

  // 等待 IndexedDB 同步完成
  await instance.syncedPromise;

  if (isPreload) {
    // 预加载模式：数据已经加载到 IndexedDB，可以完全清理实例
    // 后续真正导航时会重新创建实例
    instance.provider.destroy();
    instance.persistence.destroy();
    yjsInstanceCache.delete(room);
  }
  // 正常加载模式：保持连接，组件渲染时直接使用
}

/**
 * 设置 Yjs 协同编辑
 * @param room - 房间名称，用于标识协同编辑的文档
 * @returns Yjs 扩展配置，如果没有房间则返回 null
 */
export function setupYjsExtension(room: string) {
  // 获取或创建 Yjs 实例
  // 如果是从 loader 过来的，实例已经存在且连接正常
  // 如果没有经过 loader，这里会创建新实例
  const instance = getOrCreateYjsInstance(room);
  const { doc } = instance;
  const fragment = doc.getXmlFragment("prosemirror");
  // 返回 Yjs 扩展配置
  const yjsExtension = withPriority(
    union([
      defineYjsKeymap(),
      defineYjsCommands(),
      // defineYjsCursorPlugin({ ...cursor, awareness }),
      // defineYjsUndoPlugin({ ...undo }),
      defineYjsSyncPlugin({ fragment }),
    ]),
    Priority.high,
  );

  return {
    yjsExtension,
    syncedPromise: instance.syncedPromise,
  };
}

/**
 * 清理指定 room 的 Yjs 实例
 * @param room - 房间名称
 */
export function cleanupYjsInstance(room: string): void {
  const instance = yjsInstanceCache.get(room);
  if (instance) {
    instance.provider.destroy();
    instance.persistence.destroy();
    yjsInstanceCache.delete(room);
  }
}
