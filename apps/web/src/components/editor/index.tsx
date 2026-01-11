import "prosekit/basic/style.css";
import "./typography.css";
import "./yjs.css";

import { useCallback, useEffect, useMemo, useState } from "react";

import { createEditor, jsonFromNode, type NodeJSON } from "prosekit/core";
import type { ProseMirrorNode } from "prosekit/pm/model";
import { ProseKit, useDocChange } from "prosekit/react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { defineExtension } from "./extension";
import { cleanupYjsInstance, enableRemoteSync, disableRemoteSync } from "./extension/yjs";
import { useConnection } from "@/hooks/use-connection";

interface EditorProps extends React.ComponentProps<"div"> {
  defaultContent?: NodeJSON;
  onDocUpdate?: (doc: NodeJSON) => void;
  placeholder?: string;
  room?: string;
}

/**
 * 编辑器加载骨架屏
 * 模拟文档内容布局，提供视觉占位
 */
function EditorSkeleton(): React.ReactElement {
  return (
    <div className="w-full space-y-4 p-8">
      {/* 模拟两个段落区块 */}
      {[0, 1].map((index) => (
        <div key={index} className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Editor({
  className,
  defaultContent,
  onDocUpdate,
  placeholder,
  room,
  ...rest
}: EditorProps): React.ReactElement {
  // 没有协作房间时无需等待同步
  const [isLoaded, setIsLoaded] = useState(!room);

  // Reason: 使用响应式版本监听连接状态变化
  const { state: connectionState } = useConnection();

  const editor = useMemo(() => {
    const { extension, dbSyncedPromise } = defineExtension({ placeholder, room });

    // 等待 IndexedDB 同步完成后再显示编辑器
    dbSyncedPromise?.then(() => setIsLoaded(true));

    return createEditor({ extension, defaultContent });
  }, [defaultContent, room, placeholder]);

  const handleDocChange = useCallback(
    (doc: ProseMirrorNode) => onDocUpdate?.(jsonFromNode(doc)),
    [onDocUpdate],
  );
  useDocChange(handleDocChange, { editor });

  // 清理 Yjs 实例：当组件卸载或 room 变化时
  useEffect(() => {
    return () => {
      if (room) {
        cleanupYjsInstance(room);
      }
    };
  }, [room]);

  // Reason: 根据连接状态动态管理远程同步
  // 仅在 connected 状态下启用远程同步，其他状态下仅使用本地 IndexedDB
  useEffect(() => {
    if (!room) return;

    if (connectionState === "connected") {
      enableRemoteSync(room);
    } else {
      disableRemoteSync(room);
    }
  }, [room, connectionState]);

  if (!isLoaded) {
    return <EditorSkeleton />;
  }

  return (
    <ProseKit editor={editor}>
      <div
        ref={editor.mount}
        className={cn("h-full w-full focus:outline-none", className)}
        {...rest}
      />
    </ProseKit>
  );
}

export default Editor;
