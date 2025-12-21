package seeder

import (
	"encoding/json"
	"log"
	"math/rand"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// SeedDemoData populates the DB with realistic data if it's empty
func SeedDemoData(db *gorm.DB) {
	log.Println("Checking database density...")
	rand.Seed(time.Now().UnixNano())

	// 1. Create/Ensure Towns
	townsList := []*models.Town{
		{Name: "Harare", Slug: "harare", Active: true},
		{Name: "Bulawayo", Slug: "bulawayo", Active: true},
		{Name: "Mutare", Slug: "mutare", Active: true},
		{Name: "Gweru", Slug: "gweru", Active: true},
		{Name: "Masvingo", Slug: "masvingo", Active: true},
		{Name: "Kwekwe", Slug: "kwekwe", Active: true},
		{Name: "Kadoma", Slug: "kadoma", Active: true},
		{Name: "Chinhoyi", Slug: "chinhoyi", Active: true},
		{Name: "Marondera", Slug: "marondera", Active: true},
		{Name: "Bindura", Slug: "bindura", Active: true},
		{Name: "Victoria Falls", Slug: "victoria-falls", Active: true},
		{Name: "Kariba", Slug: "kariba", Active: true},
		{Name: "Beitbridge", Slug: "beitbridge", Active: true},
		{Name: "Chiredzi", Slug: "chiredzi", Active: true},
		{Name: "Zvishavane", Slug: "zvishavane", Active: true},
	}

	for _, t := range townsList {
		db.Where("slug = ?", t.Slug).FirstOrCreate(t)
	}

	var towns []*models.Town
	db.Find(&towns)

	// 2. Create Users (Ensure existence)
	hashed, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	hashedPw := string(hashed)

	userTemplates := []models.User{
		{Username: "tapiwa_h", Email: "tapiwa@example.com", Password: hashedPw, Role: models.RoleUser},
		{Username: "lungi_m", Email: "lungi@example.com", Password: hashedPw, Role: models.RoleUser},
		{Username: "nyasha_z", Email: "nyasha@example.com", Password: hashedPw, Role: models.RoleUser},
		{Username: "admin", Email: "admin@airmass.co.zw", Password: hashedPw, Role: models.RoleAdmin},
	}

	for i := range userTemplates {
		u := &userTemplates[i]
		if len(towns) > 0 {
			u.TownID = &towns[i%len(towns)].ID
		}
		db.Where("email = ?", u.Email).FirstOrCreate(u)
	}

	var users []models.User
	db.Find(&users)

	// Check Auction Density
	var auctionCount int64
	db.Model(&models.Auction{}).Count(&auctionCount)
	if auctionCount >= 1000 {
		log.Printf("Current density is %d auctions. Skipping auction seeder.", auctionCount)
		// Still seed conversations if needed
		var auctions []models.Auction
		db.Find(&auctions)
		seedConversations(db, users, auctions)
		return
	}

	log.Printf("Current density is %d. Seeding to ~1,350...", auctionCount)

	// 3. Get Categories
	var categories []models.Category
	db.Find(&categories)
	catMap := make(map[string]uint)
	for _, c := range categories {
		catMap[c.Slug] = c.ID
	}

	// 4. Create Auctions (10 per category)
	now := time.Now()
	var allAuctions []models.Auction

	images := map[string][]string{
		"cars": {
			"https://images.unsplash.com/photo-1559416523-140ddc3d238c",
			"https://images.unsplash.com/photo-1609521263047-f8f205293f24",
			"https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
			"https://images.unsplash.com/photo-1623869675781-80aa31012a5a",
			"https://images.unsplash.com/photo-1558618666-fcd25c85cd64",
			"https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8",
			"https://images.unsplash.com/photo-1533473359331-0135ef1b58bf",
		},
		"electronics": {
			"https://images.unsplash.com/photo-1678652197831-2d180705cd2c",
			"https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
			"https://images.unsplash.com/photo-1593359677879-a4bb92f829d1",
			"https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
			"https://images.unsplash.com/photo-1473968512647-3e447244af8f",
			"https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
			"https://images.unsplash.com/photo-1600294037681-c80b4cb5b434",
		},
		"property": {
			"https://images.unsplash.com/photo-1564013799919-ab600027ffc6",
			"https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
			"https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
			"https://images.unsplash.com/photo-1500382017468-9049fed747ef",
		},
	}

	log.Println("Generating ~1,350 auctions (10 per category per town)...")
	for _, town := range towns {
		for _, cat := range categories {
			for i := 1; i <= 10; i++ {
				userIdx := rand.Intn(len(users))

				daysOffset := rand.Intn(14) - 2
				startTime := now.Add(time.Duration(daysOffset) * 24 * time.Hour)
				endTime := startTime.Add(time.Duration(3+rand.Intn(11)) * 24 * time.Hour)

				minPrice := 10.0
				maxPrice := 1000.0
				if cat.Slug == "cars" {
					minPrice, maxPrice = 5000.0, 40000.0
				} else if cat.Slug == "property" {
					minPrice, maxPrice = 20000.0, 300000.0
				}

				price := minPrice + rand.Float64()*(maxPrice-minPrice)

				imgList := images[cat.Slug]
				if imgList == nil {
					imgList = images["electronics"]
				}
				img := imgList[rand.Intn(len(imgList))]
				imagesJSON, _ := json.Marshal([]string{img})

				auction := models.Auction{
					UserID:       users[userIdx].ID,
					TownID:       &town.ID,
					CategoryID:   cat.ID,
					Title:        cat.Name + " in " + town.Name + " #" + string(rune(65+i)),
					Description:  "High quality listing in " + town.Name + " for " + cat.Name + ". Excellent condition.",
					StartPrice:   price,
					CurrentPrice: price,
					BidCount:     0,
					Status:       models.StatusActive,
					Scope:        models.ScopeTown,
					StartTime:    &startTime,
					EndTime:      &endTime,
					Images:       datatypes.JSON(imagesJSON),
				}
				db.Create(&auction)
				allAuctions = append(allAuctions, auction)
			}
		}
	}

	// 5. Create Bids (100+ bids)
	var bids []models.Bid
	for _, auction := range allAuctions {
		numBids := 3 + rand.Intn(8)
		currentBid := auction.StartPrice

		for j := 0; j < numBids; j++ {
			bidderIdx := rand.Intn(len(users))
			if users[bidderIdx].ID == auction.UserID {
				bidderIdx = (bidderIdx + 1) % len(users)
			}

			increment := 10 + float64(rand.Intn(100))
			currentBid += increment
			bidTime := now.Add(-time.Duration(rand.Intn(48)) * time.Hour)

			bid := models.Bid{
				AuctionID: auction.ID,
				UserID:    users[bidderIdx].ID,
				Amount:    currentBid,
				CreatedAt: bidTime,
			}
			db.Create(&bid)
			bids = append(bids, bid)
		}

		db.Model(&auction).Updates(map[string]interface{}{
			"current_price": currentBid,
			"bid_count":     numBids,
		})
	}

	// 7. Create Sample Notifications for all users
	var notifications []models.Notification
	for _, user := range users {
		// Get some random auction IDs for notifications
		var auctionIDs []uint
		for i := 0; i < 3 && i < len(allAuctions); i++ {
			auctionIDs = append(auctionIDs, allAuctions[i].ID)
		}

		notifications = append(notifications, models.Notification{
			UserID:    user.ID,
			Type:      models.NotificationWelcome,
			Title:     "Welcome to AirMass! 👋",
			Message:   "Start browsing auctions in your town or list your first item.",
			IsRead:    true,
			CreatedAt: now.Add(-7 * 24 * time.Hour),
		})

		if len(auctionIDs) > 0 {
			notifications = append(notifications, models.Notification{
				UserID:    user.ID,
				Type:      models.NotificationOutbid,
				Title:     "You've been outbid! 🔔",
				Message:   "Someone placed a higher bid. Don't let this one get away!",
				AuctionID: &auctionIDs[0],
				IsRead:    false,
				CreatedAt: now.Add(-5 * time.Minute),
			})
		}

		if len(auctionIDs) > 1 {
			notifications = append(notifications, models.Notification{
				UserID:    user.ID,
				Type:      models.NotificationEndingSoon,
				Title:     "Auction Ending Soon ⏰",
				Message:   "An auction you're watching ends in 2 hours!",
				AuctionID: &auctionIDs[1],
				IsRead:    false,
				CreatedAt: now.Add(-1 * time.Hour),
			})
		}

		if len(auctionIDs) > 2 {
			notifications = append(notifications, models.Notification{
				UserID:    user.ID,
				Type:      models.NotificationNewBid,
				Title:     "New Bid on Your Auction 📈",
				Message:   "Someone placed a bid on your listing!",
				AuctionID: &auctionIDs[2],
				IsRead:    true,
				CreatedAt: now.Add(-3 * time.Hour),
			})
		}
	}
	db.Create(&notifications)

	// 7. Seed Sample Conversations and Messages for tapiwa@example.com
	seedConversations(db, users, allAuctions)

	log.Printf("Demo Data Seeded: %d towns, %d users, %d auctions, %d bids, %d notifications",
		len(towns), len(users), len(allAuctions), len(bids), len(notifications))
}

func seedConversations(db *gorm.DB, users []models.User, auctions []models.Auction) {
	// Check if conversations already exist
	var convCount int64
	db.Model(&models.Conversation{}).Count(&convCount)
	if convCount > 0 {
		log.Printf("Conversations already exist (%d). Skipping conversation seeding.", convCount)
		return
	}

	// Find tapiwa user
	var tapiwa models.User
	for _, u := range users {
		if u.Email == "tapiwa@example.com" {
			tapiwa = u
			break
		}
	}
	if tapiwa.ID == 0 {
		log.Println("tapiwa@example.com not found. Skipping conversation seeding.")
		return
	}

	// Find other users to chat with
	var otherUsers []models.User
	for _, u := range users {
		if u.Email != "tapiwa@example.com" && u.Email != "admin@airmass.co.zw" {
			otherUsers = append(otherUsers, u)
		}
	}

	if len(otherUsers) == 0 || len(auctions) == 0 {
		return
	}

	now := time.Now()

	// Create sample conversations
	conversations := []models.Conversation{}
	messages := []models.Message{}

	// Conversation 1: Tapiwa (buyer) with Lungi (seller) about first auction
	conv1 := models.Conversation{
		AuctionID:     auctions[0].ID,
		BuyerID:       tapiwa.ID,
		SellerID:      otherUsers[0].ID,
		LastMessage:   "Is this still available?",
		LastMessageAt: &now,
	}
	db.Create(&conv1)
	conversations = append(conversations, conv1)

	// Messages for conv1
	messages = append(messages, models.Message{
		ConversationID: conv1.ID,
		SenderID:       tapiwa.ID,
		Content:        "Hi! I'm interested in this item. Is it still available?",
		CreatedAt:      now.Add(-2 * time.Hour),
	})
	messages = append(messages, models.Message{
		ConversationID: conv1.ID,
		SenderID:       otherUsers[0].ID,
		Content:        "Yes it is! Would you like to come view it?",
		CreatedAt:      now.Add(-1*time.Hour - 45*time.Minute),
	})
	messages = append(messages, models.Message{
		ConversationID: conv1.ID,
		SenderID:       tapiwa.ID,
		Content:        "That would be great. Are you available this weekend?",
		CreatedAt:      now.Add(-1*time.Hour - 30*time.Minute),
	})
	messages = append(messages, models.Message{
		ConversationID: conv1.ID,
		SenderID:       otherUsers[0].ID,
		Content:        "Saturday works for me. I'm in Harare CBD.",
		CreatedAt:      now.Add(-1 * time.Hour),
	})
	messages = append(messages, models.Message{
		ConversationID: conv1.ID,
		SenderID:       tapiwa.ID,
		Content:        "Perfect! I'll message you on Saturday morning to confirm.",
		CreatedAt:      now.Add(-30 * time.Minute),
	})

	// Conversation 2: Tapiwa (seller) with Nyasha (buyer) about Tapiwa's auction
	if len(auctions) > 10 && len(otherUsers) > 1 {
		conv2LastMsgTime := now.Add(-4 * time.Hour)
		conv2 := models.Conversation{
			AuctionID:     auctions[10].ID,
			BuyerID:       otherUsers[1].ID,
			SellerID:      tapiwa.ID,
			LastMessage:   "Can you do $500?",
			LastMessageAt: &conv2LastMsgTime,
		}
		db.Create(&conv2)
		conversations = append(conversations, conv2)

		messages = append(messages, models.Message{
			ConversationID: conv2.ID,
			SenderID:       otherUsers[1].ID,
			Content:        "Hi there! I love this listing. What's your best price?",
			CreatedAt:      now.Add(-6 * time.Hour),
		})
		messages = append(messages, models.Message{
			ConversationID: conv2.ID,
			SenderID:       tapiwa.ID,
			Content:        "Thanks for your interest! The current price is already competitive, but I'm open to reasonable offers.",
			CreatedAt:      now.Add(-5*time.Hour - 30*time.Minute),
		})
		messages = append(messages, models.Message{
			ConversationID: conv2.ID,
			SenderID:       otherUsers[1].ID,
			Content:        "Can you do $500?",
			CreatedAt:      now.Add(-4 * time.Hour),
		})
	}

	// Conversation 3: Quick inquiry
	if len(auctions) > 50 {
		conv3LastMsgTime := now.Add(-24 * time.Hour)
		conv3 := models.Conversation{
			AuctionID:     auctions[50].ID,
			BuyerID:       tapiwa.ID,
			SellerID:      otherUsers[0].ID,
			LastMessage:   "Thanks for the quick response!",
			LastMessageAt: &conv3LastMsgTime,
		}
		db.Create(&conv3)
		conversations = append(conversations, conv3)

		messages = append(messages, models.Message{
			ConversationID: conv3.ID,
			SenderID:       tapiwa.ID,
			Content:        "Does this come with the original box?",
			CreatedAt:      now.Add(-26 * time.Hour),
		})
		messages = append(messages, models.Message{
			ConversationID: conv3.ID,
			SenderID:       otherUsers[0].ID,
			Content:        "Yes, everything is included! Box, charger, and accessories.",
			CreatedAt:      now.Add(-25 * time.Hour),
		})
		messages = append(messages, models.Message{
			ConversationID: conv3.ID,
			SenderID:       tapiwa.ID,
			Content:        "Thanks for the quick response!",
			CreatedAt:      now.Add(-24 * time.Hour),
		})
	}

	db.Create(&messages)
	log.Printf("Seeded %d conversations and %d messages", len(conversations), len(messages))
}
