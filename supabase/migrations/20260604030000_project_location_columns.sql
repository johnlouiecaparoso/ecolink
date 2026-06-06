-- Ensure the project location columns the submission form collects actually
-- exist on the projects table. The enhanced ProjectForm captures geo-coordinates,
-- barangay and municipality, and the marketplace map / listing query now read
-- geo_coordinates. These ADD COLUMN IF NOT EXISTS statements are no-ops if the
-- columns are already present, but guarantee the marketplace query never breaks
-- on a missing column.

alter table public.projects
  add column if not exists geo_coordinates text;

alter table public.projects
  add column if not exists barangay text;

alter table public.projects
  add column if not exists municipality text;
