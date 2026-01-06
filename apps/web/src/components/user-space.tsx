import {
  useUserStore,
  userEvents,
  visibleNovels$,
  trashedNovels$,
  userTables,
} from "@/stores/user";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Edit,
  FileText,
  ChevronRight,
  Trash2,
  RotateCcw,
  X,
  MoreVertical,
  Plus,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
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
import {
  DeleteNovelPermanentlyDialog,
  deleteNovelPermanentlyDialog,
} from "./dialogs/delete-novel-permanently-dialog";
import { EmptyTrashDialog, emptyTrashDialog } from "./dialogs/empty-trash-dialog";
import type { Novel } from "@/stores/user";

export function UserSpace() {
  const userStore = useUserStore();
  const [{ lastAccessedNovelId }] = userStore.useClientDocument(userTables.uiState);

  const novels = userStore.useQuery(visibleNovels$());
  const trashedNovels = userStore.useQuery(trashedNovels$());

  const getBookCoverUrl = (novelId: string) => {
    return `https://picsum.photos/seed/${novelId}/400/600`;
  };

  const recentNovel =
    novels.length > 0 ? novels.find((novel) => novel.id === lastAccessedNovelId) : null;

  const renderNovelCard = (novel: Novel) => (
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
            <DropdownMenuItem render={<Link to="/novel/$novelId" params={{ novelId: novel.id }} />}>
              <Edit />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                userStore.commit(
                  userEvents.novelDeleted({
                    id: novel.id,
                    deleted: new Date(),
                  }),
                );
              }}
            >
              <Trash2 />
              Move to Trash
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );

  const renderTrashedCard = (novel: Novel) => (
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
          <DropdownMenuTrigger render={<Button variant="ghost" />}>
            <MoreVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => restoreNovel(novel)}>
              <RotateCcw />
              Restore
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialogTrigger
              handle={deleteNovelPermanentlyDialog}
              payload={{ novelId: novel.id, novelTitle: novel.title }}
              render={
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => e.preventDefault()}
                >
                  <X />
                  Delete Forever
                </DropdownMenuItem>
              }
              nativeButton={false}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );

  const restoreNovel = (novel: Novel) => {
    userStore.commit(
      userEvents.novelRestored({
        id: novel.id,
        modified: new Date(),
      }),
    );
  };

  return (
    <div className="w-full mx-auto p-4 space-y-4">
      {recentNovel && (
        <Card size="sm" className="bg-linear-to-br from-accent/50 to-background ">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Edit className="w-4 h-4" />
              <span className="text-xs font-medium">Continue Editing</span>
            </div>
            <CardTitle className="text-lg">{recentNovel.title}</CardTitle>
            <CardDescription>{recentNovel.created.toLocaleDateString()} created</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={
                <Link
                  to="/novel/$novelId"
                  params={{ novelId: recentNovel.id }}
                  preload="viewport"
                />
              }
              nativeButton={false}
              className="group"
            >
              Continue
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      )}

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

        <TabsContent value="novels" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold mb-1">My Novels</h1>
              <p className="text-sm text-muted-foreground">
                {novels.length} {novels.length === 1 ? "novel" : "novels"}
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
                {trashedNovels.length} {trashedNovels.length === 1 ? "item" : "items"}
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
      <DeleteNovelPermanentlyDialog />
      <EmptyTrashDialog />
    </div>
  );
}
