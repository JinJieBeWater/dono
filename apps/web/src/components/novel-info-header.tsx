import { MoreVertical, Trash2, Upload, RefreshCw, BookOpen } from "lucide-react";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useUserStore, novel$ } from "@/stores/user";
import { DeleteNovelDialog, deleteNovelDialog } from "@/components/dialogs/delete-novel-dialog";

interface NovelInfoHeaderProps {
  novelId: string;
}

export function NovelInfoHeader({ novelId }: NovelInfoHeaderProps) {
  const userStore = useUserStore();
  const novel = userStore.useQuery(novel$({ novelId }));

  const handleImport = () => {
    console.log("Import content");
  };

  const handleReorganize = () => {
    console.log("Reorganize");
  };

  return (
    <>
      <div className="relative px-2 py-4 group">
        <div className="absolute top-2 right-0">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              }
            >
              <MoreVertical className="w-4 h-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleReorganize}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reorganize
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                render={
                  <AlertDialogTrigger
                    handle={deleteNovelDialog}
                    payload={{ novelId, novelTitle: novel?.title ?? "" }}
                    nativeButton={false}
                  />
                }
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Novel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-start gap-2 pr-10">
          <BookOpen className="size-6 mt-1.5 text-muted-foreground" />
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{novel?.title || "Untitled"}</h1>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Created {novel.created.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <DeleteNovelDialog />
    </>
  );
}
