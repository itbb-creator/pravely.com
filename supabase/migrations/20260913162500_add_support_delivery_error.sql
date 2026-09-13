alter table public.support_requests
  add column if not exists delivery_error text
  check (delivery_error is null or char_length(delivery_error) <= 500);
