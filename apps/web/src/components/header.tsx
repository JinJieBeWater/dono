import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { Button } from "./ui/button";
import ConnectionManager from "./connection-manager";

export default function Header() {
  const links = [
    { to: "/", label: `Dono` },
    // { to: "/dashboard", label: "Dashboard" },
    // { to: "/todos", label: "Todos" },
  ] as const;

  return (
    <header className="px-1.5">
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg items-center">
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
          <ConnectionManager />
        </div>
      </div>
      <hr />
    </header>
  );
}

export function NovelHeader() {
  const links = [{ to: "/", label: `Dono` }] as const;

  return (
    <header className="bg-background sticky top-0 z-50 flex w-full items-center border-b">
      <div className="flex h-(--header-height) w-full items-center gap-2 px-4">
        <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/" />}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <nav className="flex gap-4 text-lg items-center">
          {links.map(({ to, label }) => {
            return (
              <Link key={to} to={to}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-2 ">
            <ModeToggle />
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
