-- Database Seeder SQL Script with Messages
-- Run this to populate the database with test data including conversations

-- Clear existing data
TRUNCATE TABLE offer_replies, offers, task_images, tasks, messages, conversation_participants, conversations, notifications, reviews, escrow_transactions, users RESTART IDENTITY CASCADE;

-- Insert Users (password for all: password123)
-- Using Argon2 hash for 'password123'
INSERT INTO users (id, email, password_hash, name, phone, avatar_url, bio, location, rating, review_count, created_at) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'tinashe.moyo@example.com', '$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQxMjM0NTY3OA$xK5Pz8F5Q7j9ZsVp', 'Tinashe Moyo', '+263771234567', '/avatars/63.jpg', 'Experienced handyman with 10+ years in home repairs', 'Borrowdale, Harare', 4.8, 24, NOW() - INTERVAL '180 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'rudo.chikara@example.com', '$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQxMjM0NTY3OA$xK5Pz8F5Q7j9ZsVp', 'Rudo Chikara', '+263772345678', '/avatars/91.jpg', 'Professional cleaner with attention to detail', 'Avondale, Harare', 4.9, 45, NOW() - INTERVAL '250 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'farai.gumbo@example.com', '$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQxMjM0NTY3OA$xK5Pz8F5Q7j9ZsVp', 'Farai Gumbo', '+263773456789', '/avatars/47.jpg', 'Certified electrician, licensed and insured', 'Mount Pleasant, Harare', 4.7, 18, NOW() - INTERVAL '120 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'chipo.nkomo@example.com', '$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQxMjM0NTY3OA$xK5Pz8F5Q7j9ZsVp', 'Chipo Nkomo', '+263774567890', '/avatars/72.jpg', 'Plumbing expert with fast and reliable service', 'Greendale, Harare', 4.6, 31, NOW() - INTERVAL '90 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'tendai.zvobgo@example.com', '$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQxMjM0NTY3OA$xK5Pz8F5Q7j9ZsVp', 'Tendai Zvobgo', '+263775678901', '/avatars/33.jpg', 'Garden maintenance and landscaping specialist', 'Newlands, Harare', 4.5, 22, NOW() - INTERVAL '60 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'nyasha.phiri@example.com', '$argon2id$v=19$m=65536,t=3,p=2$c29tZXNhbHQxMjM0NTY3OA$xK5Pz8F5Q7j9ZsVp', 'Nyasha Phiri', '+263776789012', '/avatars/88.jpg', 'Professional painter with artistic eye for design', 'Alexandra Park, Harare', 4.9, 38, NOW() - INTERVAL '200 days');

-- Insert Tasks with realistic images from placeholder.com
INSERT INTO tasks (id, poster_id, title, description, category, budget, location, date_type, status, created_at) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fix leaking bathroom pipe', 'I have a pipe under my bathroom sink that has been leaking for the past week. It''s getting worse and I need someone to fix it urgently. The leak seems to be coming from the connection joint. I have basic tools but not sure how to fix it properly without causing more damage.', 'Plumbing', 150, 'Borrowdale, Harare', 'flexible', 'open', NOW() - INTERVAL '5 hours'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'House painting - 3 bedrooms', 'Need a professional painter to paint 3 bedrooms in my house. Walls are already prepped and clean. Looking for someone with experience in interior painting who can deliver a smooth, professional finish. Paint and basic supplies will be provided. Approximately 45 square meters total.', 'Painting', 500, 'Avondale, Harare', 'on_date', 'open', NOW() - INTERVAL '12 hours'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Install ceiling fan in living room', 'I bought a new ceiling fan and need help installing it safely. The electrical box is already in place in the ceiling. Need someone licensed and experienced with electrical work. Fan comes with all mounting hardware and instructions. Living room ceiling is about 3 meters high.', 'Electrical Service', 120, 'Mount Pleasant, Harare', 'before_date', 'open', NOW() - INTERVAL '8  hours'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Deep clean 4-bedroom house', 'Looking for a professional cleaning service for a thorough spring clean. Need someone to do deep cleaning including windows, carpets, kitchen appliances, bathrooms, and all rooms. House is approximately 180 square meters. Prefer someone who uses eco-friendly cleaning products if possible.', 'Other', 300, 'Greendale, Harare', 'flexible', 'open', NOW() - INTERVAL '24 hours'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Garden maintenance - lawn mowing and weeding', 'Need regular garden maintenance services. Front and back yard need mowing, weeding, edging and general tidying. About 200 square meters of lawn area. Looking for someone reliable who can come weekly or bi-weekly. Must bring own equipment (lawn mower, trimmer, etc).', 'Landscaping', 80, 'Newlands, Harare', 'flexible', 'open', NOW() - INTERVAL '18 hours'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Assemble IKEA furniture - wardrobe and desk', 'Just received furniture delivery from IKEA and need help assembling. One large 3-door wardrobe and one office desk with drawers. All parts and instructions are included. Should take 2-3 hours for someone experienced with furniture assembly. Tools can be provided if needed.', 'Carpentry', 100, 'Alexandra Park, Harare', 'flexible', 'open', NOW() - INTERVAL '36 hours');

