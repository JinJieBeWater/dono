import { PanelLeft, ArrowLeft } from "lucide-react";

import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { CatalogueTree } from "@/components/catalogue-tree";
import { useParams } from "@tanstack/react-router";
import { CatalogueQuickAccess } from "./catalogue-quick-access";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useCatalogueTree } from "@/hooks/use-catalogue-tree";
import { useEffect, useEffectEvent } from "react";
import { NovelGuard } from "@/components/novel-guard";

export function NovelSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const novelId = useParams({
    from: "/novel/$novelId",
    select: (params) => params.novelId,
  });

  return (
    <NovelGuard novelId={novelId}>
      {(novel) => (
        <Sidebar className="" {...props} variant="inset">
          <SidebarHeader className="flex-row">
            <Button variant="ghost" size="icon" render={<Link to="/" />} nativeButton={false}>
              <ArrowLeft />
              <span className="sr-only">Back to Home</span>
            </Button>
            <Link
              className="px-2 pt-2 pb-1 w-full"
              to="/novel/$novelId"
              params={{
                novelId: novel.id,
              }}
              aria-label="home"
            >
              <h1 className="text-sm line-clamp-2 text-center font-medium">{novel.title}</h1>
            </Link>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <PanelLeft />
              <span className="sr-only">Expand / Collapse Sidebar</span>
            </Button>
          </SidebarHeader>
          <NovelSidebarContent />
        </Sidebar>
      )}
    </NovelGuard>
  );
}

const NovelSidebarContent = ({ ...props }: React.ComponentProps<typeof SidebarContent>) => {
  const volumeId = useParams({
    from: "/novel/$novelId/$volumeId",
    select: (params) => params.volumeId,
    shouldThrow: false,
  });
  const chapterId = useParams({
    from: "/novel/$novelId/$volumeId/$chapterId",
    select: (params) => params.chapterId,
    shouldThrow: false,
  });
  const { tree, setFocusedItem } = useCatalogueTree();

  const onFocus = useEffectEvent(() => {
    // 优先聚焦章节，如果没有章节则聚焦卷
    const focusId = chapterId || volumeId;

    if (focusId) {
      const item = tree.getItemInstance(focusId);
      if (item) {
        item.setFocused();

        // 如果是章节，确保其父卷是展开的
        if (chapterId && volumeId) {
          const volumeItem = tree.getItemInstance(volumeId);
          if (volumeItem && !volumeItem.isExpanded()) {
            volumeItem.expand();
          }
        }
      }
    } else {
      // 直接通过tree的状态更新
      setFocusedItem("root");
    }
  });

  // 根据当前路由参数自动聚焦对应的章节或卷
  useEffect(() => {
    onFocus();
  }, [chapterId, volumeId]);
  return (
    <SidebarContent {...props}>
      <CatalogueQuickAccess />

      {/* 卷章树 */}
      <CatalogueTree />
    </SidebarContent>
  );
};
