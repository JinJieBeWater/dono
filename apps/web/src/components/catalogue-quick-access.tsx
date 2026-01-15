import { BookDashed, BookOpen, ScrollText } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { lastVisibleChapter$, latestVisibleVolume$ } from "@dono/stores/novel";
import { useNovelStore } from "@/stores/novel";
import { Link, useMatchRoute, useParams } from "@tanstack/react-router";
import { memo } from "react";

export function CatalogueQuickAccessImpl({ showBackHome = true }: { showBackHome?: boolean }) {
  const { novelId } = useParams({
    from: "/novel/$novelId",
  });
  const matchRoute = useMatchRoute();
  const novelStore = useNovelStore(novelId);

  const latestVolume = novelStore.useQuery(latestVisibleVolume$());
  const lastestChapter = novelStore.useQuery(lastVisibleChapter$())[0];

  const isNovelHomePage = !!matchRoute({ to: "/novel/$novelId", params: { novelId } });
  const isLatestVolume = !!matchRoute({
    to: "/novel/$novelId/$volumeId",
    params: {
      novelId,
      volumeId: latestVolume?.id,
    },
  });
  const isLatestChapter = !!matchRoute({
    to: "/novel/$novelId/$volumeId/$chapterId",
    params: {
      novelId,
      volumeId: lastestChapter?.volumeId,
      chapterId: lastestChapter?.id,
    },
  });

  // Check if there are any quick access items
  const hasQuickAccessItems = showBackHome || latestVolume || lastestChapter;
  if (!hasQuickAccessItems) {
    return;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {showBackHome && (
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
          )}
          {latestVolume && (
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isLatestVolume}
                render={
                  <Link
                    to="/novel/$novelId/$volumeId"
                    params={{
                      novelId,
                      volumeId: latestVolume.id,
                    }}
                  />
                }
              >
                <BookDashed className="size-4 shrink-0" />
                <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-sm font-medium text-nowrap">Latest Vol</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {latestVolume.title}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          {lastestChapter && (
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
                <ScrollText className="size-4 shrink-0" />
                <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-sm font-medium text-nowrap">Latest Ch</span>
                  <span className="text-xs text-muted-foreground truncate">
                    {lastestChapter.title}
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export const CatalogueQuickAccess = memo(CatalogueQuickAccessImpl);
