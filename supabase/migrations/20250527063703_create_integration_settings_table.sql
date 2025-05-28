create table if not exists integration_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  li_at text,
  jsessionid text,
  apify_api_token text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);