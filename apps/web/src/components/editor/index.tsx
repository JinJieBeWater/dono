import "prosekit/basic/style.css";
import "./typography.css";
import "./yjs.css";
import { createEditor, jsonFromNode, type NodeJSON } from "prosekit/core";
import { ProseKit, useDocChange } from "prosekit/react";
import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { defineExtension } from "./extension";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProseMirrorNode } from "prosekit/pm/model";

const Editor = ({
  className,
  ...props
}: React.ComponentProps<"div"> & {
  defaultContent?: NodeJSON;
  onDocUpdate?: (doc: NodeJSON) => void;
  placeholder?: string;
  room?: string;
}) => {
  const { defaultContent, onDocUpdate, placeholder, room, ...rest } = props;
  const [isLoaded, setIsLoaded] = useState(room ? false : true);

  const editor = useMemo(() => {
    const { extension, dbSyncedPromise } = defineExtension({
      placeholder,
      room,
    });
    if (dbSyncedPromise) {
      dbSyncedPromise.then(() => setIsLoaded(true));
    }

    const EditorInstance = createEditor({ extension, defaultContent });

    return EditorInstance;
  }, [defaultContent, room, placeholder]);

  const handleDocChange = useCallback(
    (doc: ProseMirrorNode) => onDocUpdate?.(jsonFromNode(doc)),
    [onDocUpdate],
  );
  useDocChange(handleDocChange, { editor });

  // Display skeleton while loading collaborative editor
  if (!isLoaded) {
    return (
      <div className={cn("w-full space-y-4 p-8")}>
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
        </div>{" "}
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
    );
  }

  return (
    <ProseKit editor={editor}>
      <div
        ref={editor.mount}
        className={cn("h-full w-full focus:outline-none", className)}
        {...rest}
      ></div>
    </ProseKit>
  );
};

export default Editor;
