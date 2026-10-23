create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text,
  body text not null default '',
  source text,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "own notes" on public.notes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create index notes_user_idx on public.notes (user_id, pinned desc, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_notes_updated_at
  before update on public.notes
  for each row
  execute function public.set_updated_at();