import { useCatalogueTree } from "@/hooks/use-catalogue-tree";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "./ui/sidebar";
import { AlertDialogTrigger } from "./ui/alert-dialog";
import { createVolumeDialog } from "./dialogs/create-volume-dialog";
import { Plus } from "lucide-react";
import { Empty, EmptyHeader, EmptyDescription } from "./ui/empty";
import { CatalogueTreeItem } from "./catalogue-tree-item";
import { memo } from "react";
import { useParams } from "@tanstack/react-router";

export function CatalogueTreeImpl() {
  const { tree } = useCatalogueTree();
  const novelId = useParams({
    from: "/novel/$novelId",
    select: (params) => params.novelId,
  });

  const items = tree.getItems();
  const hasItems = items.length > 0;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Catalogue</SidebarGroupLabel>
      <SidebarGroupAction render={<AlertDialogTrigger handle={createVolumeDialog} />}>
        <Plus /> <span className="sr-only">Add Project</span>
      </SidebarGroupAction>

      <SidebarGroupContent>
        {hasItems ? (
          <div {...tree.getContainerProps()} className="flex flex-col">
            {items.map((item) => CatalogueTreeItem({ item, novelId }))}
          </div>
        ) : (
          <Empty className="py-32">
            <EmptyHeader>
              <EmptyDescription className="text-muted-foreground text-sm">
                Click the <span className="font-medium">+</span> button to create your first volume
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export const CatalogueTree = memo(CatalogueTreeImpl);
