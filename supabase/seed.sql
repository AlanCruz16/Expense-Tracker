-- Default Categories
insert into public.categories (user_id, name, icon, color, is_default)
select 
  auth.uid(), 
  name, 
  icon, 
  color, 
  true
from (values 
  ('Food & Dining', 'utensils', '#ef4444'),
  ('Transportation', 'car', '#3b82f6'),
  ('Shopping', 'shopping-bag', '#8b5cf6'),
  ('Entertainment', 'film', '#ec4899'),
  ('Groceries', 'shopping-cart', '#10b981'),
  ('Bills & Utilities', 'zap', '#f59e0b'),
  ('Health & Fitness', 'activity', '#06b6d4'),
  ('Travel', 'plane', '#6366f1')
) as defaults(name, icon, color);

-- Default Payment Method (Cash)
insert into public.payment_methods (user_id, name, type)
values (auth.uid(), 'Cash', 'Cash');
