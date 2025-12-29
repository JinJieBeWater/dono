import { useRouter, useCanGoBack, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";

export default function Header() {
  const router = useRouter();
  const canGoBack = useCanGoBack();

  const links = [
    { to: "/", label: `Dono` },
    // { to: "/dashboard", label: "Dashboard" },
    // { to: "/todos", label: "Todos" },
  ] as const;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg items-center">
          {canGoBack && (
            <Button variant="outline" size="sm" onClick={() => router.history.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
