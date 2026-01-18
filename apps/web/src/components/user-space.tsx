import { trashedNovels$, userEvents, userTables, visibleNovels$ } from "@dono/stores/user";
import { useUserStore } from "@/stores/user";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { BookOpen, Edit, FileText, Trash2, RotateCcw, X, MoreVertical, Plus } from "lucide-react";
import {
  Item,
  ItemGroup,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from "./ui/item";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "./ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { AlertDialogTrigger } from "./ui/alert-dialog";
import { CreateNovelDialog, createNovelDialog } from "./dialogs/create-novel-dialog";
import { PurgeNovelDialog, purgeNovelDialog } from "./dialogs/purge-novel-dialog";
import { EmptyTrashDialog, emptyTrashDialog } from "./dialogs/empty-trash-dialog";
import type { Novel } from "@dono/stores/user";
import { RecentNovelCard } from "./recent-novel-card";

function getBookCoverUrl(novelId: string): string {
  return `https://picsum.photos/seed/${novelId}/400/600`;
}

function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function UserSpace() {
  const userStore = useUserStore();
  const [{ lastAccessedNovelId }] = userStore.useClientDocument(userTables.uiState);

  const novels = userStore.useQuery(visibleNovels$());
  const trashedNovels = userStore.useQuery(trashedNovels$());

  const recentNovel =
    novels.length > 0 ? novels.find((novel) => novel.id === lastAccessedNovelId) : null;

  function restoreNovel(novel: Novel): void {
    userStore.commit(
      userEvents.novelRestored({
        id: novel.id,
        modified: new Date(),
      }),
    );
  }

  function deleteNovel(novel: Novel): void {
    userStore.commit(
      userEvents.novelDeleted({
        id: novel.id,
        deleted: new Date(),
      }),
    );
  }

  function renderNovelCard(novel: Novel) {
    return (
      <Item
        key={novel.id}
        variant="outline"
        render={<Link to="/novel/$novelId" params={{ novelId: novel.id }} />}
      >
        <ItemMedia variant="image">
          <img
            src={getBookCoverUrl(novel.id)}
            alt={novel.title}
            className="aspect-2/3 object-cover"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{novel.title}</ItemTitle>
          <ItemDescription>{novel.created.toLocaleDateString()} created</ItemDescription>
        </ItemContent>
        <ItemActions>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" onClick={(e) => e.preventDefault()} />}
            >
              <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link to="/novel/$novelId" params={{ novelId: novel.id }} />}
              >
                <Edit />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteNovel(novel);
                }}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>
    );
  }

  function renderTrashedCard(novel: Novel) {
    return (
      <Item key={novel.id} variant="outline">
        <ItemMedia variant="image">
          <img
            src={getBookCoverUrl(novel.id)}
            alt={novel.title}
            className="aspect-2/3 object-cover opacity-60"
          />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="text-muted-foreground">{novel.title}</ItemTitle>
          <ItemDescription>{novel.deleted?.toLocaleDateString()} deleted</ItemDescription>
        </ItemContent>
        <ItemActions>
          <DropdownMenu>
            <Button variant="ghost" render={<DropdownMenuTrigger />}>
              <MoreVertical />
            </Button>

            <DropdownMenuContent align="end" className="w-max">
              <DropdownMenuItem onClick={() => restoreNovel(novel)}>
                <RotateCcw />
                Restore
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => e.preventDefault()}
                variant="destructive"
                nativeButton={true}
                render={
                  <AlertDialogTrigger
                    handle={purgeNovelDialog}
                    payload={{ novelId: novel.id, novelTitle: novel.title }}
                  />
                }
              >
                <X />
                Delete Forever
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ItemActions>
      </Item>
    );
  }

  return (
    <div className="w-full mx-auto p-4 space-y-4 md:w-2xl scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20 scrollbar-hover:scrollbar-thumb-primary">
      {recentNovel && <RecentNovelCard novel={recentNovel} />}

      <Tabs defaultValue="novels" className="w-full">
        <TabsList className="mb-2">
          <TabsTrigger value="novels" className="gap-2">
            <BookOpen />
            My Novels
          </TabsTrigger>
          <TabsTrigger value="trash" className="gap-2">
            <Trash2 />
            Trash
          </TabsTrigger>
        </TabsList>

        <TabsContent value="novels" className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1">My Novels</h1>
              <p className="text-sm text-muted-foreground">
                {novels.length} {pluralize(novels.length, "novel", "novels")}
              </p>
            </div>

            <Button
              size="icon"
              variant="ghost"
              render={<AlertDialogTrigger handle={createNovelDialog} />}
            >
              <Plus />
            </Button>
          </div>

          {novels.length > 0 ? (
            <ItemGroup>{novels.map(renderNovelCard)}</ItemGroup>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>No novels yet</EmptyTitle>
                <EmptyDescription>
                  Start your first novel and bring your stories to life
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button render={<AlertDialogTrigger handle={createNovelDialog} />}>
                  <FileText />
                  Create Your First Novel
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </TabsContent>

        <TabsContent value="trash" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1">Trash</h1>
              <p className="text-sm text-muted-foreground">
                {trashedNovels.length} {pluralize(trashedNovels.length, "item", "items")}
              </p>
            </div>
            {trashedNovels.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
                  <MoreVertical />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <AlertDialogTrigger
                    handle={emptyTrashDialog}
                    payload={{ count: trashedNovels.length }}
                    render={
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => e.preventDefault()}
                      >
                        <Trash2 />
                        Empty Trash
                      </DropdownMenuItem>
                    }
                    nativeButton={false}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {trashedNovels.length > 0 ? (
            <ItemGroup>{trashedNovels.map(renderTrashedCard)}</ItemGroup>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Trash2 />
                </EmptyMedia>
                <EmptyTitle>Trash is empty</EmptyTitle>
                <EmptyDescription>Deleted novels will appear here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </TabsContent>
      </Tabs>

      <CreateNovelDialog />
      <PurgeNovelDialog />
      <EmptyTrashDialog />
    </div>
  );
}
