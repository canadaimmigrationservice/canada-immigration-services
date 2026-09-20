-- Canada Immigration Services
-- Supabase Storage buckets

-- =========================================================
-- APPLICANT DOCUMENTS
-- Private bucket for documents uploaded by applicants.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'applicant-documents',
  'applicant-documents',
  false
)
on conflict (id) do nothing;

-- =========================================================
-- VISA DOCUMENTS
-- Private bucket for documents uploaded by administrators.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'visa-documents',
  'visa-documents',
  false
)
on conflict (id) do nothing;

-- =========================================================
-- WEBSITE ASSETS
-- Used for logos, favicons and other website assets.
-- =========================================================

insert into storage.buckets (
  id,
  name,
  public
)
values (
  'website-assets',
  'website-assets',
  true
)
on conflict (id) do nothing;
