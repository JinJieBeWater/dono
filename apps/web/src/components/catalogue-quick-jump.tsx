import { Link, useMatchRoute, useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { Item } from "./ui/item";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { type CatalogueTreeItem } from "@/hooks/use-catalogue-tree";
import { createChapter } from "@dono/stores/novel";
import { useNovelStore } from "@/stores/novel";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import { useCatalogueData } from "@/hooks/use-catalogue-data";

export function CatalogueQuickJump() {
  const match = useMatchRoute();

  const volumeId = useParams({
    from: "/novel/$novelId/$volumeId",
    shouldThrow: false,
    select: ({ volumeId }) => volumeId,
  });
  const novelId = useParams({
    from: "/novel/$novelId",
    select: ({ novelId }) => novelId,
  });

  const isChapterPage = !!match({
    to: "/novel/$novelId/$volumeId/$chapterId",
  });
  const isShow = volumeId || isChapterPage;
  if (!isShow) return null;

  return <CatalogueQuickJumpInner novelId={novelId} volumeId={volumeId} />;
}

export function CatalogueQuickJumpInner({
  volumeId,
  novelId,
}: {
  volumeId?: string;
  novelId: string;
}) {
  const navigate = useNavigate();
  const { focusedItem, getItemAbove, getItemBelow, getItemNameById } = useCatalogueData();

  const name = getItemNameById(focusedItem);
  const prevItem = getItemAbove(focusedItem);
  const nextItem = getItemBelow(focusedItem);

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

  return (
    <Item variant={"outline"} className={cn("p-0 w-fit bg-sidebar")}>
      <ButtonGroup>
        <Button
          disabled={!prevItem}
          className="border-0 bg-inherit"
          variant="outline"
          size={"icon"}
          render={
            <QuickJumpLink
              item={prevItem}
              className={cn(!prevItem && "cursor-not-allowed")}
            ></QuickJumpLink>
          }
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
          <p className={cn("truncate", !name && "text-muted-foreground")}>{name || "Unamed"}</p>
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
  item: CatalogueTreeItem | undefined;
  children?: React.ReactNode;
} & React.ComponentProps<"a">) => {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });

  switch (item?.type) {
    case "volume":
      return (
        <Link
          to="/novel/$novelId/$volumeId"
          params={{
            novelId,
            volumeId: item.id,
          }}
          preload="render"
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
            volumeId: item.volumeId,
            chapterId: item.id,
          }}
          preload="render"
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
          preload="render"
          {...props}
        >
          {children}
        </Link>
      );
  }
};
