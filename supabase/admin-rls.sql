-- ============================================================
-- CANADA IMMIGRATION SERVICES
-- ADMINISTRATOR ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Applications
create policy "Admins can view applications"
on public.applications
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create applications"
on public.applications
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update applications"
on public.applications
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete applications"
on public.applications
for delete
to authenticated
using (
  public.is_admin()
);


-- Visa Services
create policy "Admins can view all visa services"
on public.visa_services
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create visa services"
on public.visa_services
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update visa services"
on public.visa_services
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete visa services"
on public.visa_services
for delete
to authenticated
using (
  public.is_admin()
);


-- Application Messages
create policy "Admins can view application messages"
on public.application_messages
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create application messages"
on public.application_messages
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update application messages"
on public.application_messages
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete application messages"
on public.application_messages
for delete
to authenticated
using (
  public.is_admin()
);


-- Applicant Documents
create policy "Admins can view applicant documents"
on public.applicant_documents
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create applicant documents"
on public.applicant_documents
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update applicant documents"
on public.applicant_documents
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete applicant documents"
on public.applicant_documents
for delete
to authenticated
using (
  public.is_admin()
);


-- Visa Documents
create policy "Admins can view visa documents"
on public.visa_documents
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create visa documents"
on public.visa_documents
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update visa documents"
on public.visa_documents
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete visa documents"
on public.visa_documents
for delete
to authenticated
using (
  public.is_admin()
);


-- Website Settings
create policy "Admins can create website settings"
on public.website_settings
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update website settings"
on public.website_settings
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete website settings"
on public.website_settings
for delete
to authenticated
using (
  public.is_admin()
);


-- Email Settings
create policy "Admins can view email settings"
on public.email_settings
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create email settings"
on public.email_settings
for insert
to authenticated
with check (
  public.is_admin()
);

create policy "Admins can update email settings"
on public.email_settings
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy "Admins can delete email settings"
on public.email_settings
for delete
to authenticated
using (
  public.is_admin()
);


-- Email Logs
create policy "Admins can view email logs"
on public.email_logs
for select
to authenticated
using (
  public.is_admin()
);

create policy "Admins can create email logs"
on public.email_logs
for insert
to authenticated
with check (
  public.is_admin()
);
