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
  // 设置 Yjs 协同编辑扩展
  const yjsExtension = setupYjsExtension(room);

  // 组合所有扩展
  if (yjsExtension) {
    return union(defineBasicExtension(), definePlaceholder({ placeholder }), yjsExtension);
  }

  // 如果没有协同编辑，只返回基础扩展
  return union(defineBasicExtension(), definePlaceholder({ placeholder }));
}

export type EditorExtension = ReturnType<typeof defineExtension>;
