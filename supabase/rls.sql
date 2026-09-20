-- Canada Immigration Services
-- Row Level Security policies

-- =========================================================
-- VISA SERVICES
-- Public users can read active/visible visa services.
-- Only authenticated admins will manage these later.
-- =========================================================

create policy "Public can view active visa services"
on public.visa_services
for select
to anon, authenticated
using (
  is_active = true
  and is_visible = true
);

-- =========================================================
-- WEBSITE SETTINGS
-- Public users can read website settings.
-- Sensitive settings should not be stored here.
-- =========================================================

create policy "Public can view website settings"
on public.website_settings
for select
to anon, authenticated
using (true);

-- =========================================================
-- APPLICATIONS
-- No public access.
-- Applicant lookups will be handled through secure
-- server-side functionality later.
-- =========================================================

-- No anon SELECT/UPDATE/DELETE policies are created.

-- =========================================================
-- APPLICATION MESSAGES
-- No public direct access.
-- =========================================================

-- No anon SELECT/INSERT/UPDATE/DELETE policies are created.

-- =========================================================
-- APPLICANT DOCUMENTS
-- No public direct database access.
-- =========================================================

-- No anon SELECT/INSERT/UPDATE/DELETE policies are created.

-- =========================================================
-- VISA DOCUMENTS
-- No public direct database access.
-- =========================================================

-- No anon SELECT/INSERT/UPDATE/DELETE policies are created.

-- =========================================================
-- EMAIL SETTINGS
-- No public access.
-- =========================================================

-- No anon SELECT/INSERT/UPDATE/DELETE policies are created.

-- =========================================================
-- EMAIL LOGS
-- No public access.
-- =========================================================

-- No anon SELECT/INSERT/UPDATE/DELETE policies are created.
