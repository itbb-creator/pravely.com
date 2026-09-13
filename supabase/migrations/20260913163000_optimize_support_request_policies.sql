alter policy "Admins read support requests with MFA"
  on public.support_requests
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
  );

alter policy "Admins update support requests with MFA"
  on public.support_requests
  using (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
  )
  with check (
    ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    and ((select auth.jwt()) ->> 'aal') = 'aal2'
  );
