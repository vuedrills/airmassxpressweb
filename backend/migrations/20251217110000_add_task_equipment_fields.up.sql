-- Add equipment-specific fields to tasks table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS hire_duration_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER,
ADD COLUMN IF NOT EXISTS fuel_included BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS operator_preference VARCHAR(20),
ADD COLUMN IF NOT EXISTS required_capacity_id UUID REFERENCES equipment_capacities(id);
