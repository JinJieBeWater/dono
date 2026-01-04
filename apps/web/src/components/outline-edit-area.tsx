import { cn } from "@/lib/utils";

// 大纲内容
export const OutlineEditArea = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("h-full", className)} {...props}>
    大纲内容区域
  </div>
);
