package main

import (
	"log"
	"time"

	"github.com/airmassxpress/backend/internal/config"
	"github.com/airmassxpress/backend/internal/models"
	"github.com/airmassxpress/backend/internal/utils"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	db, err := gorm.Open(postgres.Open(cfg.GetDSN()), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("🌱 Starting database seed...")

	// Clear existing data
	log.Println("Clearing existing data...")
	db.Exec("TRUNCATE TABLE offer_replies, offers, task_attachments, tasks, notifications, reviews, messages, conversations, escrow_transactions, users RESTART IDENTITY CASCADE")

	users := seedUsers(db)
	tasks := seedTasks(db, users)
	offers := seedOffers(db, tasks, users)
	replies := seedOfferReplies(db, offers, users)
	seedNotifications(db, users, tasks, offers)

	log.Printf("✅ Created %d users, %d tasks, %d offers, %d replies\n", len(users), len(tasks), len(offers), len(replies))
	log.Println("🎉 Database seeding completed!")
}

func seedUsers(db *gorm.DB) []models.User {
	users := []models.User{
		{Email: "tinashe.moyo@example.com", Name: "Tinashe Moyo", Phone: "+263771234567", Location: "Borrowdale, Harare", AvatarURL: "/avatars/63.jpg", Bio: "Experienced handyman", Rating: 4.8, ReviewCount: 24},
		{Email: "rudo.chikara@example.com", Name: "Rudo Chikara", Phone: "+263772345678", Location: "Avondale, Harare", AvatarURL: "/avatars/91.jpg", Bio: "Professional cleaner", Rating: 4.9, ReviewCount: 45},
		{Email: "farai.gumbo@example.com", Name: "Farai Gumbo", Phone: "+263773456789", Location: "Mount Pleasant, Harare", AvatarURL: "/avatars/47.jpg", Bio: "Certified electrician", Rating: 4.7, ReviewCount: 18},
		{Email: "chipo.nkomo@example.com", Name: "Chipo Nkomo", Phone: "+263774567890", Location: "Greendale, Harare", AvatarURL: "/avatars/72.jpg", Bio: "Plumbing expert", Rating: 4.6, ReviewCount: 31},
		{Email: "tendai.zvobgo@example.com", Name: "Tendai Zvobgo", Phone: "+263775678901", Location: "Newlands, Harare", AvatarURL: "/avatars/33.jpg", Bio: "Garden specialist", Rating: 4.5, ReviewCount: 22},
		{Email: "nyasha.phiri@example.com", Name: "Nyasha Phiri", Phone: "+263776789012", Location: "Alexandra Park, Harare", AvatarURL: "/avatars/88.jpg", Bio: "Professional painter", Rating: 4.9, ReviewCount: 38},
	}

	for i := range users {
		hashedPassword, _ := utils.HashPassword("password123")
		users[i].PasswordHash = hashedPassword
		users[i].ID = uuid.New()
	}

	db.Create(&users)
	return users
}

func seedTasks(db *gorm.DB, users []models.User) []models.Task {
	now := time.Now()

	tasks := []models.Task{
		{
			ID: uuid.New(), PosterID: users[0].ID, Title: "Fix leaking bathroom pipe",
			Description: "I have a pipe under my bathroom sink that's been leaking. Need someone to fix it urgently.",
			Category:    "Plumbing", Budget: 150, Location: "Borrowdale, Harare", DateType: "flexible", Status: "open",
			CreatedAt: now.Add(-5 * time.Hour),
		},
		{
			ID: uuid.New(), PosterID: users[1].ID, Title: "House painting - 3 bedrooms",
			Description: "Need a professional painter for 3 bedrooms. Paint and supplies provided.",
			Category:    "Painting", Budget: 500, Location: "Avondale, Harare", DateType: "on_date", Status: "open",
			CreatedAt: now.Add(-12 * time.Hour),
		},
		{
			ID: uuid.New(), PosterID: users[2].ID, Title: "Install ceiling fan in living room",
			Description: "Need help installing a new ceiling fan. The electrical box is already in place.",
			Category:    "Electrical Service", Budget: 120, Location: "Mount Pleasant, Harare", DateType: "before_date", Status: "open",
			CreatedAt: now.Add(-8 * time.Hour),
		},
		{
			ID: uuid.New(), PosterID: users[3].ID, Title: "Deep clean 4-bedroom house",
			Description: "Looking for professional cleaning service. Prefer eco-friendly products.",
			Category:    "Other", Budget: 300, Location: "Greendale, Harare", DateType: "flexible", Status: "open",
			CreatedAt: now.Add(-24 * time.Hour),
		},
		{
			ID: uuid.New(), PosterID: users[4].ID, Title: "Garden maintenance - lawn mowing",
			Description: "Need regular garden maintenance. About 200 square meters of lawn.",
			Category:    "Landscaping", Budget: 80, Location: "Newlands, Harare", DateType: "flexible", Status: "open",
			CreatedAt: now.Add(-18 * time.Hour),
		},
		{
			ID: uuid.New(), PosterID: users[5].ID, Title: "Assemble IKEA furniture",
			Description: "Need help assembling wardrobe and desk from IKEA. All parts included.",
			Category:    "Carpentry", Budget: 100, Location: "Alexandra Park, Harare", DateType: "flexible", Status: "open",
			CreatedAt: now.Add(-36 * time.Hour),
		},
	}

	for i := range tasks {
		db.Create(&tasks[i])
		// Add some task images
		db.Create(&models.TaskAttachment{ID: uuid.New(), TaskID: tasks[i].ID, URL: "/task-images/sample-" + tasks[i].Category + ".jpg", Type: "image", Name: "Sample Image"})
	}

	return tasks
}

func seedOffers(db *gorm.DB, tasks []models.Task, users []models.User) []models.Offer {
	now := time.Now()

	offers := []models.Offer{
		{ID: uuid.New(), TaskID: tasks[0].ID, TaskerID: users[3].ID, Amount: 140, Description: "I can fix this today! Licensed plumber with 8 years experience.", EstimatedDuration: "2 hours", Availability: "Available today after 2pm", Status: "pending", CreatedAt: now.Add(-3 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[0].ID, TaskerID: users[0].ID, Amount: 130, Description: "I've handled many similar plumbing issues. Can come tomorrow.", EstimatedDuration: "2 hours", Availability: "Tomorrow 9am-12pm", Status: "pending", CreatedAt: now.Add(-2 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[1].ID, TaskerID: users[5].ID, Amount: 480, Description: "Professional interior painter with smooth finish guarantee.", EstimatedDuration: "2 days", Availability: "Can start next Monday", Status: "pending", CreatedAt: now.Add(-10 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[1].ID, TaskerID: users[0].ID, Amount: 450, Description: "Experienced in residential painting. Can provide references.", EstimatedDuration: "2 days", Availability: "Flexible", Status: "pending", CreatedAt: now.Add(-6 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[2].ID, TaskerID: users[2].ID, Amount: 100, Description: "Licensed electrician. Will provide electrical certificate.", EstimatedDuration: "1.5 hours", Availability: "Tomorrow afternoon", Status: "pending", CreatedAt: now.Add(-4 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[3].ID, TaskerID: users[1].ID, Amount: 280, Description: "Professional cleaning with eco-friendly products.", EstimatedDuration: "6-7 hours", Availability: "This weekend", Status: "pending", CreatedAt: now.Add(-20 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[3].ID, TaskerID: users[5].ID, Amount: 290, Description: "Detailed cleaning service. Can provide references.", EstimatedDuration: "6-8 hours", Availability: "Weekdays", Status: "pending", CreatedAt: now.Add(-15 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[4].ID, TaskerID: users[4].ID, Amount: 70, Description: "Garden maintenance specialist. Can set up weekly schedule.", EstimatedDuration: "2-3 hours", Availability: "Every Saturday morning", Status: "pending", CreatedAt: now.Add(-12 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[5].ID, TaskerID: users[0].ID, Amount: 90, Description: "I've assembled many IKEA pieces. Fast and efficient.", EstimatedDuration: "2-3 hours", Availability: "This evening", Status: "pending", CreatedAt: now.Add(-30 * time.Hour)},
		{ID: uuid.New(), TaskID: tasks[5].ID, TaskerID: users[2].ID, Amount: 95, Description: "Experienced with furniture assembly. Perfect fit guaranteed.", EstimatedDuration: "3 hours", Availability: "Tomorrow morning", Status: "pending", CreatedAt: now.Add(-25 * time.Hour)},
	}

	for i := range offers {
		db.Create(&offers[i])
	}

	// Update offer counts
	for _, task := range tasks {
		var count int64
		db.Model(&models.Offer{}).Where("task_id = ?", task.ID).Count(&count)
		db.Model(&models.Task{}).Where("id = ?", task.ID).Update("offer_count", count)
	}

	return offers
}

func seedOfferReplies(db *gorm.DB, offers []models.Offer, users []models.User) []models.OfferReply {
	now := time.Now()

	replies := []models.OfferReply{
		{ID: uuid.New(), OfferID: offers[0].ID, AuthorID: users[0].ID, Message: "Thanks! Can you confirm you have all the parts needed?", CreatedAt: now.Add(-2 * time.Hour)},
		{ID: uuid.New(), OfferID: offers[0].ID, AuthorID: users[3].ID, Message: "Yes, I carry common parts. Can pick up specific sizes if needed.", CreatedAt: now.Add(-90 * time.Minute)},
		{ID: uuid.New(), OfferID: offers[2].ID, AuthorID: users[1].ID, Message: "Do you provide protective covering for furniture?", CreatedAt: now.Add(-8 * time.Hour)},
		{ID: uuid.New(), OfferID: offers[2].ID, AuthorID: users[5].ID, Message: "Absolutely! I bring drop cloths for all furniture and flooring.", CreatedAt: now.Add(-7 * time.Hour)},
		{ID: uuid.New(), OfferID: offers[4].ID, AuthorID: users[2].ID, Message: "Is your license up to date?", CreatedAt: now.Add(-3 * time.Hour)},
		{ID: uuid.New(), OfferID: offers[4].ID, AuthorID: users[2].ID, Message: "Yes, fully licensed and insured. Happy to share details.", CreatedAt: now.Add(-150 * time.Minute)},
	}

	for i := range replies {
		db.Create(&replies[i])
	}

	return replies
}

func seedNotifications(db *gorm.DB, users []models.User, tasks []models.Task, offers []models.Offer) {
	now := time.Now()

	notifications := []models.Notification{
		{ID: uuid.New(), UserID: users[0].ID, Type: "new_offer", Title: "New offer on your task", Message: "Chipo Nkomo made an offer of $140", Read: false, CreatedAt: now.Add(-3 * time.Hour)},
		{ID: uuid.New(), UserID: users[0].ID, Type: "new_offer", Title: "New offer on your task", Message: "Tinashe Moyo made an offer of $130", Read: false, CreatedAt: now.Add(-2 * time.Hour)},
		{ID: uuid.New(), UserID: users[1].ID, Type: "new_offer", Title: "New offer on your task", Message: "Nyasha Phiri made an offer of $480", Read: true, CreatedAt: now.Add(-10 * time.Hour)},
		{ID: uuid.New(), UserID: users[3].ID, Type: "offer_reply", Title: "New reply to your offer", Message: "Tinashe Moyo replied to your offer", Read: false, CreatedAt: now.Add(-2 * time.Hour)},
		{ID: uuid.New(), UserID: users[5].ID, Type: "offer_reply", Title: "Question about your offer", Message: "Rudo Chikara asked a question", Read: true, CreatedAt: now.Add(-8 * time.Hour)},
	}

	for i := range notifications {
		db.Create(&notifications[i])
	}
}
