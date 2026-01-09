import { cn } from "@/lib/utils";
import { type CatalogueTreeItem, type CatalogueTreeVolumeItem } from "@/hooks/use-catalogue-tree";
import { Link, useNavigate } from "@tanstack/react-router";
import { memo, type ComponentProps } from "react";
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

const VolumeItemImpl = ({
  novelId,
  data,
  isExpanded,
  isRenaming,
  isMatch,
  collapse,
  expand,
  startRenaming,
  getRenameInputProps,
  getItemAbove,
  className,
  ...props
}: ComponentProps<typeof SidebarMenuItem> & {
  novelId: string;
  data: CatalogueTreeVolumeItem;
  isExpanded: boolean;
  isRenaming: boolean;
  isMatch: boolean;
  collapse: () => void;
  expand: () => void;
  getRenameInputProps: () => any;
  startRenaming: () => void;
  getItemAbove: () => ItemInstance<CatalogueTreeItem> | undefined;
}) => {
  if (data.type !== "volume") throw shouldNeverHappen("item.type !== volume");
  const navigate = useNavigate();
  const novelStore = useNovelStore(novelId);
  const { isMobile } = useSidebar();

  const quickCreateChapter = () => {
    const { id: newId } = createChapter(novelStore, { volumeId: data.id });
    navigate({
      to: "/novel/$novelId/$volumeId/$chapterId",
      params: {
        novelId,
        volumeId: data.id,
        chapterId: newId,
      },
    });
  };

  const handleDelete = () => {
    novelStore.commit(
      novelEvents.volumeDeleted({
        id: data.id,
        deleted: new Date(),
      }),
    );
    const aboveItem = getItemAbove();
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
            collapse();
          } else {
            expand();
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
        <Input className="ring-sidebar-ring text-sm pl-8 pr-13" {...getRenameInputProps()}></Input>
      ) : (
        <SidebarMenuButton
          data-slot="canDoubleClick"
          className={cn("w-full group/volume pl-8 pr-13!", !data.title && "text-muted-foreground")}
          render={
            <Link
              to="/novel/$novelId/$volumeId"
              params={{
                novelId,
                volumeId: data.id,
              }}
            >
              <div className="line-clamp-1">{data.title || "Unamed Volume"}</div>
            </Link>
          }
          isActive={isMatch}
        ></SidebarMenuButton>
      )}
      {/* 快捷添加章节按钮 */}
      <SidebarMenuAction
        showOnHover={!isExpanded && !isMatch}
        className={cn("right-7")}
        onClick={(e) => {
          e.preventDefault();
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
          <DropdownMenuItem onClick={startRenaming}>
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

export const VolumeItem = memo(VolumeItemImpl, (prev, next) => {
  // 如果在 rename 状态下，需要重新渲染
  const isRenaming = next.isRenaming;
  if (isRenaming) {
    return false;
  }

  const prevKeys = Object.keys(prev) as (keyof typeof prev)[];
  const nextKeys = Object.keys(next) as (keyof typeof next)[];

  if (prevKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of prevKeys) {
    if (!Object.is(prev[key], next[key])) {
      return false;
    }
  }

  return true;
});
