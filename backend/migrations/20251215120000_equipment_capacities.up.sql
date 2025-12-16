-- Equipment Module V2: Create equipment_capacities lookup table
-- This provides detailed capacity codes for each equipment type (D6/D7/D8 style)

CREATE TABLE equipment_capacities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_type VARCHAR(50) NOT NULL,
    capacity_code VARCHAR(30) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    min_weight_tons DECIMAL(10,2),
    max_weight_tons DECIMAL(10,2),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(equipment_type, capacity_code)
);

CREATE INDEX idx_equipment_capacities_type ON equipment_capacities(equipment_type);

-- ============================================
-- SEED DATA: All 21 Equipment Types
-- Context: Zimbabwe, British system, Chinese equipment
-- ============================================

-- 1. Roller Compactor
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Roller Compactor', 'WALK', 'Walk-Behind (0.5-1 ton)', 0.5, 1, 1),
('Roller Compactor', 'SMALL', 'Small Ride-On (1-3 ton)', 1, 3, 2),
('Roller Compactor', 'MEDIUM', 'Medium (3-8 ton)', 3, 8, 3),
('Roller Compactor', 'LARGE', 'Large (8-14 ton)', 8, 14, 4),
('Roller Compactor', 'HEAVY', 'Heavy (14+ ton)', 14, 25, 5);

-- 2. Plate Compactor
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Plate Compactor', 'LIGHT', 'Light (50-100kg)', 0.05, 0.1, 1),
('Plate Compactor', 'MEDIUM', 'Medium (100-200kg)', 0.1, 0.2, 2),
('Plate Compactor', 'HEAVY', 'Heavy (200-500kg)', 0.2, 0.5, 3),
('Plate Compactor', 'REVERSIBLE', 'Reversible (300-700kg)', 0.3, 0.7, 4);

-- 3. Compressor
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Compressor', 'PORTABLE', 'Portable (50-100 CFM)', NULL, NULL, 1),
('Compressor', 'SMALL', 'Small (100-185 CFM)', NULL, NULL, 2),
('Compressor', 'MEDIUM', 'Medium (185-375 CFM)', NULL, NULL, 3),
('Compressor', 'LARGE', 'Large (375-750 CFM)', NULL, NULL, 4),
('Compressor', 'HEAVY', 'Heavy Duty (750+ CFM)', NULL, NULL, 5);

-- 4. Motor Grader
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Motor Grader', 'SMALL', 'Small (10-12ft blade)', NULL, NULL, 1),
('Motor Grader', 'MEDIUM', 'Medium (12-14ft blade)', NULL, NULL, 2),
('Motor Grader', 'LARGE', 'Large (14-16ft blade)', NULL, NULL, 3),
('Motor Grader', 'HEAVY', 'Heavy Duty (16ft+ blade)', NULL, NULL, 4);

-- 5. Water Bowser
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Water Bowser', '5000L', '5,000 Litre', NULL, NULL, 1),
('Water Bowser', '10000L', '10,000 Litre', NULL, NULL, 2),
('Water Bowser', '18000L', '18,000 Litre', NULL, NULL, 3),
('Water Bowser', '36000L', '36,000 Litre', NULL, NULL, 4);

-- 6. Horse & Trailer
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Horse & Trailer', 'SINGLE', 'Single Axle (5-10 ton)', 5, 10, 1),
('Horse & Trailer', 'TANDEM', 'Tandem Axle (10-20 ton)', 10, 20, 2),
('Horse & Trailer', 'TRIAXLE', 'Tri-Axle (20-30 ton)', 20, 30, 3),
('Horse & Trailer', 'INTERLINK', 'Interlink (30-40 ton)', 30, 40, 4);

-- 7. Rigid Truck
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Rigid Truck', '4TON', '4 Ton', 3, 4, 1),
('Rigid Truck', '8TON', '8 Ton', 7, 8, 2),
('Rigid Truck', '10TON', '10 Ton', 9, 10, 3),
('Rigid Truck', '15TON', '15 Ton', 14, 15, 4);

-- 8. Generator
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Generator', 'SMALL', 'Small (5-20 kVA)', NULL, NULL, 1),
('Generator', 'MEDIUM', 'Medium (20-100 kVA)', NULL, NULL, 2),
('Generator', 'LARGE', 'Large (100-500 kVA)', NULL, NULL, 3),
('Generator', 'INDUSTRIAL', 'Industrial (500+ kVA)', NULL, NULL, 4);

-- 9. Deck Pan
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Deck Pan', 'SMALL', 'Small (2-4 cubic metres)', NULL, NULL, 1),
('Deck Pan', 'MEDIUM', 'Medium (4-6 cubic metres)', NULL, NULL, 2),
('Deck Pan', 'LARGE', 'Large (6-10 cubic metres)', NULL, NULL, 3);

-- 10. Lowbed (all sizes)
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Lowbed', '30TON', '30 Ton', 25, 30, 1),
('Lowbed', '50TON', '50 Ton', 40, 50, 2),
('Lowbed', '70TON', '70 Ton', 60, 70, 3),
('Lowbed', '100TON', '100 Ton', 80, 100, 4),
('Lowbed', '150TON', '150+ Ton', 100, 200, 5);

-- 11. Excavator
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Excavator', 'MINI', 'Mini (1-3 ton)', 1, 3, 1),
('Excavator', 'SMALL', 'Small (5-8 ton)', 5, 8, 2),
('Excavator', 'MEDIUM', 'Medium (12-16 ton)', 12, 16, 3),
('Excavator', 'LARGE', 'Large (20-25 ton)', 20, 25, 4),
('Excavator', 'HEAVY', 'Heavy (30-40 ton)', 30, 40, 5),
('Excavator', 'SUPER', 'Super Heavy (40+ ton)', 40, 100, 6);

