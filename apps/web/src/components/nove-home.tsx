import { userEvents, type Novel } from "@dono/stores/user";
import { useUserStore } from "@/stores/user";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { createPortal } from "react-dom";
import {
  Archive,
  ArrowUpToLine,
  BookPlus,
  Clock,
  Download,
  MoreVertical,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { CatalogueQuickAccess } from "@/components/catalogue-quick-access";
import { CatalogueTree } from "@/components/catalogue-tree";
import { createVolumeDialog } from "@/components/dialogs/create-volume-dialog";
import { Button } from "@/components/ui/button";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Editable, EditableInput, EditablePreview } from "@/components/ui/editable";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { useSidebar } from "@/components/ui/sidebar";
import { useCatalogueTree } from "@/hooks/use-catalogue-tree";
import { cn } from "@/lib/utils";
import { shouldNeverHappen } from "@/utils/should-never-happen";

export function NoveHome({ novelId, novel }: { novelId: string; novel: Novel }) {
  const { open, isMobile } = useSidebar();
  const userStore = useUserStore();
  const { tree } = useCatalogueTree();
  const navigate = useNavigate();

  const lastItem = tree.getItems().at(-1)?.getItemData();
  const shouldShowNavigation = !open || isMobile;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleContinueWritingClick = () => {
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
    navigate({ to: "/" });
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
    <div
      className={cn(
        "md:max-w-[84svw] lg:max-w-[74svw] xl:max-w-[66svw] 2xl:max-w-[58svw] transition-[max-width] mx-auto md:grid md:grid-cols-[3fr_minmax(0,16rem)] md:px-12 md:gap-2 h-full",
        !shouldShowNavigation && "md:grid-cols-1",
      )}
    >
      <header className="pt-6 px-6 md:px-0 md:pt-[13svh] md:sticky top-[calc(var(--header-height)+1rem)] h-fit bg-background">
        <div className="space-y-2 md:space-y-4 mb-6">
          <div className="inline-flex items-center gap-2 px-2 md:px-3 py-1 rounded-full bg-sidebar text-primary text-xs md:text-sm font-medium border">
            <Sparkles className="size-4" />
            <span>Writing</span>
          </div>
          <Editable
            value={novel.title || "Untitled Novel"}
            onSubmit={async (newTitle: string) => {
              if (newTitle.trim() === novel.title) return;

              userStore.commit(
                userEvents.novelTitleUpdated({
                  id: novelId,
                  title: newTitle.trim(),
                  modified: new Date(),
                }),
              );
            }}
          >
            <EditablePreview
              render={
                <h1 className="text-2xl! md:text-4xl font-bold tracking-tight text-foreground leading-tight" />
              }
            />
            <EditableInput className="text-2xl! md:text-4xl font-bold tracking-tight text-foreground leading-tight bg-background border-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
          </Editable>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <Clock className="size-4" />
            <time dateTime={novel.created.toISOString()}>Created {formatDate(novel.created)}</time>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastItem ? (
            <Button variant="default" size="sm" onClick={handleContinueWritingClick}>
              <Pencil />
              <span>Continue Writing</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              render={<AlertDialogTrigger handle={createVolumeDialog} />}
            >
              <BookPlus />
              <span>Create Your First Volume</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleImport}>
                <Upload />
                Import
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport} disabled={!lastItem}>
                <Download />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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

      {shouldShowNavigation && (
        <div className="px-2 md:px-0 md:pt-[13svh] md:pb-[50svh] overflow-auto">
          <CatalogueQuickAccess showBackHome={false} />
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
