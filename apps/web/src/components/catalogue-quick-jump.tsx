import { Link, useMatchRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Item } from "./ui/item";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCatalogueTree, type CatalogueTreeItem } from "@/hooks/use-catalogue-tree";
import type { ItemInstance } from "@headless-tree/core";
import { useNovelStore } from "@/stores/novel";
import { createChapter } from "@/stores/novel/command";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export function CatalogueQuickJump({ className, ...props }: React.ComponentProps<"div">) {
  const match = useMatchRoute();
  const navigate = useNavigate();
  const novelId = useParams({
    from: "/novel/$novelId",
    select: ({ novelId }) => novelId,
  });
  const volumeId = useParams({
    from: "/novel/$novelId/$volumeId",
    shouldThrow: false,
    select: ({ volumeId }) => volumeId,
  });

  const volumeParams = match({
    to: "/novel/$novelId/$volumeId",
  });
  const isChapterPage = !!match({
    to: "/novel/$novelId/$volumeId/$chapterId",
  });
  const isShow = volumeParams || isChapterPage;

  const { tree } = useCatalogueTree();

  const currentItem = tree.getFocusedItem();
  const name = currentItem?.getItemName();
  const prevItem = currentItem?.getItemAbove();
  const nextItem = currentItem?.getItemBelow();

  const novelStore = useNovelStore(novelId);

  const handleCreateChapter = () => {
    if (!volumeId) throw shouldNeverHappen("params is null");
    const { id: newId } = createChapter(novelStore, { volumeId: volumeId });
    navigate({
      to: "/novel/$novelId/$volumeId/$chapterId",
      params: {
        novelId,
        volumeId,
        chapterId: newId,
      },
    });
  };

  if (!isShow) return null;

  return (
    <Item variant={"outline"} className={cn("p-0 w-fit bg-sidebar", className)} {...props}>
      <ButtonGroup>
        <Button
          disabled={!prevItem}
          className="border-0 bg-inherit"
          variant="outline"
          size={"icon"}
          render={<QuickJumpLink item={prevItem}></QuickJumpLink>}
          nativeButton={false}
        >
          <ChevronLeft />
        </Button>
        {nextItem ? (
          <Button
            disabled={!nextItem}
            className="border-0 bg-inherit"
            variant="outline"
            size={"icon"}
            nativeButton={false}
            render={<QuickJumpLink item={nextItem}></QuickJumpLink>}
          >
            <ChevronRight />
          </Button>
        ) : (
          <Button
            className="border-0 bg-inherit"
            variant="outline"
            size={"icon"}
            onClick={handleCreateChapter}
          >
            <Plus />
            <span className="sr-only">Add Chapter</span>
          </Button>
        )}
        <Button
          className="border-0 bg-inherit line-clamp-1 hidden max-w-64 sm:block"
          variant="outline"
        >
          <span className={cn(!name && "text-muted-foreground")}>{name || "Unamed"}</span>
        </Button>
      </ButtonGroup>
    </Item>
  );
}

const QuickJumpLink = ({
  item,
  children,
  ...props
}: {
  item: ItemInstance<CatalogueTreeItem> | undefined;
  children?: React.ReactNode;
} & React.ComponentProps<"a">) => {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });
  const itemData = item?.getItemData();

  switch (itemData?.type) {
    case "volume":
      return (
        <Link
          to="/novel/$novelId/$volumeId"
          params={{
            novelId,
            volumeId: itemData.id,
          }}
          {...props}
        >
          {children}
        </Link>
      );
    case "chapter":
      return (
        <Link
          to="/novel/$novelId/$volumeId/$chapterId"
          params={{
            novelId,
            volumeId: itemData.volumeId,
            chapterId: itemData.id,
          }}
          {...props}
        >
          {children}
        </Link>
      );
    default:
      return (
        <Link
          to="/novel/$novelId"
          params={{
            novelId,
          }}
          {...props}
        >
          {children}
        </Link>
      );
  }
};
