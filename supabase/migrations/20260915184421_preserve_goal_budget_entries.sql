-- A goal contribution is still part of the customer's monthly plan after the
-- goal itself is removed. Preserve the budget row and only detach the link.
alter table public.budget_entries
  drop constraint if exists budget_entries_goal_client_owner_fk;

alter table public.budget_entries
  drop constraint if exists budget_entries_goal_client_type_check;

alter table public.budget_entries
  add constraint budget_entries_goal_client_owner_fk
  foreign key (user_id, goal_client_key)
  references public.goals(user_id, client_key)
  on update cascade
  on delete set null (goal_client_key);

alter table public.budget_entries
  add constraint budget_entries_goal_client_type_check check (
    (entry_type = 'Goal') or
    (entry_type <> 'Goal' and goal_client_key is null)
  );
