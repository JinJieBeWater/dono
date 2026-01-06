import { BookOpen, Sparkles } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { lastVisibleChapter$, useNovelStore } from "@/stores/novel";
import { Link, useMatchRoute, useParams } from "@tanstack/react-router";

export function QuickAccess() {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });
  const matchRoute = useMatchRoute();
  const novelStore = useNovelStore(novelId);
  const lastestChapter = novelStore.useQuery(lastVisibleChapter$())[0];

  if (!lastestChapter) {
    return null;
  }

  const isNovelHomePage = !!matchRoute({ to: "/novel/$novelId", params: { novelId } });
  const isLatestChapter = !!matchRoute({
    to: "/novel/$novelId/$volumeId/$chapterId",
    params: {
      novelId,
      volumeId: lastestChapter.volumeId,
      chapterId: lastestChapter.id,
    },
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isNovelHomePage}
              render={
                <Link
                  to="/novel/$novelId"
                  params={{
                    novelId,
                  }}
                />
              }
            >
              <BookOpen className="size-4 shrink-0" />
              <span className="text-sm font-medium">Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={isLatestChapter}
              render={
                <Link
                  to="/novel/$novelId/$volumeId/$chapterId"
                  params={{
                    novelId,
                    volumeId: lastestChapter.volumeId,
                    chapterId: lastestChapter.id,
                  }}
                />
              }
            >
              <Sparkles className="size-4 shrink-0" />
              <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                <span className="text-sm font-medium text-nowrap">Latest Chapter</span>
                <span className="text-xs text-muted-foreground truncate">
                  {lastestChapter.title}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
