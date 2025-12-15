-- Create reviews table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    reviewee_id UUID NOT NULL REFERENCES users(id),
    rating DECIMAL(3,2) NOT NULL,
    rating_communication INT NOT NULL,
    rating_time INT NOT NULL,
    rating_professionalism INT NOT NULL,
    comment TEXT,
    reply TEXT,
    reply_created_at TIMESTAMP,
    weight DECIMAL(5,4) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE UNIQUE INDEX idx_reviews_task_reviewer ON reviews(task_id, reviewer_id);
CREATE INDEX idx_reviews_deleted_at ON reviews(deleted_at);

-- Add badge stats and flags to users table
ALTER TABLE users ADD COLUMN tasks_completed_on_time INT DEFAULT 0;
ALTER TABLE users ADD COLUMN badge_top_rated BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN badge_on_time BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN badge_rehired BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN badge_communicator BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN badge_quick_response BOOLEAN DEFAULT FALSE;
