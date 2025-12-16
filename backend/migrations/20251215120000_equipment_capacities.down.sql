-- Equipment Module V2: Down migration

-- Remove quote fields from offers
ALTER TABLE offers DROP COLUMN IF EXISTS inventory_id;
ALTER TABLE offers DROP COLUMN IF EXISTS includes_operator;
ALTER TABLE offers DROP COLUMN IF EXISTS operator_fee;
ALTER TABLE offers DROP COLUMN IF EXISTS delivery_fee;
ALTER TABLE offers DROP COLUMN IF EXISTS base_rate;
ALTER TABLE offers DROP COLUMN IF EXISTS rate_type;
ALTER TABLE offers DROP COLUMN IF EXISTS quote_type;

-- Remove hire duration fields from tasks
ALTER TABLE tasks DROP COLUMN IF EXISTS required_capacity_id;
ALTER TABLE tasks DROP COLUMN IF EXISTS operator_preference;
ALTER TABLE tasks DROP COLUMN IF EXISTS estimated_hours;
ALTER TABLE tasks DROP COLUMN IF EXISTS hire_duration_type;

-- Remove V2 fields from inventory_items
ALTER TABLE inventory_items DROP COLUMN IF EXISTS operator_fee;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS operator_bundled;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS delivery_fee;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS weekly_rate;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS daily_rate;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS hourly_rate;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS with_operator;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS capacity_id;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS lng;
ALTER TABLE inventory_items DROP COLUMN IF EXISTS lat;

-- Drop equipment_capacities table
DROP TABLE IF EXISTS equipment_capacities;
