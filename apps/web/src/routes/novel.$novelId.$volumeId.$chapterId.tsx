import { createFileRoute } from "@tanstack/react-router";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useOutline } from "@/hooks/use-outline";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";

export const Route = createFileRoute("/novel/$novelId/$volumeId/$chapterId")({
  component: RouteComponent,
});

function RouteComponent() {
  const isMobile = useIsMobile();
  const { isOutlineOpen } = useOutline();

  // 编辑器内容
  const EditorContent = ({ className, ...props }: React.ComponentProps<typeof Item>) => (
    <Item className={cn("h-full items-start", className)} {...props}>
      <ItemContent>
        <ItemTitle>Editor</ItemTitle>
        <div>编辑器内容区域</div>
      </ItemContent>
    </Item>
  );

  // 大纲内容
  const OutlineContent = ({ className, ...props }: React.ComponentProps<typeof Item>) => (
    <Item className={cn("h-full items-start", className)} {...props}>
      <ItemContent>
        <ItemTitle>Outline</ItemTitle>
        <div>大纲内容区域</div>
      </ItemContent>
    </Item>
  );

  // 移动端：根据 isOutlineOpen 切换显示 Editor 或 Outline
  if (isMobile) {
    return (
      <div className="h-full w-full relative grid grid-rows-[1fr_auto] overflow-hidden">
        {/* 移动端：显示侧边栏切换按钮 */}
        <EditorContent className={cn(isOutlineOpen && "hidden")} />
        <OutlineContent className={cn(!isOutlineOpen && "hidden")} />
      </div>
    );
  }

  // 桌面端：使用 ResizablePanel 并排显示
  return (
    <ResizablePanelGroup>
      <ResizablePanel id="editor" minSize={300}>
        <EditorContent />
      </ResizablePanel>
      {isOutlineOpen && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel id="outline" minSize={300} defaultSize={300}>
            <OutlineContent />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}
