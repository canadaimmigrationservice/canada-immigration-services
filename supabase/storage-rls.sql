-- ============================================================
-- CANADA IMMIGRATION SERVICES
-- SUPABASE STORAGE SECURITY POLICIES
-- ============================================================

-- ------------------------------------------------------------
-- Applicant Documents
-- Private bucket.
-- Applicants will NOT receive direct public access.
-- Upload/download operations will be handled through
-- authenticated or secure server-side workflows.
-- ------------------------------------------------------------

create policy "Applicant documents are not publicly readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'applicant-documents'
  and false
);

create policy "Applicant documents cannot be publicly uploaded"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'applicant-documents'
  and false
);

create policy "Applicant documents cannot be publicly updated"
on storage.objects
for update
to anon, authenticated
using (
  bucket_id = 'applicant-documents'
  and false
)
with check (
  bucket_id = 'applicant-documents'
  and false
);

create policy "Applicant documents cannot be publicly deleted"
on storage.objects
for delete
to anon, authenticated
using (
  bucket_id = 'applicant-documents'
  and false
);


-- ------------------------------------------------------------
-- Visa Documents
-- Private bucket.
-- Documents will only be made available through authorized
-- application workflows.
-- ------------------------------------------------------------

create policy "Visa documents are not publicly readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'visa-documents'
  and false
);

create policy "Visa documents cannot be publicly uploaded"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'visa-documents'
  and false
);

create policy "Visa documents cannot be publicly updated"
on storage.objects
for update
to anon, authenticated
using (
  bucket_id = 'visa-documents'
  and false
)
with check (
  bucket_id = 'visa-documents'
  and false
);

create policy "Visa documents cannot be publicly deleted"
on storage.objects
for delete
to anon, authenticated
using (
  bucket_id = 'visa-documents'
  and false
);


-- ------------------------------------------------------------
-- Website Assets
-- Public bucket.
-- Only authenticated administrators will be allowed to manage
-- uploaded website assets.
-- Public visitors can read the files through their public URLs.
-- ------------------------------------------------------------

create policy "Website assets are publicly readable"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'website-assets'
);

create policy "Website assets cannot be uploaded publicly"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'website-assets'
  and false
);

create policy "Website assets cannot be updated publicly"
on storage.objects
for update
to anon
using (
  bucket_id = 'website-assets'
  and false
)
with check (
  bucket_id = 'website-assets'
  and false
);

create policy "Website assets cannot be deleted publicly"
on storage.objects
for delete
to anon
using (
  bucket_id = 'website-assets'
  and false
);
