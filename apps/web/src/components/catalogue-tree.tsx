import { useCatalogueTree } from "@/hooks/use-catalogue-tree";
import { ChapterItem } from "./chapter-item";
import { VolumeItem } from "./volume-item";
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

export function CatalogueTree({ novelId }: { novelId: string }) {
  const { tree } = useCatalogueTree();

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
            {items.map((item) => {
              const data = item.getItemData();
              const type = data.type;

              if (type === "volume") {
                return (
                  <VolumeItem
                    novelId={novelId}
                    item={item}
                    key={item.getId()}
                    style={{ marginLeft: `${item.getItemMeta().level * 10}px` }}
                    {...item.getProps()}
                  />
                );
              }

              if (type === "chapter") {
                return (
                  <ChapterItem
                    novelId={novelId}
                    item={item}
                    key={item.getId()}
                    style={{ marginLeft: `${item.getItemMeta().level * 10}px` }}
                    {...item.getProps()}
                  />
                );
              }
            })}
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
