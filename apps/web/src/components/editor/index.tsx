import "prosekit/basic/style.css";
import "prosekit/basic/typography.css";
import "prosekit/extensions/yjs/style.css";
import { createEditor, jsonFromNode, type NodeJSON } from "prosekit/core";
import { ProseKit, useDocChange } from "prosekit/react";
import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { defineExtension } from "./extension";
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

  const editor = useMemo(() => {
    const extension = defineExtension({
      placeholder,
      room,
    });
    return createEditor({ extension, defaultContent });
  }, [defaultContent, room, placeholder]);

  const handleDocChange = useCallback(
    (doc: ProseMirrorNode) => onDocUpdate?.(jsonFromNode(doc)),
    [onDocUpdate],
  );
  useDocChange(handleDocChange, { editor });

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
