import { Plus, PanelLeft, ArrowLeft } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { CatalogueTree } from "@/components/catalogue-tree";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreateVolumeDialog, createVolumeDialog } from "@/components/dialogs/create-volume-dialog";
import { useParams } from "@tanstack/react-router";
import { CreateChapterDialog } from "./dialogs/create-chapter-dialog";
import { CatalogueTreeProvider } from "@/hooks/use-catalogue-tree";
import { QuickAccess } from "./quick-access";
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
      <QuickAccess />

      {/* 卷章树 */}
      <SidebarGroup>
        <SidebarGroupLabel>Catalogue</SidebarGroupLabel>
        <SidebarGroupAction render={<AlertDialogTrigger handle={createVolumeDialog} />}>
          <Plus /> <span className="sr-only">Add Project</span>
        </SidebarGroupAction>

        <SidebarGroupContent>
          <CatalogueTreeProvider>
            <CatalogueTree novelId={novelId} />
            <CreateChapterDialog />
          </CatalogueTreeProvider>
        </SidebarGroupContent>
      </SidebarGroup>

      <CreateVolumeDialog />
    </SidebarContent>
  );
}
