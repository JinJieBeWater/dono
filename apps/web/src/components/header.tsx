import { Link } from "@tanstack/react-router";
import { SystemCapsule } from "./system-capsule";

export default function Header() {
  const links = [
    { to: "/", label: `Dono` },
    // { to: "/dashboard", label: "Dashboard" },
    // { to: "/todos", label: "Todos" },
  ] as const;

  return (
    <header className="px-1 h-(--header-height) mt-3 ">
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
        <SystemCapsule />
      </div>
    </header>
  );
}
