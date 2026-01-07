import { cn } from "@/lib/utils";
import { type CatalogueTreeItem } from "@/hooks/use-catalogue-tree";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { type ComponentProps } from "react";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./ui/sidebar";
import type { ItemInstance } from "@headless-tree/core";
import { ChevronRight, BookDashed, MoreHorizontal, Trash, Plus, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { novelEvents, useNovelStore } from "@/stores/novel";
import { Input } from "./ui/input";
import { createChapter } from "@/stores/novel/command";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export const VolumeItem = ({
  novelId,
  item,
  className,
  ...props
}: ComponentProps<typeof SidebarMenuItem> & {
  novelId: string;
  item: ItemInstance<CatalogueTreeItem>;
}) => {
  const volumeData = item.getItemData();
  if (volumeData.type !== "volume") throw shouldNeverHappen("item.type !== volume");
  const navigate = useNavigate();
  const novelStore = useNovelStore(novelId);
  const isExpanded = item.isExpanded();
  const matchRoute = useMatchRoute();
  const isMatch = !!matchRoute({
    to: "/novel/$novelId/$volumeId",
    params: {
      novelId,
      volumeId: volumeData.id,
    },
  });
  const isRenaming = item.isRenaming();
  const { isMobile } = useSidebar();

  const quickCreateChapter = () => {
    const { id: newId } = createChapter(novelStore, { volumeId: volumeData.id });
    navigate({
      to: "/novel/$novelId/$volumeId/$chapterId",
      params: {
        novelId,
        volumeId: volumeData.id,
        chapterId: newId,
      },
    });
  };

  const handleDelete = () => {
    novelStore.commit(
      novelEvents.volumeDeleted({
        id: volumeData.id,
        deleted: new Date(),
      }),
    );
    const aboveItem = item.getItemAbove();
    if (aboveItem) {
      const aboveChapterData = aboveItem.getItemData();
      switch (aboveChapterData.type) {
        case "volume":
          navigate({
            to: "/novel/$novelId/$volumeId",
            params: {
              novelId,
              volumeId: aboveChapterData.id,
            },
          });
          break;
        case "chapter":
          navigate({
            to: "/novel/$novelId/$volumeId/$chapterId",
            params: {
              novelId,
              volumeId: aboveChapterData.volumeId,
              chapterId: aboveChapterData.id,
            },
          });
          break;
        default:
          throw shouldNeverHappen("data.type !== volume && data.type !== chapter");
      }
    }
  };
  return (
    <SidebarMenuItem
      className={cn("rounded-md list-none", isRenaming && "z-1", className)}
      tabIndex={-1}
      {...props}
    >
      <SidebarMenuAction
        onClick={(e) => {
          e.stopPropagation();
          if (isExpanded) {
            item.collapse();
          } else {
            item.expand();
          }
        }}
        className={cn("left-1.5 right-auto")}
      >
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

      {isRenaming ? (
        <Input
          className="ring-sidebar-ring text-sm pl-8 pr-13"
          {...item.getRenameInputProps()}
        ></Input>
      ) : (
        <SidebarMenuButton
          className={cn("w-full group/volume pl-8")}
          render={
            <Link
              to="/novel/$novelId/$volumeId"
              params={{
                novelId,
                volumeId: volumeData.id,
              }}
              preload="render"
            ></Link>
          }
          isActive={isMatch}
        >
          <span className="flex-1">{item.getItemName()}</span>
        </SidebarMenuButton>
      )}
      {/* 快捷添加章节按钮 */}
      <SidebarMenuAction
        showOnHover={!isExpanded && !isMatch}
        className={cn("right-7")}
        onClick={(e) => {
          e.stopPropagation();
          quickCreateChapter();
        }}
      >
        <Plus />
        <span className="sr-only">添加章节</span>
      </SidebarMenuAction>
      <DropdownMenu modal={false}>
        <SidebarMenuAction
          showOnHover={!isExpanded && !isMatch}
          onClick={(e) => {
            e.stopPropagation();
          }}
          render={DropdownMenuTrigger}
        >
          <MoreHorizontal />
          <span className="sr-only">More</span>
        </SidebarMenuAction>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={quickCreateChapter}>
            <Plus />
            Add Chapter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={item.startRenaming}>
            <Pencil />
            Rename
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};