-- Insert Task Images using real placeholder images
INSERT INTO task_images (id, task_id, url) VALUES
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'https://images.unsplash.com/photo-1595814433015-e29bbd2d9eb6?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=600'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600');

-- Insert Offers
INSERT INTO offers (id, task_id, tasker_id, amount, description, estimated_duration, availability, status, created_at) VALUES
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 140, 'I can fix this today! I''m a licensed plumber with 8 years experience. I''ll replace the faulty joint and check all other connections to prevent future leaks. Price includes parts and labor.', '2 hours', 'Available today after 2pm', 'pending', NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 130, 'Hi! I''ve handled many similar plumbing issues in the past. Will bring all necessary tools and common parts. Can come tomorrow morning and have it fixed within 2 hours. References available.', '2 hours', 'Tomorrow 9am-12pm', 'pending', NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 480, 'Professional interior painter here! I''ll ensure smooth finish with no drips or streaks. Will prep walls if needed, apply primer, and do 2 coats of quality paint. Work includes protecting floors and furniture with drop cloths.', '2 days', 'Can start next Monday', 'pending', NOW() - INTERVAL '10 hours'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 450, 'I have extensive experience painting both residential and commercial spaces. Will work cleanly and efficiently. Can provide references and photos from previous residential painting jobs.', '2 days', 'Flexible - anytime', 'pending', NOW() - INTERVAL '6 hours'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 100, 'Licensed electrician with 12 years experience. Will install the ceiling fan safely according to electrical code. Includes testing proper balance and providing certificate of electrical work completion.', '1.5 hours', 'Tomorrow afternoon 2-5pm', 'pending', NOW() - INTERVAL '4 hours'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 280, 'Professional cleaning service with all eco-friendly products. I have my own equipment and supplies. Will do thorough deep clean including hard-to-reach areas, inside appliances, baseboards, etc. Satisfaction guaranteed!', 'Full day (6-7 hours)', 'This weekend Saturday', 'pending', NOW() - INTERVAL '20 hours'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 70, 'I specialize in garden maintenance and have all professional equipment. Have my own commercial mower, trimmer, edger, and leaf blower. Can set up weekly schedule if you''re happy with the work. Very reliable!', '2-3 hours', 'Every Saturday morning', 'pending', NOW() - INTERVAL '12 hours'),
(gen_random_uuid(), 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 90, 'I''ve assembled hundreds of IKEA furniture pieces over the years. Fast, efficient, and meticulous. Will make sure everything is sturdy and properly aligned. Have all the tools needed including power drill.', '2-3 hours', 'Available this evening after 6pm', 'pending', NOW() - INTERVAL '30 hours');

-- Create Conversations
INSERT INTO conversations (id, created_at, updated_at) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '1 hour'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', NOW() - INTERVAL '10 hours', NOW() - INTERVAL '6 hours'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '30 minutes'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', NOW() - INTERVAL '15 hours', NOW() - INTERVAL '2 hours');

-- Link Participants to Conversations (many-to-many)
INSERT INTO conversation_participants (conversation_id, user_id) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'), -- Tinashe & Chipo
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'), -- Rudo & Nyasha
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'), -- Farai himself (self-test)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14'), -- Chipo & Tendai
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15');

