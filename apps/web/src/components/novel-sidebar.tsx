import { Plus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import { CatalogueTree } from "@/components/catalogue-tree";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreateVolumeDialog, createVolumeDialog } from "@/components/dialogs/create-volume-dialog";
import { useParams } from "@tanstack/react-router";
import { CreateChapterDialog } from "./dialogs/create-chapter-dialog";
import { CatalogueTreeProvider } from "@/hooks/use-catalogue-tree";
import { QuickAccess } from "./quick-access";

function NovelSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });

  return (
    <>
      <Sidebar className="top-(--header-height) h-[calc(100svh-var(--header-height))]!" {...props}>
        <SidebarContent>
          <QuickAccess />

          {/* 卷章树 */}
          <SidebarGroup>
            <SidebarGroupLabel className="p-0">Catalogue</SidebarGroupLabel>
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
        <SidebarRail />
      </Sidebar>
    </>
  );
}

export function NovelSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return <NovelSidebarContent {...props} />;
}
