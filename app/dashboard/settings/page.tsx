import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Espaço reservado para configurações de player, inventário e gameplay.
      </CardContent>
    </Card>
  );
}
