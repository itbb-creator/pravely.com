-- Cover every foreign key reported by the Supabase Performance Advisor.
-- Composite indexes are ordered by owner first because that also supports the
-- RLS ownership filters used by the application.
create index if not exists app_feedback_user_id_idx
  on public.app_feedback (user_id);

create index if not exists budget_entries_user_goal_client_key_idx
  on public.budget_entries (user_id, goal_client_key)
  where goal_client_key is not null;

create index if not exists business_invoice_items_owner_invoice_idx
  on public.business_invoice_items (owner_id, invoice_id);

create index if not exists business_invoices_owner_customer_idx
  on public.business_invoices (owner_id, customer_id);

create index if not exists business_reconciliations_owner_account_idx
  on public.business_reconciliations (owner_id, account_id);

create index if not exists business_recurring_owner_expense_account_idx
  on public.business_recurring_expenses (owner_id, expense_account_id);

create index if not exists business_recurring_owner_payment_account_idx
  on public.business_recurring_expenses (owner_id, payment_account_id);

create index if not exists business_recurring_owner_vendor_idx
  on public.business_recurring_expenses (owner_id, vendor_id)
  where vendor_id is not null;

create index if not exists business_lines_owner_transaction_idx
  on public.business_transaction_lines (owner_id, transaction_id);

create index if not exists business_lines_owner_account_idx
  on public.business_transaction_lines (owner_id, account_id);

create index if not exists business_transactions_owner_contact_idx
  on public.business_transactions (owner_id, contact_id)
  where contact_id is not null;

create index if not exists business_transactions_owner_reconciliation_idx
  on public.business_transactions (owner_id, reconciliation_id)
  where reconciliation_id is not null;

create index if not exists push_device_tokens_user_id_idx
  on public.push_device_tokens (user_id);
