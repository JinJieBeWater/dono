import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { novel$, useUserStore, userEvents } from "@/stores/user";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Pencil,
  Clock,
  MoreVertical,
  Sparkles,
  Trash2,
  Archive,
  ArrowUpToLine,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CatalogueQuickAccess } from "@/components/catalogue-quick-access";
import { CatalogueTree } from "@/components/catalogue-tree";
import { useSidebar } from "@/components/ui/sidebar";
import { useCatalogueTree } from "@/hooks/use-catalogue-tree";
import { shouldNeverHappen } from "@/utils/should-never-happen";
import { Editable, EditablePreview, EditableInput } from "@/components/ui/editable";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import { ScrollToTop } from "@/components/ui/scroll-to-top";

export const Route = createFileRoute("/novel/$novelId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { novelId } = useParams({ from: "/novel/$novelId/" });
  const { open, isMobile } = useSidebar();
  const userStore = useUserStore();
  const novel = userStore.useQuery(novel$({ novelId }));
  const { tree } = useCatalogueTree();
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // 处理标题更新
  const handleTitleUpdate = async (newTitle: string) => {
    if (newTitle.trim() === novel.title) return;

    userStore.commit(
      userEvents.novelTitleUpdated({
        id: novelId,
        title: newTitle.trim(),
        modified: new Date(),
      }),
    );
  };

  const HandleContinueWritingClick = () => {
    const lastItem = tree.getItems().at(-1)?.getItemData();
    switch (lastItem?.type) {
      case "volume":
        navigate({
          to: "/novel/$novelId/$volumeId",
          params: {
            novelId,
            volumeId: lastItem.id,
          },
        });
        break;
      case "chapter":
        navigate({
          to: "/novel/$novelId/$volumeId/$chapterId",
          params: {
            novelId,
            volumeId: lastItem.volumeId,
            chapterId: lastItem.id,
          },
        });
        break;
      default:
        throw shouldNeverHappen(`Unexpected last item type: ${lastItem?.type}`);
    }
  };

  const handleDelete = () => {
    userStore.commit(
      userEvents.novelDeleted({
        id: novelId,
        deleted: new Date(),
      }),
    );
    navigate({
      to: "/",
    });
  };

  const handleImport = () => {
    toast.info("In development...");
  };

  const handleExport = () => {
    toast.info("In development...");
  };

  const handleArchive = () => {
    toast.info("In development...");
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100%-var(--header-height)-1rem)] pb-16">
      {/* 头部区域 - 标题和元信息 */}
      <div className="px-4 md:px-12">
        <header className="md:pt-[12svh] pt-4 pb-2 pd:mb-4">
          <div className="space-y-2 md:space-y-4 mb-6">
            <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-full bg-sidebar text-primary text-xs md:text-sm font-medium border">
              <Sparkles className="size-4" />
              <span>Writing</span>
            </div>
            <Editable value={novel.title || "Untitled Novel"} onSubmit={handleTitleUpdate}>
              <EditablePreview
                render={
                  <h1 className="text-2xl! md:text-4xl font-bold tracking-tight text-foreground leading-tight" />
                }
              />
              <EditableInput className="text-2xl! md:text-4xl font-bold tracking-tight text-foreground leading-tight bg-background border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
            </Editable>
            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
              <Clock className="size-4" />
              <time dateTime={novel.created.toISOString()}>
                Created {formatDate(novel.created)}
              </time>
            </div>
          </div>

          {/* 操作按钮组 */}
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="default" size="sm" onClick={HandleContinueWritingClick}>
              <Pencil />
              <span>Continue Writing</span>
            </Button>
            {/* <Button variant="outline" size="sm">
            <RefreshCw />
            <span>Sync</span>
          </Button> */}
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                <MoreVertical />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleImport}>
                  <Upload />
                  Import
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <Download />
                  Export
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem>
                <Settings />
                Settings
              </DropdownMenuItem> */}
                {/* 归档 */}
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive />
                  Archive
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleDelete}>
                  <Trash2 />
                  Delete Novel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
      </div>
      {/* 主内容区域 */}
      {(!open || isMobile) && (
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] md:gap-2 md:px-12 md:pt-2">
          {/* 快速访问 */}
          <CatalogueQuickAccess showBackHome={false} />
          {/* 卷章树 */}
          <CatalogueTree />
        </div>
      )}
      {createPortal(
        <ScrollToTop
          variant={"outline"}
          size={"icon-lg"}
          minHeight={800}
          scrollTo={10}
          className="fixed right-5 bottom-5 bg-sidebar"
        >
          <ArrowUpToLine />
        </ScrollToTop>,
        document.body,
      )}
    </div>
  );
}
