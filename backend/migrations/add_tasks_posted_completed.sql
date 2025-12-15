-- Add tasks_posted_completed column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS tasks_posted_completed INTEGER DEFAULT 0;

-- Optionally: Sync existing data by counting completed tasks where user is the poster
UPDATE users u
SET tasks_posted_completed = (
    SELECT COUNT(*)
    FROM tasks t
    WHERE t.poster_id = u.id
    AND t.status = 'completed'
    AND t.deleted_at IS NULL
);
