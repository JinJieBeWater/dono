import { PanelLeft, ArrowLeft } from "lucide-react";

import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { CatalogueTree } from "@/components/catalogue-tree";
import { useParams } from "@tanstack/react-router";
import { CatalogueQuickAccess } from "./catalogue-quick-access";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { novel$, useUserStore } from "@/stores/user";

export function NovelSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  const novelId = useParams({
    from: "/novel/$novelId",
    select: (params) => params.novelId,
  });
  const userStore = useUserStore();
  const novel = userStore.useQuery(novel$({ novelId }));

  return (
    <Sidebar className="h-[calc(100svh-var(--header-height))]!" {...props} variant="inset">
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
  );
}

function NovelSidebarContent({ ...props }: React.ComponentProps<typeof SidebarContent>) {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });

  return (
    <SidebarContent {...props}>
      <CatalogueQuickAccess />

      {/* 卷章树 */}
      <CatalogueTree novelId={novelId} />
    </SidebarContent>
  );
}
