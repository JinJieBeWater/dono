import { createFileRoute } from "@tanstack/react-router";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useOutline } from "@/hooks/use-outline";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChapterEditArea } from "@/components/chapter-edit-area";
import { OutlineEditArea } from "@/components/outline-edit-area";
import { ChapterHeader } from "@/components/chapter-header";
import { preloadYjsInstance } from "@/components/editor/extension/yjs";
import { getChapterRoomId } from "@/utils/get-room-id";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ArrowUpToLine } from "lucide-react";
import { createPortal } from "react-dom";

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
    <div className="px-3 pt-3 w-full">
      <ResizablePanelGroup direction="horizontal">
        {shouldShowChapterEditor && (
          <ResizablePanel
            id="editor"
            minSize={isMobile ? undefined : 30}
            className="mx-auto max-w-180 transition-[width] duration-200 ease-linear"
          >
            <ChapterHeader />
            <ChapterEditArea />
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

      {createPortal(
        <ScrollToTop
          variant={"outline"}
          size={"icon-lg"}
          minHeight={800}
          scrollTo={10}
          className="fixed right-5 bottom-5 bg-sidebar"
        >
          <ArrowUpToLine />
        </ScrollToTop>,
        document.body,
      )}
    </div>
  );
}
