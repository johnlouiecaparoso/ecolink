drop policy if exists "Allow read for admins" on public.role_applications;
drop policy if exists "Allow update for admins" on public.role_applications;

create policy "Allow read for admins and verifier reviewers"
  on public.role_applications for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and (
          role = 'admin'
          or (role = 'verifier' and role_applications.role_requested = 'project_developer')
        )
    )
  );

create policy "Allow update for admins and verifier reviewers"
  on public.role_applications for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and (
          role = 'admin'
          or (role = 'verifier' and role_applications.role_requested = 'project_developer')
        )
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and (
          role = 'admin'
          or (role = 'verifier' and role_applications.role_requested = 'project_developer')
        )
    )
  );
