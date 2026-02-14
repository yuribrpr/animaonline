import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/src/lib/supabase/server";
import { Building2, LayoutDashboard, LibraryBig, Settings } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { href: "/dashboard/biblioteca-anima", label: "Biblioteca Anima", icon: LibraryBig },
];

export async function DashboardSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <aside className="w-full border-b bg-background p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6">
        <p className="font-semibold">Anima Online</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Button key={link.href} asChild variant="ghost" className="w-full justify-start">
              <Link href={link.href}>
                <Icon className="mr-2 h-4 w-4" />
                {link.label}
              </Link>
            </Button>
          );
        })}

        <details className="rounded-lg border bg-muted/30 px-2 py-1">
          <summary className="flex cursor-pointer list-none items-center rounded-md px-2 py-2 text-sm font-medium">
            <Building2 className="mr-2 h-4 w-4" />
            Administrativo
          </summary>
          <div className="mt-1 space-y-1 pb-1 pl-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button key={link.href} asChild variant="ghost" className="w-full justify-start">
                  <Link href={link.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </details>
      </nav>

      <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">{user?.email}</div>
      <div className="mt-2">
        <LogoutButton />
      </div>
    </aside>
  );
}
