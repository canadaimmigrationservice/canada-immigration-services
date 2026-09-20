-- Canada Immigration Services
-- Initial database schema

create extension if not exists "pgcrypto";

-- =========================================================
-- APPLICATIONS
-- =========================================================

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),

  application_number text unique,

  full_name text not null,
  surname text not null,
  date_of_birth date,
  gender text,
  nationality text,
  country_of_origin text,
  email text,
  phone text,
  residential_address text,
  occupation text,

  passport_number text,
  passport_issue_date date,
  passport_expiry_date date,

  visa_type text,
  work_permit_type text,
  destination_country text,
  country_of_processing text,
  application_date date,

  services_requested text[] default '{}',

  application_status text not null default 'Submitted',
  eligibility_status text not null default 'Not Started',
  background_check_status text not null default 'Not Started',
  biometrics_status text not null default 'Not Received',
  medical_status text not null default 'Not Required',
  additional_documents_status text not null default 'No Additional Documents Requested',

  decision_status text not null default 'Pending',
  decision_message text,

  passport_submission_visible boolean not null default false,
  passport_instructions text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- VISA SERVICES
-- =========================================================

create table if not exists public.visa_services (
  id uuid primary key default gen_random_uuid(),

  name text not null,
  slug text unique not null,
  short_description text,
  description text,

  is_active boolean not null default true,
  is_visible boolean not null default true,
  display_order integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- APPLICATION MESSAGES
-- =========================================================

create table if not exists public.application_messages (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id)
    on delete cascade,

  message text not null,
  is_visible_to_applicant boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- APPLICANT DOCUMENTS
-- =========================================================

create table if not exists public.applicant_documents (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id)
    on delete cascade,

  file_name text not null,
  storage_path text not null,
  file_type text,
  file_size bigint,

  uploaded_at timestamptz not null default now()
);

-- =========================================================
-- VISA DOCUMENTS
-- =========================================================

create table if not exists public.visa_documents (
  id uuid primary key default gen_random_uuid(),

  application_id uuid not null
    references public.applications(id)
    on delete cascade,

  title text not null,
  file_name text not null,
  storage_path text not null,

  is_visible_to_applicant boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- WEBSITE SETTINGS
-- =========================================================

create table if not exists public.website_settings (
  id uuid primary key default gen_random_uuid(),

  setting_key text unique not null,
  setting_value jsonb not null default '{}'::jsonb,

  updated_at timestamptz not null default now()
);

-- =========================================================
-- EMAIL SETTINGS
-- =========================================================

create table if not exists public.email_settings (
  id uuid primary key default gen_random_uuid(),

  notifications_enabled boolean not null default true,
  admin_email text,

  applicant_application_submitted boolean not null default true,
  applicant_application_number_assigned boolean not null default true,
  applicant_status_changed boolean not null default true,
  applicant_document_requested boolean not null default true,
  applicant_document_received boolean not null default true,
  applicant_message_received boolean not null default true,
  applicant_decision_updated boolean not null default true,
  applicant_passport_instructions boolean not null default true,
  applicant_visa_document_available boolean not null default true,

  admin_new_application boolean not null default true,
  admin_applicant_document_uploaded boolean not null default true,

  updated_at timestamptz not null default now()
);

-- =========================================================
-- EMAIL LOGS
-- =========================================================

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),

  application_id uuid
    references public.applications(id)
    on delete set null,

  recipient_email text not null,
  email_type text not null,

  sent_at timestamptz,
  status text not null default 'Pending',
  error_message text,

  created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES
-- =========================================================

create index if not exists applications_application_number_idx
  on public.applications(application_number);

create index if not exists applications_email_idx
  on public.applications(email);

create index if not exists applications_status_idx
  on public.applications(application_status);

create index if not exists applications_created_at_idx
  on public.applications(created_at desc);

create index if not exists application_messages_application_id_idx
  on public.application_messages(application_id);

create index if not exists applicant_documents_application_id_idx
  on public.applicant_documents(application_id);

create index if not exists visa_documents_application_id_idx
  on public.visa_documents(application_id);

create index if not exists email_logs_application_id_idx
  on public.email_logs(application_id);

-- =========================================================
-- UPDATED_AT FUNCTION
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================

drop trigger if exists applications_set_updated_at
on public.applications;

create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();


drop trigger if exists visa_services_set_updated_at
on public.visa_services;

create trigger visa_services_set_updated_at
before update on public.visa_services
for each row
execute function public.set_updated_at();


drop trigger if exists application_messages_set_updated_at
on public.application_messages;

create trigger application_messages_set_updated_at
before update on public.application_messages
for each row
execute function public.set_updated_at();


drop trigger if exists visa_documents_set_updated_at
on public.visa_documents;

create trigger visa_documents_set_updated_at
before update on public.visa_documents
for each row
execute function public.set_updated_at();


drop trigger if exists website_settings_set_updated_at
on public.website_settings;

create trigger website_settings_set_updated_at
before update on public.website_settings
for each row
execute function public.set_updated_at();


drop trigger if exists email_settings_set_updated_at
on public.email_settings;

create trigger email_settings_set_updated_at
before update on public.email_settings
for each row
execute function public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================

alter table public.applications enable row level security;
alter table public.visa_services enable row level security;
alter table public.application_messages enable row level security;
alter table public.applicant_documents enable row level security;
alter table public.visa_documents enable row level security;
alter table public.website_settings enable row level security;
alter table public.email_settings enable row level security;
alter table public.email_logs enable row level security;

-- =========================================================
-- INITIAL VISA SERVICES
-- =========================================================

insert into public.visa_services
  (name, slug, short_description, display_order)
values
  ('Visitor Visa', 'visitor-visa', 'Apply for a temporary visit to Canada.', 1),
  ('Student Visa', 'student-visa', 'Information and application services for study in Canada.', 2),
  ('Work Permit', 'work-permit', 'Application services for eligible work permit applicants.', 3),
  ('Permanent Residence', 'permanent-residence', 'Permanent residence application services.', 4),
  ('Family Sponsorship', 'family-sponsorship', 'Family sponsorship application services.', 5),
  ('Express Entry', 'express-entry', 'Express Entry application services.', 6),
  ('Business Immigration', 'business-immigration', 'Business immigration application services.', 7)
on conflict (slug) do nothing;
