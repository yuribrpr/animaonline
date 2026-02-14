"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, Leaf, MoreHorizontal, Search, Shield, Sparkles, Sword, Waves } from "lucide-react";

type ElementType = "fogo" | "agua" | "planta";
type SortMode = "recentes" | "fortes" | "nome";

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

const attributeMeta: Record<ElementType, { label: string; icon: typeof Flame; badgeClass: string }> = {
  fogo: { label: "Fogo", icon: Flame, badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-600" },
  agua: { label: "Água", icon: Waves, badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-600" },
  planta: { label: "Planta", icon: Leaf, badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600" },
};

export function AnimaLibraryPanel() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const [animas, setAnimas] = useState<Anima[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnima, setEditingAnima] = useState<Anima | null>(null);
  const [form, setForm] = useState<FormValues>(initialForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [attributeFilter, setAttributeFilter] = useState<ElementType | "todos">("todos");
  const [sortMode, setSortMode] = useState<SortMode>("recentes");
  const [autoBalance, setAutoBalance] = useState(false);

  const evolutionaryLineOptions = useMemo(
    () => Array.from(new Set(animas.map((item) => item.evolutionary_line))).sort((a, b) => a.localeCompare(b)),
    [animas],
  );

  const stats = useMemo(() => {
    const avgAtk = animas.length ? Math.round(animas.reduce((sum, item) => sum + item.attack, 0) / animas.length) : 0;
    const avgDef = animas.length ? Math.round(animas.reduce((sum, item) => sum + item.defense, 0) / animas.length) : 0;
    const avgHp = animas.length ? Math.round(animas.reduce((sum, item) => sum + item.max_health, 0) / animas.length) : 0;

    return {
      total: animas.length,
      linhas: evolutionaryLineOptions.length,
      avgAtk,
      avgDef,
      avgHp,
    };
  }, [animas, evolutionaryLineOptions.length]);

  const filteredAnimas = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const result = animas
      .filter((item) => (attributeFilter === "todos" ? true : item.attribute === attributeFilter))
      .filter((item) => {
        if (!normalized) return true;
        return (
          item.species.toLowerCase().includes(normalized) ||
          item.evolutionary_line.toLowerCase().includes(normalized) ||
          item.attribute.toLowerCase().includes(normalized)
        );
      });

    if (sortMode === "nome") {
      return result.sort((a, b) => a.species.localeCompare(b.species));
    }

    if (sortMode === "fortes") {
      return result.sort((a, b) => getPowerScore(b) - getPowerScore(a));
    }

    return result.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  }, [animas, attributeFilter, searchQuery, sortMode]);

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
    setAutoBalance(false);
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
    setAutoBalance(false);
    setIsCreateOpen(true);
  }

  async function onImageInput(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((previous) => ({ ...previous, image_url: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  }

  function updateNumericField(field: keyof Pick<FormValues, "attack" | "defense" | "max_health" | "attack_speed_seconds" | "critical_chance">, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (autoBalance && (field === "attack" || field === "defense")) {
        const attack = Number(field === "attack" ? value : prev.attack);
        const defense = Number(field === "defense" ? value : prev.defense);

        next.max_health = String(Math.max(40, attack * 2 + defense * 2));
      }

      return next;
    });
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
    setError(null);
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
    <div className="space-y-6 pb-8">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Biblioteca Anima</CardTitle>
              <CardDescription className="text-white/80">
                Painel avançado para gestão massiva de criaturas, balanceamento e evolução.
              </CardDescription>
            </div>
            <Button className="bg-white text-indigo-700 hover:bg-white/90" onClick={openCreateModal}>
              <Sparkles className="mr-2 h-4 w-4" />
              Novo Anima
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total de Animas" value={String(stats.total)} />
            <StatCard title="Linhas Evolutivas" value={String(stats.linhas)} />
            <StatCard title="ATK Médio" value={String(stats.avgAtk)} />
            <StatCard title="DEF Médio" value={String(stats.avgDef)} />
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Algo deu errado</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Explorador de criaturas</CardTitle>
            <CardDescription>
              Pesquise rapidamente, filtre por elemento e alterne o modo de ordenação da coleção.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por espécie, linha ou atributo..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <FilterChip active={attributeFilter === "todos"} onClick={() => setAttributeFilter("todos")}>
                Todos
              </FilterChip>
              {(Object.keys(attributeMeta) as ElementType[]).map((item) => (
                <FilterChip key={item} active={attributeFilter === item} onClick={() => setAttributeFilter(item)}>
                  {attributeMeta[item].label}
                </FilterChip>
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Ordenar</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Modo de ordenação</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortMode("recentes")}>Mais recentes</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortMode("fortes")}>Mais poderosos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortMode("nome")}>Nome (A-Z)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando biblioteca...</p>
          ) : filteredAnimas.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              Nenhum anima encontrado com os filtros atuais.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredAnimas.map((anima) => {
                const elementConfig = attributeMeta[anima.attribute];
                const Icon = elementConfig.icon;

                return (
                  <Card key={anima.id} className="overflow-hidden border-muted/80">
                    <CardHeader className="space-y-3 pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {anima.image_url ? (
                            <img src={anima.image_url} alt={anima.species} className="h-14 w-14 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">SEM IMG</div>
                          )}
                          <div>
                            <h3 className="font-semibold leading-tight">{anima.species}</h3>
                            <p className="text-xs text-muted-foreground">Linha {anima.evolutionary_line}</p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(anima)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => void deleteAnima(anima.id)} className="text-red-500">
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={elementConfig.badgeClass}>
                          <Icon className="mr-1 h-3.5 w-3.5" />
                          {elementConfig.label}
                        </Badge>
                        <Badge variant="secondary">Power {getPowerScore(anima)}</Badge>
                        <Badge variant="secondary">
                          Evolui para {animas.find((item) => item.id === anima.next_evolution_id)?.species ?? "—"}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      <MetricBar icon={<Sword className="h-3.5 w-3.5" />} label="Ataque" value={anima.attack} max={180} />
                      <MetricBar icon={<Shield className="h-3.5 w-3.5" />} label="Defesa" value={anima.defense} max={180} />
                      <MetricBar icon={<Sparkles className="h-3.5 w-3.5" />} label="Vida" value={anima.max_health} max={360} />
                      <div className="flex justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                        <span>Velocidade {anima.attack_speed_seconds}s</span>
                        <span>Crítico {anima.critical_chance}%</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <Card className="max-h-[95vh] w-full max-w-5xl overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingAnima ? "Editar Anima" : "Criar novo Anima"}</CardTitle>
              <CardDescription>
                Formulário estratégico com visão de balanceamento para grandes coleções.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="species">Espécie *</Label>
                  <Input
                    id="species"
                    placeholder="Ex: Ignifera"
                    value={form.species}
                    onChange={(event) => setForm((prev) => ({ ...prev, species: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evolutionary_line">Linha evolutiva *</Label>
                  <Input
                    id="evolutionary_line"
                    list="evolutionary-lines"
                    placeholder="Ex: Draconídeos"
                    value={form.evolutionary_line}
                    onChange={(event) => setForm((prev) => ({ ...prev, evolutionary_line: event.target.value }))}
                  />
                  <datalist id="evolutionary-lines">
                    {evolutionaryLineOptions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="next_evolution_id">Próxima evolução</Label>
                  <select
                    id="next_evolution_id"
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                    value={form.next_evolution_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, next_evolution_id: event.target.value }))}
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
                    onChange={(event) => setForm((prev) => ({ ...prev, attribute: event.target.value as ElementType }))}
                  >
                    <option value="fogo">Fogo</option>
                    <option value="agua">Água</option>
                    <option value="planta">Planta</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="mb-4 flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold">Balanceamento de combate</h4>
                    <p className="text-xs text-muted-foreground">Use sliders para ajustar atributos rapidamente.</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Checkbox id="auto-balance" checked={autoBalance} onCheckedChange={(checked) => setAutoBalance(Boolean(checked))} />
                    <Label htmlFor="auto-balance" className="cursor-pointer text-xs">
                      Auto balancear vida
                    </Label>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <SliderField label="Ataque" value={form.attack} min={1} max={180} onChange={(value) => updateNumericField("attack", value)} />
                  <SliderField label="Defesa" value={form.defense} min={1} max={180} onChange={(value) => updateNumericField("defense", value)} />
                  <SliderField label="Vida Máxima" value={form.max_health} min={10} max={360} onChange={(value) => updateNumericField("max_health", value)} />
                  <SliderField label="Velocidade (s)" value={form.attack_speed_seconds} min={1} max={15} step={0.5} onChange={(value) => updateNumericField("attack_speed_seconds", value)} />
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <InputField
                    label="Chance crítica (%)"
                    value={form.critical_chance}
                    onChange={(value) => updateNumericField("critical_chance", value)}
                  />
                  <div className="rounded-md border bg-background p-3">
                    <p className="text-xs text-muted-foreground">Pontuação prevista</p>
                    <p className="text-2xl font-bold">{getPowerScoreFromForm(form)}</p>
                    <p className="text-xs text-muted-foreground">baseada em ataque, defesa, vida, crítico e velocidade.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Imagem</Label>
                <Input id="image" type="file" accept="image/*" onChange={(event) => void onImageInput(event.target.files?.[0] ?? null)} />
                {form.image_url && <img src={form.image_url} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => void saveAnima()}>{editingAnima ? "Salvar alterações" : "Cadastrar anima"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function getPowerScore(anima: Anima) {
  return Math.round(anima.attack * 1.2 + anima.defense + anima.max_health * 0.4 + anima.critical_chance * 1.5 - anima.attack_speed_seconds * 2);
}

function getPowerScoreFromForm(form: FormValues) {
  return Math.round(
    Number(form.attack || 0) * 1.2 +
      Number(form.defense || 0) +
      Number(form.max_health || 0) * 0.4 +
      Number(form.critical_chance || 0) * 1.5 -
      Number(form.attack_speed_seconds || 0) * 2,
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
      <p className="text-xs text-white/80">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <Button variant={active ? "default" : "outline"} size="sm" onClick={onClick}>
      {children}
    </Button>
  );
}

function MetricBar({ icon, label, value, max }: { icon: React.ReactNode; label: string; value: number; max: number }) {
  const percent = Math.max(4, Math.min(100, Math.round((value / max) * 100)));

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
  max: number;
  step?: number;
}) {
  return (
    <div className="space-y-2 rounded-md border bg-background p-3">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{value || "0"}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || String(min)}
        onChange={(event) => onChange(event.target.value)}
        className="w-full"
      />
      <Input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} />
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
    <div className="space-y-2 rounded-md border bg-background p-3">
      <Label>{label}</Label>
      <Input type="number" value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
