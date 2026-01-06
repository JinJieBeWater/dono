import { Link, useNavigate } from "@tanstack/react-router";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
// import { Skeleton } from "./ui/skeleton";
import { useLocalUserInfo } from "./local-user-info-provider";
import { cn } from "@/lib/utils";

export default function UserMenu({ className, ...props }: React.ComponentProps<typeof Button>) {
  const navigate = useNavigate();
  // const { data: session, isPending } = authClient.useSession();
  const { localUserInfo, clearLocalUserInfo } = useLocalUserInfo();
  // const { clearLocalUserInfo } = useLocalUserInfo();

  // if (isPending) {
  //   return <Skeleton className="h-9 w-24" />;
  // }

  if (!localUserInfo) {
    return (
      <Link to="/login">
        <Button variant="outline" className={cn("border-0", className)} {...props}>
          Sign In
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" className={cn("border-0", className)} {...props} />}
      >
        {localUserInfo.name}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-card" align="center">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    clearLocalUserInfo();
                    navigate({
                      to: "/",
                    });
                  },
                },
              });
            }}
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
