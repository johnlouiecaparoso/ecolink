-- Fix: "record \"new\" has no field \"updated_at\"" when updating credit_ownership
-- Your table has a trigger that sets updated_at on UPDATE, but the column was missing.
-- This adds the column so the trigger can run successfully.

ALTER TABLE credit_ownership
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Optional: ensure the trigger updates it on row change (if your trigger name differs, adjust)
-- CREATE OR REPLACE FUNCTION set_updated_at()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   NEW.updated_at = now();
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

COMMENT ON COLUMN credit_ownership.updated_at IS 'Set by trigger or app when row is updated';
