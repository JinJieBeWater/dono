import { createFileRoute } from "@tanstack/react-router";
import { UserSpace } from "@/components/user-space";
import { userStoreOptions } from "@/stores/user";
import { StoreLoading } from "@/components/loader";
import Header from "@/components/header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  pendingComponent: () => <StoreLoading title="Opening your space..." />,
  loader: ({ context }) => {
    context.storeRegistry.preload(userStoreOptions());
  },
});

function HomeComponent() {
  return (
    <div
      className={cn(
        "grid grid-rows-[auto_1fr] h-svh mx-auto",
        "max-w-140", // 默认（移动端）: 560px
        "sm:max-w-150", // 小屏: 600px
        "md:max-w-160", // 中屏: 640px
        "lg:max-w-170", // 大屏: 680px
        "xl:max-w-180", // 超大屏: 720px
        "2xl:max-w-190", // 2xl屏: 760px
      )}
    >
      <Header />
      <UserSpace />
    </div>
  );
}
