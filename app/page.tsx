import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2, Rocket } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-12">
      <Card className="w-full border-border/70 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground">
            <Rocket className="h-3.5 w-3.5" />
            Bootstrap para game online
          </div>
          <CardTitle className="text-3xl">Anima Online</CardTitle>
          <CardDescription>
            Starter com Next.js + Supabase pronto para autenticação, dashboard protegido e evolução para features de game.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="sm:w-auto">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="sm:w-auto">
            <Link href="/dashboard">
              <Gamepad2 className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
