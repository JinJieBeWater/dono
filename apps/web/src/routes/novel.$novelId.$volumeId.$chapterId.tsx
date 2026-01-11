import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpToLine } from "lucide-react";
import { createPortal } from "react-dom";

import { ChapterEditArea } from "@/components/chapter-edit-area";
import { ChapterHeader } from "@/components/chapter-header";
import { OutlineEditArea } from "@/components/outline-edit-area";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useIsMobile } from "@/hooks/use-mobile";
import { useOutline } from "@/hooks/use-outline";

export const Route = createFileRoute("/novel/$novelId/$volumeId/$chapterId")({
  component: RouteComponent,
  loader(ctx) {
    console.log("state", ctx.context.connection.state);
  },
});

function RouteComponent(): React.ReactElement {
  const isMobile = useIsMobile();
  const { isOutlineOpen } = useOutline();

  // 桌面端始终显示章节编辑器，移动端在打开大纲时隐藏
  const shouldShowChapterEditor = !isMobile || !isOutlineOpen;

  return (
    <div className="px-3 pt-3 w-full h-[calc(100%-var(--header-height))]">
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
