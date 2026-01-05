import { cn } from "@/lib/utils";
import { useCatalogueTree, type CatalogueTreeItem } from "@/hooks/use-catalogue-tree";
import { Link } from "@tanstack/react-router";
import { type ComponentProps } from "react";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import type { ItemInstance } from "@headless-tree/core";
import { ChevronRight, ScrollText, BookDashed, MoreHorizontal, Trash, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { createChapterDialog } from "@/components/dialogs/create-chapter-dialog";
import { novelEvents, useNovelStore } from "@/stores/novel";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export function CatalogueTree({ novelId }: { novelId: string }) {
  const { tree } = useCatalogueTree();

  return (
    <div {...tree.getContainerProps()} className="flex flex-col">
      {tree.getItems().map((item) => {
        const data = item.getItemData();
        const type = data.type;

        return (
          <SidebarMenuItem
            {...item.getProps()}
            key={item.getId()}
            className={cn("w-full flex")}
            style={{ paddingLeft: `${item.getItemMeta().level * 10}px` }}
          >
            {type === "volume" && <VolumeItem novelId={novelId} item={item} />}
            {type === "chapter" && <ChapterItem novelId={novelId} item={item} />}
          </SidebarMenuItem>
        );
      })}
    </div>
  );
}

const VolumeItem = ({
  novelId,
  item,
  className,
  ...props
}: ComponentProps<typeof SidebarMenuButton> & {
  novelId: string;
  item: ItemInstance<CatalogueTreeItem>;
}) => {
  const isExpanded = item.isExpanded();
  const novelStore = useNovelStore(novelId);
  const volumeData = item.getItemData();
  const { isMobile } = useSidebar();
  const isFocused = item.isFocused();

  if (volumeData.type !== "volume") throw shouldNeverHappen("data.type !== volume");

  const handleDelete = () => {
    novelStore.commit(
      novelEvents.volumeDeleted({
        id: volumeData.id,
        deleted: new Date(),
      }),
    );
  };

  return (
    <>
      <SidebarMenuAction className={cn("left-1.5 right-auto")} data-chevron="true">
        <BookDashed
          className={cn(
            "peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-0 group-hover/menu-item:opacity-0 data-open:opacity-0 group-focus-within/menu-item:hidden group-hover/menu-item:hidden data-open:hidden md:opacity-100 md:block",
            isExpanded && "opacity-0! hidden!",
            isMobile && "hidden",
          )}
        />
        <ChevronRight
          className={cn(
            "peer-data-active/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-open:opacity-100 group-focus-within/menu-item:block group-hover/menu-item:block data-open:block md:opacity-0 md:hidden transition-all duration-200",
            isExpanded && "rotate-90 opacity-100! block!",
          )}
        />
        <span className="sr-only">Expand</span>
      </SidebarMenuAction>
      <SidebarMenuButton
        className={cn("w-full group/volume pl-8", className)}
        render={
          <Link
            className={cn(className)}
            to="/novel/$novelId/$volumeId"
            params={{
              novelId,
              volumeId: volumeData.id,
            }}
          ></Link>
        }
        isActive={isFocused}
        {...props}
      >
        <span className="flex-1">{item.getItemName()}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <SidebarMenuAction
          showOnHover={!isExpanded}
          onClick={(e) => {
            e.stopPropagation();
          }}
          render={DropdownMenuTrigger}
        >
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
        <DropdownMenuContent>
          <DropdownMenuItem
            nativeButton={true}
            render={
              <AlertDialogTrigger
                className="w-full"
                handle={createChapterDialog}
                payload={{ volumeId: volumeData.id }}
              />
            }
          >
            <Plus />
            Add Chapter
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const ChapterItem = ({
  novelId,
  item,
  className,
  ...props
}: ComponentProps<typeof SidebarMenuButton> & {
  novelId: string;
  item: ItemInstance<CatalogueTreeItem>;
}) => {
  const novelStore = useNovelStore(novelId);
  const chapterData = item.getItemData();
  const isFocused = item.isFocused();

  if (chapterData.type !== "chapter") throw shouldNeverHappen("data.type !== chapter");
  const handleDelete = () => {
    novelStore.commit(
      novelEvents.chapterDeleted({
        id: chapterData.id,
        deleted: new Date(),
      }),
    );
  };
  return (
    <>
      <SidebarMenuButton
        isActive={isFocused}
        className={cn("w-full", className)}
        render={
          <Link
            className={cn(className)}
            to="/novel/$novelId/$volumeId/$chapterId"
            params={{
              novelId,
              volumeId: chapterData.volumeId,
              chapterId: chapterData.id,
            }}
          ></Link>
        }
        {...props}
      >
        <ScrollText className="shrink-0" />
        <span>{item.getItemName()}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <SidebarMenuAction
          showOnHover
          onClick={(e) => {
            e.stopPropagation();
          }}
          render={DropdownMenuTrigger}
        >
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
