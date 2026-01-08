import { defineBasicExtension } from "prosekit/basic";
import { union } from "prosekit/core";
import { definePlaceholder } from "prosekit/extensions/placeholder";
import { setupYjsExtension } from "./yjs";

export function defineExtension({
  placeholder = "Type something...",
  room,
}: {
  placeholder?: string;
  room?: string;
}) {
  // 组合所有扩展
  if (room) {
    const { yjsExtension, syncedPromise } = setupYjsExtension(room);
    return {
      extension: union(defineBasicExtension(), definePlaceholder({ placeholder }), yjsExtension),
      syncedPromise,
    };
  }

  // 如果没有协同编辑，只返回基础扩展
  return {
    extension: union(defineBasicExtension(), definePlaceholder({ placeholder })),
  };
}

export type EditorExtension = ReturnType<typeof defineExtension>;
