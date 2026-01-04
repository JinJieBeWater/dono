import { defineBasicExtension } from "prosekit/basic";
import { union } from "prosekit/core";
import { definePlaceholder } from "prosekit/extensions/placeholder";
import { defineYjs } from "prosekit/extensions/yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import * as Y from "yjs";
import { env } from "@dono/env/web";
import { userAgent } from "@/utils/user-agent";

export function defineExtension({
  placeholder = "Type something...",
  room,
}: {
  placeholder?: string;
  room?: string;
}) {
  const doc = new Y.Doc();

  if (room) {
    // 将 http/https 协议替换为 ws/wss 用于 WebSocket 连接
    const wsUrl = env.VITE_SERVER_URL.replace(/^http/, "ws");
    const provider = new WebsocketProvider(`${wsUrl}/sync/room`, room, doc);
    const persistence = new IndexeddbPersistence(room, doc);
    persistence.on("synced", () => {
      // console.log("initial content loaded");
    });

    const ua = userAgent();

    if (provider.awareness) {
      provider.awareness.setLocalStateField("user", { name: ua.osName });
    }

    return union(
      defineBasicExtension(),
      definePlaceholder({ placeholder }),
      defineYjs({ doc, awareness: provider.awareness }),
    );
  }

  return union(defineBasicExtension(), definePlaceholder({ placeholder }));
}

export type EditorExtension = ReturnType<typeof defineExtension>;
