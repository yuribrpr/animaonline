create extension if not exists "pgcrypto";

create table if not exists public.animas (
  id uuid primary key default gen_random_uuid(),
  species text not null unique,
  evolutionary_line text not null,
  next_evolution_id uuid references public.animas (id) on delete set null,
  attack integer not null check (attack >= 0),
  defense integer not null check (defense >= 0),
  max_health integer not null check (max_health >= 1),
  attack_speed_seconds numeric(4,2) not null check (attack_speed_seconds > 0),
  critical_chance numeric(5,2) not null check (critical_chance >= 0 and critical_chance <= 100),
  image_url text,
  attribute text not null check (attribute in ('fogo', 'agua', 'planta')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger update_animas_timestamp
before update on public.animas
for each row
execute function public.update_timestamp();

alter table public.animas enable row level security;

create policy "authenticated read animas"
on public.animas
for select
using (auth.role() = 'authenticated');

create policy "authenticated insert animas"
on public.animas
for insert
with check (auth.role() = 'authenticated');

create policy "authenticated update animas"
on public.animas
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "authenticated delete animas"
on public.animas
for delete
using (auth.role() = 'authenticated');
