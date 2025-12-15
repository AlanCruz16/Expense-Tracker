-- 1. Drop the existing trigger and function to start fresh
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- 2. Re-create the function with ALL default data logic
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create Profile
  insert into public.profiles (id)
  values (new.id);

  -- Create Default Categories
  insert into public.categories (user_id, name, icon, color, is_default)
  values
    (new.id, 'Food & Dining', 'utensils', '#ef4444', true),
    (new.id, 'Transportation', 'car', '#3b82f6', true),
    (new.id, 'Shopping', 'shopping-bag', '#8b5cf6', true),
    (new.id, 'Entertainment', 'film', '#ec4899', true),
    (new.id, 'Groceries', 'shopping-cart', '#10b981', true),
    (new.id, 'Bills & Utilities', 'zap', '#f59e0b', true),
    (new.id, 'Health & Fitness', 'activity', '#06b6d4', true),
    (new.id, 'Travel', 'plane', '#6366f1', true);

  -- Create Default Payment Method
  insert into public.payment_methods (user_id, name, type)
  values (new.id, 'Cash', 'Cash');

  return new;
end;
$$ language plpgsql security definer;

-- 3. Re-attach the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
