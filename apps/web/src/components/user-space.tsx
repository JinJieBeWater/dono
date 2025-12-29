import { useUserStore, userEvents, visibleNovels$ } from "@/stores/user";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { BookOpen, Edit, FileText, ChevronRight } from "lucide-react";
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

export function UserSpace() {
  const userStore = useUserStore();

  // 查询所有可见的小说
  const novels = userStore.useQuery(visibleNovels$());

  // 创建新小说
  const createNovel = (title: string) => {
    const date = new Date();
    userStore.commit(
      userEvents.novelCreated({
        id: crypto.randomUUID(),
        title: title,
        created: date,
        modified: date,
      }),
    );
  };

  // 生成封面图片 URL
  const getBookCoverUrl = (novelId: string) => {
    return `https://picsum.photos/seed/${novelId}/400/600`;
  };

  // 模拟：获取最近编辑的小说（取最新修改的那个）
  const recentNovel =
    novels.length > 0
      ? [...novels].sort((a, b) => b.modified.getTime() - a.modified.getTime())[0]
      : null;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      {/* 快速继续卡片 - 只在有小说时显示 */}
      {recentNovel && (
        <Card size="sm" className="mb-6 bg-linear-to-br from-accent/50 to-background ">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <Edit className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Continue Editing</span>
            </div>
            <CardTitle className="text-lg">{recentNovel.title}</CardTitle>
            <CardDescription>
              Last edited: {recentNovel.modified.toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              render={<Link to="/novel/$novelId" params={{ novelId: recentNovel.id }} />}
              nativeButton={false}
              size="sm"
              className="group"
            >
              Continue
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 头部：标题和新建按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold mb-1">My Novels</h1>
          <p className="text-sm text-muted-foreground">
            {novels.length} {novels.length === 1 ? "novel" : "novels"}
          </p>
        </div>
        <Button onClick={() => createNovel(`New Novel ${novels.length + 1}`)} size="lg">
          <FileText className="w-4 h-4" />
          New Novel
        </Button>
      </div>

      {/* 小说列表 */}
      {novels.length > 0 ? (
        <ItemGroup>
          {novels.map((novel) => {
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
                  <ItemDescription>{novel.modified.toLocaleDateString()} updated</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </ItemActions>
              </Item>
            );
          })}
        </ItemGroup>
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
            <Button onClick={() => createNovel("My First Novel")} size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Create Your First Novel
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
