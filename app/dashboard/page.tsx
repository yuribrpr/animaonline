import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/src/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
        <CardDescription>Área protegida da aplicação.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">logado como: {user?.email}</p>
      </CardContent>
    </Card>
  );
}
