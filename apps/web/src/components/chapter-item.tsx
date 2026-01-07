import { cn } from "@/lib/utils";
import { type CatalogueTreeItem } from "@/hooks/use-catalogue-tree";
import { Link, useMatchRoute, useNavigate } from "@tanstack/react-router";
import { type ComponentProps } from "react";
import { SidebarMenuAction, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
import type { ItemInstance } from "@headless-tree/core";
import { ScrollText, MoreHorizontal, Trash, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { novelEvents, useNovelStore } from "@/stores/novel";
import { Input } from "./ui/input";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export const ChapterItem = ({
  novelId,
  item,
  className,
  ...props
}: ComponentProps<typeof SidebarMenuItem> & {
  novelId: string;
  item: ItemInstance<CatalogueTreeItem>;
}) => {
  const chapterData = item.getItemData();
  if (chapterData.type !== "chapter") throw shouldNeverHappen("item.type !== chapter");

  const novelStore = useNovelStore(novelId);
  const matchRoute = useMatchRoute();
  const navigate = useNavigate();
  const isRenaming = item.isRenaming();
  const isMatch = !!matchRoute({
    to: "/novel/$novelId/$volumeId/$chapterId",
    params: {
      novelId,
      volumeId: chapterData.volumeId,
      chapterId: chapterData.id,
    },
  });

  const handleDelete = () => {
    novelStore.commit(
      novelEvents.chapterDeleted({
        id: chapterData.id,
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
      <SidebarMenuAction className={cn("left-1.5 right-auto")} tabIndex={-1}>
        <ScrollText />
      </SidebarMenuAction>

      {isRenaming ? (
        <Input
          className="ring-sidebar-ring text-sm pl-8 pr-13"
          {...item.getRenameInputProps()}
        ></Input>
      ) : (
        <SidebarMenuButton
          isActive={isMatch}
          className={cn("w-full pl-8")}
          render={
            <Link
              to="/novel/$novelId/$volumeId/$chapterId"
              preload="viewport"
              params={{
                novelId,
                volumeId: chapterData.volumeId,
                chapterId: chapterData.id,
              }}
            ></Link>
          }
        >
          <span className={cn(!chapterData.title && "text-muted-foreground")}>
            {chapterData.title ? chapterData.title : "Unamed Chapter"}
          </span>
        </SidebarMenuButton>
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
