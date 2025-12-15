-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users not null primary key,
  monthly_income numeric default 0,
  currency text default 'USD',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  icon text,
  color text,
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "Users can view own categories" on public.categories
  for select using (auth.uid() = user_id);

create policy "Users can insert own categories" on public.categories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own categories" on public.categories
  for update using (auth.uid() = user_id);

create policy "Users can delete own categories" on public.categories
  for delete using (auth.uid() = user_id);

-- PAYMENT METHODS
create table public.payment_methods (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null, -- 'Credit', 'Debit', 'Cash'
  created_at timestamptz default now()
);

alter table public.payment_methods enable row level security;

create policy "Users can view own payment methods" on public.payment_methods
  for select using (auth.uid() = user_id);

create policy "Users can insert own payment methods" on public.payment_methods
  for insert with check (auth.uid() = user_id);

create policy "Users can update own payment methods" on public.payment_methods
  for update using (auth.uid() = user_id);

create policy "Users can delete own payment methods" on public.payment_methods
  for delete using (auth.uid() = user_id);

-- IMPORT RULES (Smart Import)
create table public.import_rules (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  keyword text not null,
  category_id uuid references public.categories not null,
  created_at timestamptz default now()
);

alter table public.import_rules enable row level security;

create policy "Users can view own import rules" on public.import_rules
  for select using (auth.uid() = user_id);

create policy "Users can insert own import rules" on public.import_rules
  for insert with check (auth.uid() = user_id);

create policy "Users can update own import rules" on public.import_rules
  for update using (auth.uid() = user_id);

create policy "Users can delete own import rules" on public.import_rules
  for delete using (auth.uid() = user_id);

-- EXPENSES
create table public.expenses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  date date not null default CURRENT_DATE,
  category_id uuid references public.categories,
  payment_method_id uuid references public.payment_methods,
  comment text,
  created_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "Users can view own expenses" on public.expenses
  for select using (auth.uid() = user_id);

create policy "Users can insert own expenses" on public.expenses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own expenses" on public.expenses
  for update using (auth.uid() = user_id);

create policy "Users can delete own expenses" on public.expenses
  for delete using (auth.uid() = user_id);

-- TRIGGER to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