-- Insert Messages
INSERT INTO messages (id, conversation_id, sender_id, content, read, created_at) VALUES
-- Conversation 1: Tinashe & Chipo about plumbing
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Hi Chipo! Thanks for your offer on my plumbing task. Can you confirm you have all the necessary parts?', true, NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Hi Tinashe! Yes, I carry most common parts in my van. For the specific joint you mentioned, I have those in stock. If it''s an unusual size, I can pick it up from the suppliers - they''re only 10 minutes from your area.', true, NOW() - INTERVAL '2 hours 45 minutes'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Perfect! That sounds great. What time works best for you today?', true, NOW() - INTERVAL '2 hours 30 minutes'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'I can be there around 3pm if that works for you? Should take about 2 hours max.', true, NOW() - INTERVAL '2 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '3pm is perfect! See you then. The address is 45 Borrowdale Lane, Borrowdale. I''ll send you the gate code closer to the time.', false, NOW() - INTERVAL '1 hour'),

-- Conversation 2: Rudo & Nyasha about painting
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hi Nyasha! Your portfolio looks amazing. Do you provide your own protective covering for furniture and floors?', true, NOW() - INTERVAL '10 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Thank you so much! Yes absolutely - I bring professional drop cloths to protect all furniture and flooring. I''ll also tape off all trim, light fixtures and switches for clean lines.', true, NOW() - INTERVAL '9 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'That''s exactly what I was hoping to hear! One more question - I have some marks on the walls that need touching up first. Is that included?', true, NOW() - INTERVAL '8 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Yes! Wall prep is included. I''ll fill any holes, sand rough spots, and prime if needed. Want the surface perfect before painting. 😊', true, NOW() - INTERVAL '7 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Wonderful! You''re hired. When can you start?', false, NOW() - INTERVAL '6 hours'),

-- Conversation 3: Farai self-conversation (test)
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Testing message system...', true, NOW() - INTERVAL '4 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Messages working perfectly! 👍', false, NOW() - INTERVAL '30 minutes'),

-- Conversation 4: Chipo & Tendai about gardening
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Hi Tendai! I saw your offer for garden maintenance. Do you also do hedge trimming?', true, NOW() - INTERVAL '15 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Hi Chipo! Yes, hedge trimming is part of my regular service. I have professional hedge trimmers and can shape them however you like.', true, NOW() - INTERVAL '14 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Perfect! I need the front hedges trimmed to about 1.5 meters. Can you come this weekend?', true, NOW() - INTERVAL '12 hours'),
(gen_random_uuid(), 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Sure thing! Saturday morning works for me. I''ll bring my ladder and all equipment. See you around 9am?', false, NOW() - INTERVAL '2 hours');

-- Update offer counts
UPDATE tasks SET offer_count = (SELECT COUNT(*) FROM offers WHERE offers.task_id = tasks.id);

-- Insert Notifications
INSERT INTO notifications (id, user_id, type, title, message, read, created_at) VALUES
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'new_offer', 'New offer on your task', 'Chipo Nkomo made an offer of $140 on "Fix leaking bathroom pipe"', false, NOW() - INTERVAL '3 hours'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'new_message', 'New message', 'Chipo Nkomo sent you a message', false, NOW() - INTERVAL '1 hour'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'new_offer', 'New offer on your task', 'Nyasha Phiri made an offer of $480 on "House painting - 3 bedrooms"', true, NOW() - INTERVAL '10 hours'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'new_message', 'New message', 'Nyasha Phiri sent you a message', false, NOW() - INTERVAL '6 hours'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'offer_reply', 'Question about your offer', 'Tinashe Moyo asked a question about your offer', false, NOW() - INTERVAL '2 hours 30 minutes'),
(gen_random_uuid(), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'task_accepted', 'Your offer was accepted', 'Rudo Chikara accepted your offer on "House painting - 3 bedrooms"', false, NOW() - INTERVAL '6 hours');

-- Success messages
SELECT 'Database seed completed successfully!' as status;
SELECT COUNT(*) || ' users created' as result FROM users;
SELECT COUNT(*) || ' tasks created' as result FROM tasks;  
SELECT COUNT(*) || ' offers created' as result FROM offers;
SELECT COUNT(*) || ' task images created' as result FROM task_images;
SELECT COUNT(*) || ' conversations created' as result FROM conversations;
SELECT COUNT(*) || ' messages created' as result FROM messages;
SELECT COUNT(*) || ' notifications created' as result FROM notifications;
