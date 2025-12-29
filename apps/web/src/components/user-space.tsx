import { useUserStore, userEvents, visibleNovels$, trashedNovels$ } from "@/stores/user";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { useState } from "react";
import type { Novel } from "@/stores/user";

export function UserSpace() {
  const userStore = useUserStore();

  // 查询所有可见的小说
  const novels = userStore.useQuery(visibleNovels$());
  // 查询回收站中的小说
  const trashedNovels = userStore.useQuery(trashedNovels$());

  // 弹窗状态管理
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emptyTrashDialogOpen, setEmptyTrashDialogOpen] = useState(false);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newNovelTitle, setNewNovelTitle] = useState("");

  // 创建新小说
  const createNovel = () => {
    if (!newNovelTitle.trim()) return;
    const date = new Date();
    userStore.commit(
      userEvents.novelCreated({
        id: crypto.randomUUID(),
        title: newNovelTitle,
        created: date,
        modified: date,
      }),
    );
    setNewNovelTitle("");
    setCreateDialogOpen(false);
  };

  // 软删除小说（移至回收站）
  const moveToTrash = (novel: Novel) => {
    userStore.commit(
      userEvents.novelDeleted({
        id: novel.id,
        deleted: new Date(),
      }),
    );
  };

  // 恢复小说
  const restoreNovel = (novel: Novel) => {
    userStore.commit(
      userEvents.novelRestored({
        id: novel.id,
        modified: new Date(),
      }),
    );
  };

  // 永久删除小说（这里暂时用软删除，后续可以添加真正的删除事件）
  const deleteForever = (novel: Novel) => {
    // TODO: 实现真正的永久删除逻辑
    // 目前保持deleted状态，后续可添加 novelPermanentlyDeleted 事件
    console.log("永久删除小说:", novel.title);
    setDeleteDialogOpen(false);
  };

  // 清空回收站
  const emptyTrash = () => {
    trashedNovels.forEach((novel) => {
      // TODO: 使用永久删除事件
      console.log("永久删除小说:", novel.title);
    });
    setEmptyTrashDialogOpen(false);
  };

  // 生成封面图片 URL
  const getBookCoverUrl = (novelId: string) => {
    return `https://picsum.photos/seed/${novelId}/400/600`;
  };

  // 获取最近访问的小说
  const recentNovel =
    novels.length > 0
      ? [...novels].sort((a, b) => {
          const aTime = a.lastAccessed?.getTime() || a.modified.getTime();
          const bTime = b.lastAccessed?.getTime() || b.modified.getTime();
          return bTime - aTime;
        })[0]
      : null;

  // 渲染小说卡片（用于活跃列表）
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
        <ItemDescription>{novel.modified.toLocaleDateString()} updated</ItemDescription>
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
                moveToTrash(novel);
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

  // 渲染回收站卡片
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
        <ItemDescription>
          Deleted: {novel.deleted?.toLocaleDateString() || "Unknown"}
        </ItemDescription>
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
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setSelectedNovel(novel);
                setDeleteDialogOpen(true);
              }}
            >
              <X />
              Delete Forever
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ItemActions>
    </Item>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      {/* 快速继续卡片 - 只在有小说时显示 */}
      {recentNovel && (
        <Card size="sm" className="mb-6 bg-linear-to-br from-accent/50 to-background ">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Edit />
              <span className="text-xs font-medium">Continue Editing</span>
            </div>
            <CardTitle className="text-lg">{recentNovel.title}</CardTitle>
            <CardDescription>
              Last edited: {recentNovel.modified.toLocaleDateString()}
            </CardDescription>
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

      {/* Tabs 切换视图 */}
      <Tabs defaultValue="novels" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="novels" className="gap-2">
            <BookOpen />
            My Novels
          </TabsTrigger>
          <TabsTrigger value="trash" className="gap-2">
            <Trash2 />
            Trash
          </TabsTrigger>
        </TabsList>

        {/* My Novels 视图 */}
        <TabsContent value="novels">
          {/* 头部：标题和新建按钮 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold mb-1">My Novels</h1>
              <p className="text-sm text-muted-foreground">
                {novels.length} {novels.length === 1 ? "novel" : "novels"}
              </p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} size="icon" variant="ghost">
              <Plus />
            </Button>
          </div>

          {/* 小说列表 */}
          {novels.length > 0 ? (
            <ItemGroup>{novels.map(renderNovelCard)}</ItemGroup>
          ) : (
            /* 空状态 */
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
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <FileText />
                  Create Your First Novel
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </TabsContent>

        {/* Trash 视图 */}
        <TabsContent value="trash">
          {/* 头部：标题和清空按钮 */}
          <div className="flex items-center justify-between mb-6">
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
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setEmptyTrashDialogOpen(true)}
                  >
                    <Trash2 />
                    Empty Trash
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* 回收站列表 */}
          {trashedNovels.length > 0 ? (
            <ItemGroup>{trashedNovels.map(renderTrashedCard)}</ItemGroup>
          ) : (
            /* 空状态 */
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Trash2 />
                </EmptyMedia>
                <EmptyTitle>Trash is empty</EmptyTitle>
                <EmptyDescription>
                  Deleted novels will appear here. You can restore them or delete them forever.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </TabsContent>
      </Tabs>

      {/* 创建小说弹窗 */}
      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Novel</AlertDialogTitle>
            <AlertDialogDescription>Enter a title for your new novel</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="novel-title">Novel Title</Label>
            <Input
              id="novel-title"
              placeholder="Enter novel title..."
              value={newNovelTitle}
              onChange={(e) => setNewNovelTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  createNovel();
                }
              }}
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={createNovel} disabled={!newNovelTitle.trim()}>
              Create
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 永久删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Forever?</AlertDialogTitle>
            <AlertDialogDescription>
              "{selectedNovel?.title}" will be permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedNovel && deleteForever(selectedNovel)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空回收站确认弹窗 */}
      <AlertDialog open={emptyTrashDialogOpen} onOpenChange={setEmptyTrashDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Empty Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              All {trashedNovels.length} {trashedNovels.length === 1 ? "item" : "items"} will be
              permanently deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={emptyTrash}
              className="bg-destructive hover:bg-destructive/90"
            >
              Empty Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
