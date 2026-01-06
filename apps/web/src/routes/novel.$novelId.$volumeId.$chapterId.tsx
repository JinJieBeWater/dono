import { createFileRoute } from "@tanstack/react-router";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useOutline } from "@/hooks/use-outline";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChapterEditArea } from "@/components/chapter-edit-area";
import { OutlineEditArea } from "@/components/outline-edit-area";
import { ChapterHeader } from "@/components/chapter-header";
import { preloadYjsInstance } from "@/components/editor/extension/yjs";
import { getChapterRoomId } from "@/utils/get-room-id";

export const Route = createFileRoute("/novel/$novelId/$volumeId/$chapterId")({
  component: RouteComponent,
  preload: true,
  loader: async ({ params, preload, context: { connection } }) => {
    if (connection.state !== "connected") {
      return;
    }

    // 获取章节的 room ID 并预加载 Yjs 数据
    const roomId = getChapterRoomId(params.chapterId);
    if (roomId) {
      await preloadYjsInstance(roomId, preload);
    }
  },
});

function RouteComponent() {
  const isMobile = useIsMobile();
  const { isOutlineOpen } = useOutline();

  // 在桌面端时不用隐藏 在移动端 在 isMobile 和 isOutlineOpen 时隐藏
  const shouldShowChapterEditor = isMobile ? !isOutlineOpen : true;

  return (
    <div className="px-3 pt-3 h-full w-full">
      <ResizablePanelGroup direction="horizontal">
        {shouldShowChapterEditor && (
          <ResizablePanel id="editor" minSize={isMobile ? undefined : 30}>
            {/* 居中容器：为所有子组件提供统一的居中和宽度限制 */}
            <div
              className={cn(
                "mx-auto h-full flex flex-col transition-[width] duration-200 ease-linear",
                "max-w-180",
              )}
            >
              <ChapterHeader />
              <ChapterEditArea />
            </div>
          </ResizablePanel>
        )}
        {isOutlineOpen && (
          <>
            {/* 桌面端显示可调整大小的分隔条 */}
            {!isMobile && <ResizableHandle withHandle />}
            <ResizablePanel id="outline" minSize={isMobile ? undefined : 30}>
              <OutlineEditArea />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
