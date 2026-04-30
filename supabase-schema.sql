-- ============================================================
-- EALOWM · 이로움 프로그램 — Supabase 스키마
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ============================================================

-- 1. 회기 기록 테이블
create table if not exists session_records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  session_id    text not null,            -- 's1' ~ 's12'
  think_checks  boolean[] not null default '{}',
  practice_text text not null default '',
  reflect_texts text[] not null default '{}',
  completed     boolean not null default false,
  updated_at    timestamptz not null default now(),
  
  unique (user_id, session_id)
);

-- 2. Row Level Security — 본인 데이터만 접근
alter table session_records enable row level security;

create policy "Users can view own records"
  on session_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own records"
  on session_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own records"
  on session_records for update
  using (auth.uid() = user_id);

create policy "Users can delete own records"
  on session_records for delete
  using (auth.uid() = user_id);

-- 3. updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger session_records_updated_at
  before update on session_records
  for each row execute function update_updated_at();

-- 4. 인덱스
create index if not exists session_records_user_id_idx
  on session_records (user_id);
