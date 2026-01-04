import { createFileRoute } from "@tanstack/react-router";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useOutline } from "@/hooks/use-outline";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ChapterEditArea } from "@/components/chapter-edit-area";
import { OutlineEditArea } from "@/components/outline-edit-area";
import { ChapterHeader } from "@/components/chapter-header";

export const Route = createFileRoute("/novel/$novelId/$volumeId/$chapterId")({
  component: RouteComponent,
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
                "mx-auto h-full flex flex-col",
                // 不同屏幕尺寸下的最大宽度（使用px）
                "max-w-140", // 默认（移动端）: 560px
                "sm:max-w-150", // 小屏: 600px
                "md:max-w-160", // 中屏: 640px
                "lg:max-w-170", // 大屏: 680px
                "xl:max-w-180", // 超大屏: 720px
                "2xl:max-w-190", // 2xl屏: 760px
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
