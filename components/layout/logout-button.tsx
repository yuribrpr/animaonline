"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/src/lib/supabase/client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Sair
    </Button>
  );
}
