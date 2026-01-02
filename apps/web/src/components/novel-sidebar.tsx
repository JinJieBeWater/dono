import { Plus, PanelLeft, ArrowLeft } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarRail,
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

export function NovelSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
      <SidebarHeader className="flex flex-row items-center gap-2 p-2">
        {/* 返回主页按钮 */}
        <Button variant="ghost" size="icon" render={<Link to="/" />} nativeButton={false}>
          <ArrowLeft />
          <span className="sr-only">Back to Home</span>
        </Button>

        {/* 收缩 Sidebar 按钮 */}
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={toggleSidebar}>
          <PanelLeft />
          <span className="sr-only">Expand / Collapse Sidebar</span>
        </Button>
      </SidebarHeader>
      <NovelSidebarContent />
      <SidebarRail />
    </Sidebar>
  );
}
