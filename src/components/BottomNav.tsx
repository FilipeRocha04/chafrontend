import { Link, useRouterState } from "@tanstack/react-router";
import { Gift, Home, LayoutDashboard, type LucideIcon } from "lucide-react";
import { useEffect } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const items: NavItem[] = [
  { to: "/inicio", label: "Início", icon: Home },
  { to: "/lista", label: "Listinha", icon: Gift },
  { to: "/admin", label: "Painel", icon: LayoutDashboard },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    document.body.style.paddingBottom = "72px";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, []);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-[600px] items-stretch justify-around">
        {items.map(({ to, label, icon: Icon }) => {
          const isActive = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
