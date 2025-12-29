import { novelEvents, useNovelStore, visibleVolumes$ } from "@/stores/novel";
import { useUserStore, novel$, userEvents } from "@/stores/user";
import { Button } from "./ui/button";
import { Item, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "./ui/item";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "./ui/empty";
import { ArrowLeft, MoreVertical, FileText, Trash2, BookOpen } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";

export function NovelSpace({ novelId }: { novelId: string }) {
  const navigate = useNavigate();
  const userStore = useUserStore();
  const novelStore = useNovelStore(novelId);

  const novel = userStore.useQuery(novel$({ novelId }));
  const volumes = novelStore.useQuery(visibleVolumes$());

  const createVolume = (title: string) => {
    const date = new Date();
    novelStore.commit(
      novelEvents.volumeCreated({
        id: crypto.randomUUID(),
        title: title,
        created: date,
        modified: date,
      }),
    );
  };

  const deleteNovel = () => {
    userStore.commit(
      userEvents.novelDeleted({
        id: novelId,
        deleted: new Date(),
      }),
    );
    navigate({
      to: "/",
      replace: true,
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" render={<Link to="/"></Link>} nativeButton={false}>
          <ArrowLeft className="w-4 h-4 " />
          Back
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost">
                <MoreVertical className="w-4 h-4" />
              </Button>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Novel Info</DropdownMenuItem>
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={deleteNovel}>
              <Trash2 className="w-4 h-4" />
              Delete Novel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 小说信息卡片 */}
      <Card size="sm" className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{novel?.title}</CardTitle>
          <CardDescription>Last edited: {novel?.modified.toLocaleDateString()}</CardDescription>
        </CardHeader>
      </Card>

      {/* Volumes 标题和按钮 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Volumes ({volumes.length})</h3>
        <Button onClick={() => createVolume("New Volume")}>
          <FileText className="w-4 h-4 mr-2" />
          Add Volume
        </Button>
      </div>

      {/* Volumes 列表 */}
      {volumes.length > 0 ? (
        <ItemGroup>
          {volumes.map((volume) => (
            <Item key={volume.id} variant="outline">
              <ItemContent>
                <ItemTitle>{volume.title}</ItemTitle>
                <ItemDescription>
                  {volume.created.toLocaleDateString()} • {volume.modified.toLocaleDateString()}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </ItemGroup>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>No volumes yet</EmptyTitle>
            <EmptyDescription>Create your first volume to start writing</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => createVolume("Volume 1")} size="lg">
              <FileText className="w-4 h-4 mr-2" />
              Create First Volume
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
