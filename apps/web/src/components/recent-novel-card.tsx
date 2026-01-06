import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { Edit, ChevronRight } from "lucide-react";
import type { Novel } from "@/stores/user";

interface RecentNovelCardProps {
  novel: Novel;
}

/**
 * 显示最近访问的小说卡片
 * 可在不同端使用不同布局
 */
export function RecentNovelCard({ novel }: RecentNovelCardProps) {
  return (
    <Card size="sm" className="bg-linear-to-br from-accent/50 to-background w-full">
      <CardHeader>
        <div className="flex items-center gap-2 text-primary mb-1">
          <Edit className="w-4 h-4" />
          <span className="text-xs font-medium">Continue Editing</span>
        </div>
        <CardTitle className="text-lg">{novel.title}</CardTitle>
        <CardDescription>{novel.created.toLocaleDateString()} created</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          render={<Link to="/novel/$novelId" params={{ novelId: novel.id }} preload="viewport" />}
          nativeButton={false}
          className="group"
        >
          Continue
          <ChevronRight className="group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
