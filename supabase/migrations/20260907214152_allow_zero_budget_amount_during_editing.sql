-- A zero value is a valid temporary and intentional monthly budget amount.
-- Allowing it prevents autosave from coercing a cleared field to $0.01 and
-- then flashing that cloud value back into the editor.
alter table public.budget_entries
  drop constraint if exists budget_entries_monthly_amount_check;

alter table public.budget_entries
  add constraint budget_entries_monthly_amount_check
  check (monthly_amount >= 0);
