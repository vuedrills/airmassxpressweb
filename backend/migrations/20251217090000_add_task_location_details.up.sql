ALTER TABLE tasks
ADD COLUMN city VARCHAR(100),
ADD COLUMN suburb VARCHAR(100),
ADD COLUMN address_details TEXT,
ADD COLUMN location_conf_source VARCHAR(50) DEFAULT 'user_confirmed_pin';
