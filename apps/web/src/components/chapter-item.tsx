import { cn } from "@/lib/utils";
import { type CatalogueTreeChapterItem, type CatalogueTreeItem } from "@/hooks/use-catalogue-tree";
import { Link, useNavigate } from "@tanstack/react-router";
import { memo, type ComponentProps } from "react";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import { ScrollText, MoreHorizontal, Trash, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { novelEvents } from "@dono/stores/novel";
import { useNovelStore } from "@/stores/novel";
import { Input } from "./ui/input";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import type { ItemInstance } from "@headless-tree/core";

const ChapterItemImpl = ({
  novelId,
  data,
  isRenaming,
  isMatch,
  getRenameInputProps,
  className,
  startRenaming,
  getItemAbove,
  ...props
}: ComponentProps<typeof SidebarMenuItem> & {
  data: CatalogueTreeChapterItem;
  novelId: string;
  isRenaming: boolean;
  isMatch: boolean;
  getRenameInputProps: () => any;
  startRenaming: () => void;
  getItemAbove: () => ItemInstance<CatalogueTreeItem> | undefined;
}) => {
  if (data.type !== "chapter") throw shouldNeverHappen("item.type !== chapter");

  const novelStore = useNovelStore(novelId);
  const navigate = useNavigate();

  const handleDelete = () => {
    novelStore.commit(
      novelEvents.chapterDeleted({
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
      <SidebarMenuAction className={cn("left-1.5 right-auto")} tabIndex={-1}>
        <ScrollText />
      </SidebarMenuAction>

      {isRenaming ? (
        <Input className="ring-sidebar-ring text-sm pl-8 pr-13" {...getRenameInputProps()}></Input>
      ) : (
        <SidebarMenuButton
          isActive={isMatch}
          className={cn("w-full pl-8", !data.title && "text-muted-foreground")}
          render={
            <Link
              to="/novel/$novelId/$volumeId/$chapterId"
              params={{
                novelId,
                volumeId: data.volumeId,
                chapterId: data.id,
              }}
            >
              <div className="line-clamp-1">{data.title || "Unamed Chapter"}</div>
            </Link>
          }
        ></SidebarMenuButton>
      )}

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

export const ChapterItem = memo(ChapterItemImpl, (prev, next) => {
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