-- 12. Bulldozer
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Bulldozer', 'D4', 'D4 Class (8-10 ton)', 8, 10, 1),
('Bulldozer', 'D5', 'D5 Class (12-15 ton)', 12, 15, 2),
('Bulldozer', 'D6', 'D6 Class (15-20 ton)', 15, 20, 3),
('Bulldozer', 'D7', 'D7 Class (20-30 ton)', 20, 30, 4),
('Bulldozer', 'D8', 'D8 Class (35-45 ton)', 35, 45, 5),
('Bulldozer', 'D9', 'D9 Class (45-60 ton)', 45, 60, 6),
('Bulldozer', 'D10', 'D10 Class (60-80 ton)', 60, 80, 7),
('Bulldozer', 'D11', 'D11 Class (80+ ton)', 80, 120, 8);

-- 13. Concrete Mixer
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Concrete Mixer', 'PORTABLE', 'Portable (0.5 cubic metre)', NULL, NULL, 1),
('Concrete Mixer', '4M3', '4 Cubic Metre', NULL, NULL, 2),
('Concrete Mixer', '6M3', '6 Cubic Metre', NULL, NULL, 3),
('Concrete Mixer', '8M3', '8 Cubic Metre', NULL, NULL, 4);

-- 14. Forklift
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Forklift', '2TON', '2 Ton (3-4m lift)', 2, 2, 1),
('Forklift', '3TON', '3 Ton (3-5m lift)', 3, 3, 2),
('Forklift', '5TON', '5 Ton (3-6m lift)', 5, 5, 3),
('Forklift', '10TON', '10 Ton (4-7m lift)', 10, 10, 4),
('Forklift', '16TON', '16+ Ton Heavy Duty', 16, 25, 5);

-- 15. Loader
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Loader', 'SKID', 'Skid Steer (0.5-1 cubic metre)', NULL, NULL, 1),
('Loader', 'SMALL', 'Small (1-1.5 cubic metre)', NULL, NULL, 2),
('Loader', 'MEDIUM', 'Medium (2-3 cubic metre)', NULL, NULL, 3),
('Loader', 'LARGE', 'Large (3-5 cubic metre)', NULL, NULL, 4),
('Loader', 'HEAVY', 'Heavy (5+ cubic metre)', NULL, NULL, 5);

-- 16. TLB (Backhoe Loader)
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('TLB', 'STANDARD', 'Standard (6-8 ton)', 6, 8, 1),
('TLB', 'EXTENDED', 'Extended Reach (8-10 ton)', 8, 10, 2),
('TLB', '4WD', '4WD Heavy Duty (10-12 ton)', 10, 12, 3);

-- 17. Tipper (Dump Truck)
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Tipper', '6M3', '6 Cubic Metre (10 ton)', 10, 10, 1),
('Tipper', '10M3', '10 Cubic Metre (15 ton)', 15, 15, 2),
('Tipper', '15M3', '15 Cubic Metre (20 ton)', 20, 20, 3),
('Tipper', '20M3', '20 Cubic Metre (30 ton)', 30, 30, 4),
('Tipper', 'ADT', 'Articulated Dump Truck (25-40 ton)', 25, 40, 5);

-- 18. Tower Crane
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Tower Crane', 'SMALL', 'Small (1-2 ton, 30-40m jib)', 1, 2, 1),
('Tower Crane', 'MEDIUM', 'Medium (2-5 ton, 40-50m jib)', 2, 5, 2),
('Tower Crane', 'LARGE', 'Large (5-10 ton, 50-60m jib)', 5, 10, 3),
('Tower Crane', 'HEAVY', 'Heavy (10+ ton, 60m+ jib)', 10, 25, 4);

-- 19. Mobile Crane
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Mobile Crane', '10TON', '10 Ton', 8, 10, 1),
('Mobile Crane', '25TON', '25 Ton', 20, 25, 2),
('Mobile Crane', '50TON', '50 Ton', 40, 50, 3),
('Mobile Crane', '100TON', '100 Ton', 80, 100, 4),
('Mobile Crane', '200TON', '200+ Ton', 150, 300, 5);

-- 20. Scaffolds
INSERT INTO equipment_capacities (equipment_type, capacity_code, display_name, min_weight_tons, max_weight_tons, sort_order) VALUES
('Scaffolds', 'MOBILE', 'Mobile Tower (2-8m)', NULL, NULL, 1),
('Scaffolds', 'FRAME', 'Frame Scaffold (per set)', NULL, NULL, 2),
('Scaffolds', 'SYSTEM', 'System Scaffold (per sqm)', NULL, NULL, 3),
('Scaffolds', 'SUSPENDED', 'Suspended/Hanging Platform', NULL, NULL, 4);

-- Add lat/lng to inventory for distance calculations
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS lat DECIMAL(10,7);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS lng DECIMAL(10,7);

-- Add capacity_id foreign key to link to new capacities table
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS capacity_id UUID REFERENCES equipment_capacities(id);

-- Add operator and rate fields to inventory
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS with_operator BOOLEAN DEFAULT false;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS weekly_rate DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS operator_bundled BOOLEAN DEFAULT true;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS operator_fee DECIMAL(10,2);

-- Add hire duration fields to tasks (equipment requests)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hire_duration_type VARCHAR(20);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours INT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS operator_preference VARCHAR(20);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS required_capacity_id UUID REFERENCES equipment_capacities(id);

-- Add quote fields to offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS quote_type VARCHAR(20);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS rate_type VARCHAR(20);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS base_rate DECIMAL(10,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS operator_fee DECIMAL(10,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS includes_operator BOOLEAN DEFAULT false;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS inventory_id UUID REFERENCES inventory_items(id);
