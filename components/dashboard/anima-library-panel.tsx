"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ElementType = "fogo" | "agua" | "planta";

type Anima = {
  id: string;
  species: string;
  evolutionary_line: string;
  next_evolution_id: string | null;
  attack: number;
  defense: number;
  max_health: number;
  attack_speed_seconds: number;
  critical_chance: number;
  image_url: string | null;
  attribute: ElementType;
  created_at: string;
};

type FormValues = {
  species: string;
  evolutionary_line: string;
  next_evolution_id: string;
  attack: string;
  defense: string;
  max_health: string;
  attack_speed_seconds: string;
  critical_chance: string;
  image_url: string;
  attribute: ElementType;
};

const initialForm: FormValues = {
  species: "",
  evolutionary_line: "",
  next_evolution_id: "",
  attack: "",
  defense: "",
  max_health: "",
  attack_speed_seconds: "",
  critical_chance: "",
  image_url: "",
  attribute: "fogo",
};

export function AnimaLibraryPanel() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [animas, setAnimas] = useState<Anima[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnima, setEditingAnima] = useState<Anima | null>(null);
  const [form, setForm] = useState<FormValues>(initialForm);

  const evolutionaryLineOptions = useMemo(
    () => Array.from(new Set(animas.map((item) => item.evolutionary_line))).sort((a, b) => a.localeCompare(b)),
    [animas],
  );

  const fetchAnimas = useCallback(async () => {
    if (!supabaseRef.current) return;

    setLoading(true);
    const { data, error: fetchError } = await supabaseRef.current
      .from("animas")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setAnimas((data ?? []) as Anima[]);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabaseRef.current = createClient();
    void fetchAnimas();
  }, [fetchAnimas]);

  function openCreateModal() {
    setForm(initialForm);
    setEditingAnima(null);
    setIsCreateOpen(true);
  }

  function openEditModal(anima: Anima) {
    setEditingAnima(anima);
    setForm({
      species: anima.species,
      evolutionary_line: anima.evolutionary_line,
      next_evolution_id: anima.next_evolution_id ?? "",
      attack: String(anima.attack),
      defense: String(anima.defense),
      max_health: String(anima.max_health),
      attack_speed_seconds: String(anima.attack_speed_seconds),
      critical_chance: String(anima.critical_chance),
      image_url: anima.image_url ?? "",
      attribute: anima.attribute,
    });
    setIsCreateOpen(true);
  }

  async function onImageInput(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        const imageUrl = reader.result;
        setForm((previous) => ({ ...previous, image_url: imageUrl }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function saveAnima() {
    if (!form.species || !form.evolutionary_line) {
      setError("Preencha espécie e linha evolutiva.");
      return;
    }

    const payload = {
      species: form.species,
      evolutionary_line: form.evolutionary_line,
      next_evolution_id: form.next_evolution_id || null,
      attack: Number(form.attack),
      defense: Number(form.defense),
      max_health: Number(form.max_health),
      attack_speed_seconds: Number(form.attack_speed_seconds),
      critical_chance: Number(form.critical_chance),
      image_url: form.image_url || null,
      attribute: form.attribute,
    };

    if (!supabaseRef.current) return;

    const response = editingAnima
      ? await supabaseRef.current.from("animas").update(payload).eq("id", editingAnima.id)
      : await supabaseRef.current.from("animas").insert(payload);

    if (response.error) {
      setError(response.error.message);
      return;
    }

    setIsCreateOpen(false);
    setForm(initialForm);
    setEditingAnima(null);
    await fetchAnimas();
  }

  async function deleteAnima(id: string) {
    if (!supabaseRef.current) return;

    const { error: deleteError } = await supabaseRef.current.from("animas").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await fetchAnimas();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Biblioteca Anima</CardTitle>
            <CardDescription>Painel administrativo para gestão visual da biblioteca de criaturas.</CardDescription>
          </div>
          <Button onClick={openCreateModal}>Novo Anima</Button>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando biblioteca...</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    <th className="px-3 py-2 text-left">Imagem</th>
                    <th className="px-3 py-2 text-left">Espécie</th>
                    <th className="px-3 py-2 text-left">Linha Evolutiva</th>
                    <th className="px-3 py-2 text-left">Próxima Evolução</th>
                    <th className="px-3 py-2 text-left">Atributos</th>
                    <th className="px-3 py-2 text-left">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {animas.map((anima) => (
                    <tr key={anima.id} className="border-t">
                      <td className="px-3 py-2">
                        {anima.image_url ? (
                          <img src={anima.image_url} alt={anima.species} className="h-12 w-12 rounded-md object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-md bg-muted" />
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">{anima.species}</td>
                      <td className="px-3 py-2">{anima.evolutionary_line}</td>
                      <td className="px-3 py-2">
                        {animas.find((item) => item.id === anima.next_evolution_id)?.species ?? "-"}
                      </td>
                      <td className="space-y-1 px-3 py-2">
                        <Badge>{anima.attribute}</Badge>
                        <div className="text-xs text-muted-foreground">
                          ATK {anima.attack} | DEF {anima.defense} | HP {anima.max_health}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vel {anima.attack_speed_seconds}s | Crit {anima.critical_chance}%
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(anima)}>
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => void deleteAnima(anima.id)}>
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingAnima ? "Editar Anima" : "Criar Anima"}</CardTitle>
              <CardDescription>Cadastro completo de atributos da criatura.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="species">Espécie</Label>
                <Input
                  id="species"
                  value={form.species}
                  onChange={(event) => setForm((prev) => ({ ...prev, species: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evolutionary_line">Linha Evolutiva</Label>
                <Input
                  id="evolutionary_line"
                  list="evolutionary-lines"
                  value={form.evolutionary_line}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, evolutionary_line: event.target.value }))
                  }
                />
                <datalist id="evolutionary-lines">
                  {evolutionaryLineOptions.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_evolution_id">Próxima Evolução</Label>
                <select
                  id="next_evolution_id"
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={form.next_evolution_id}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, next_evolution_id: event.target.value }))
                  }
                >
                  <option value="">Sem evolução</option>
                  {animas
                    .filter((item) => item.id !== editingAnima?.id)
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.species}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attribute">Atributo</Label>
                <select
                  id="attribute"
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                  value={form.attribute}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, attribute: event.target.value as ElementType }))
                  }
                >
                  <option value="fogo">Fogo</option>
                  <option value="agua">Água</option>
                  <option value="planta">Planta</option>
                </select>
              </div>

              <InputField label="Ataque" value={form.attack} onChange={(value) => setForm((prev) => ({ ...prev, attack: value }))} />
              <InputField label="Defesa" value={form.defense} onChange={(value) => setForm((prev) => ({ ...prev, defense: value }))} />
              <InputField label="Vida Máxima" value={form.max_health} onChange={(value) => setForm((prev) => ({ ...prev, max_health: value }))} />
              <InputField
                label="Velocidade de Ataque (segundos)"
                value={form.attack_speed_seconds}
                onChange={(value) => setForm((prev) => ({ ...prev, attack_speed_seconds: value }))}
              />
              <InputField
                label="% Acerto Crítico"
                value={form.critical_chance}
                onChange={(value) => setForm((prev) => ({ ...prev, critical_chance: value }))}
              />

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image">Imagem</Label>
                <Input id="image" type="file" accept="image/*" onChange={(event) => void onImageInput(event.target.files?.[0] ?? null)} />
                {form.image_url && (
                  <img src={form.image_url} alt="Preview da imagem" className="h-24 w-24 rounded-md object-cover" />
                )}
              </div>

              <div className="flex justify-end gap-2 md:col-span-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => void saveAnima()}>{editingAnima ? "Salvar alterações" : "Criar Anima"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
