import { LogoutButton } from "@/components/layout/logout-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/src/lib/supabase/server";
import { ChevronDown, Home, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/", label: "Landing", icon: Home },
];

export async function DashboardSidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <aside className="w-full border-b bg-background p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6 flex items-center justify-between">
        <p className="font-semibold">Anima Online</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Menu
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Navegação</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {links.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
      </nav>

      <div className="mt-6 border-t pt-4 text-sm text-muted-foreground">{user?.email}</div>
      <div className="mt-2">
        <LogoutButton />
      </div>
    </aside>
  );
}
