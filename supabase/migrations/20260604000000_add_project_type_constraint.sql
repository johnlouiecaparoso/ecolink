-- Enforce Philippine-eligible project types on projects.category.
--
-- The platform review flagged that project categories were too generic (a
-- free-text box). The front-end now offers a fixed dropdown; this migration
-- backs that with a database CHECK constraint so the API cannot be used to
-- store an arbitrary category.
--
-- Allowed values (must stay in sync with src/constants/projectTypes.js):
--   Biochar & Bio-briquettes
--   Biomass-to-Energy (WTE)
--   Reforestation & Agroforestry
--   Renewable Energy
--   Methane Avoidance
--   Industrial Decarbonization
--   Coastal & Watershed Protection

-- 1) Map existing free-form categories to the nearest eligible type so that no
--    existing row violates the constraint (a NOT VALID constraint would still
--    block future UPDATEs to legacy rows, e.g. status changes, so we normalise
--    every row up front and then add a fully validated constraint).
update public.projects
set category = case
  when category ilike '%biochar%' or category ilike '%briquette%'
    then 'Biochar & Bio-briquettes'
  when category ilike '%biomass%' or category ilike '%waste-to-energy%'
    or category ilike '%wte%' or category ilike '%pellet%'
    then 'Biomass-to-Energy (WTE)'
  when category ilike '%forest%' or category ilike '%agro%' or category ilike '%tree%'
    or category ilike '%mangrove%' or category ilike '%bamboo%'
    or category ilike '%conservation%' or category ilike '%biodiversity%'
    or category ilike '%agriculture%'
    then 'Reforestation & Agroforestry'
  when category ilike '%methane%' or category ilike '%livestock%' or category ilike '%waste%'
    then 'Methane Avoidance'
  when category ilike '%industr%' or category ilike '%decarbon%'
    then 'Industrial Decarbonization'
  when category ilike '%coast%' or category ilike '%watershed%'
    or category ilike '%marine%' or category ilike '%blue carbon%'
    then 'Coastal & Watershed Protection'
  when category ilike '%renewable%' or category ilike '%solar%' or category ilike '%biogas%'
    or category ilike '%hydro%' or category ilike '%energy%' or category ilike '%climate%'
    or category ilike '%green tech%'
    then 'Renewable Energy'
  else 'Renewable Energy' -- catch-all for any remaining legacy/sample values
end
where category is null
  or category not in (
    'Biochar & Bio-briquettes',
    'Biomass-to-Energy (WTE)',
    'Reforestation & Agroforestry',
    'Renewable Energy',
    'Methane Avoidance',
    'Industrial Decarbonization',
    'Coastal & Watershed Protection'
  );

-- 2) Add the validated CHECK constraint.
alter table public.projects
  drop constraint if exists projects_category_eligible_check;

alter table public.projects
  add constraint projects_category_eligible_check
  check (category in (
    'Biochar & Bio-briquettes',
    'Biomass-to-Energy (WTE)',
    'Reforestation & Agroforestry',
    'Renewable Energy',
    'Methane Avoidance',
    'Industrial Decarbonization',
    'Coastal & Watershed Protection'
  ));
