package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/auth"
	"github.com/airmassxpress/auction_system/backend/internal/models"
	"github.com/airmassxpress/auction_system/backend/internal/seeder"
	"github.com/airmassxpress/auction_system/backend/internal/service"
	"github.com/airmassxpress/auction_system/backend/internal/socket"
	"github.com/airmassxpress/auction_system/backend/internal/worker"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load .env
	_ = godotenv.Load()

	// Simple config - in a real app use godotenv
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=localhost user=airmass password=secure_password dbname=airmass_auction port=5434 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("Warning: Failed to connect to database: %v", err)
	} else {
		log.Println("Database connected successfully")
		// Auto Migrate
		if err = db.AutoMigrate(&models.User{}); err != nil {
			log.Printf("Migration User failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Town{}); err != nil {
			log.Printf("Migration Town failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Category{}); err != nil {
			log.Printf("Migration Category failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Auction{}); err != nil {
			log.Printf("Migration Auction failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Bid{}); err != nil {
			log.Printf("Migration Bid failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Notification{}); err != nil {
			log.Printf("Migration Notification failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Conversation{}); err != nil {
			log.Printf("Migration Conversation failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Message{}); err != nil {
			log.Printf("Migration Message failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Comment{}); err != nil {
			log.Printf("Migration Comment failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Favorite{}); err != nil {
			log.Printf("Migration Favorite failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Review{}); err != nil {
			log.Printf("Migration Review failed: %v", err)
		}
		if err = db.AutoMigrate(&models.Report{}); err != nil {
			log.Printf("Migration Report failed: %v", err)
		}

		// Seed Categories (idempotent)
		seedCategories(db)

		// Seed Demo Data
		seeder.SeedDemoData(db)
	}

	// Initialize Services
	// Initialize Hub
	hub := socket.NewHub()
	go hub.Run()

	// Initialize Services
	notifService := service.NewNotificationService(db, hub)
	auctionService := service.NewAuctionService(db, hub, notifService)
	authService := auth.NewAuthService(db)
	authHandler := auth.NewAuthHandler(authService)
	rotationWorker := worker.NewRotationWorker(db, notifService)

	// Start Worker
	rotationWorker.Start(1 * time.Minute)

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
			"status":  "active",
		})
	})

	// WebSocket Route
	r.GET("/ws", func(c *gin.Context) {
		socket.ServeWs(hub, c)
	})

	// Auth Routes
	authRoutes := r.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
	}

	// POST /auctions - Create Auction (Protected)
	r.POST("/auctions", auth.AuthMiddleware(), func(c *gin.Context) {
		var input service.CreateAuctionInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Extract UserID from context
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		input.UserID = userID.(uint)

		auction, err := auctionService.CreateAuction(input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, auction)
	})

	// POST /auctions/:id/bids - Place Bid (Protected)
	r.POST("/auctions/:id/bids", auth.AuthMiddleware(), func(c *gin.Context) {
		idStr := c.Param("id")
		idUint, err := strconv.ParseUint(idStr, 10, 32)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid auction id"})
			return
		}

		var input struct {
			Amount float64 `json:"amount"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		userID, _ := c.Get("userID") // Middleware guarantees existence

		auction, err := auctionService.PlaceBid(uint(idUint), userID.(uint), input.Amount)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, auction)
	})

	// GET /users/me/auctions - My Auctions (Protected)
	r.GET("/users/me/auctions", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		auctions, err := auctionService.GetUserAuctions(userID.(uint))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, auctions)
	})

	// GET /users/me/bids - My Bids (Protected)
	r.GET("/users/me/bids", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		bids, err := auctionService.GetUserBids(userID.(uint))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, bids)
	})

	// GET /users/me/notifications - List User Notifications
	r.GET("/users/me/notifications", auth.AuthMiddleware(), func(c *gin.Context) {
		userID := c.GetUint("user_id")

		var notifications []models.Notification
		if err := db.Where("user_id = ?", userID).Order("created_at DESC").Limit(50).Find(&notifications).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, notifications)
	})

	// PATCH /notifications/read-all - Mark All Notifications as Read
	r.PATCH("/notifications/read-all", auth.AuthMiddleware(), func(c *gin.Context) {
		userID := c.GetUint("user_id")

		if err := db.Model(&models.Notification{}).Where("user_id = ? AND is_read = ?", userID, false).Update("is_read", true).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "All marked as read"})
	})

	// PATCH /notifications/:id/read - Mark Notification as Read
	r.PATCH("/notifications/:id/read", auth.AuthMiddleware(), func(c *gin.Context) {
		userID := c.GetUint("user_id")
		notifID := c.Param("id")

		result := db.Model(&models.Notification{}).Where("id = ? AND user_id = ?", notifID, userID).Update("is_read", true)
		if result.Error != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
			return
		}
		if result.RowsAffected == 0 {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notification not found"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Marked as read"})
	})

	// GET /users/:id - Public Profile
	r.GET("/users/:id", func(c *gin.Context) {
		idParam := c.Param("id")
		userID, _ := strconv.ParseUint(idParam, 10, 32)

		// If authenticated, check if following
		// Note: The middleware isn't strictly enforced here for viewing, but we want to check context if present
		// However, gin context won't have it unless middleware ran.
		// For simplicity, let's assume public view doesn't require auth to see profile,
		// but we might need a separate check for "is_following" if we want to show that state.
		// Let's rely on client to know if they are logged in.
		// Actually, let's make it optional auth if possible?
		// For now, let's just return public data. If key provided, we check.

		var user models.User
		if err := db.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}

		var followersCount int64
		db.Table("user_followers").Where("following_id = ?", userID).Count(&followersCount)

		var followingCount int64
		db.Table("user_followers").Where("follower_id = ?", userID).Count(&followingCount)

		var auctions []models.Auction
		db.Where("user_id = ? AND status = ?", userID, models.StatusActive).Limit(10).Find(&auctions)

		// Check is_following if auth header present (naive check or we just add a protected endpoint)
		// Let's just return the data for now.
		c.JSON(http.StatusOK, gin.H{
			"user":            user,
			"followers_count": followersCount,
			"following_count": followingCount,
			"auctions":        auctions,
		})
	})

	// POST /users/:id/follow - Follow/Unfollow User
	r.POST("/users/:id/follow", auth.AuthMiddleware(), func(c *gin.Context) {
		userIDVal, exists := c.Get("userID")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		currentUserID := userIDVal.(uint)

		targetIDStr := c.Param("id")
		targetID, _ := strconv.ParseUint(targetIDStr, 10, 32)

		if uint(targetID) == currentUserID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot follow yourself"})
			return
		}

		// check existing
		var count int64
		if err := db.Table("user_followers").Where("follower_id = ? AND following_id = ?", currentUserID, targetID).Count(&count).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if count > 0 {
			// Unfollow
			if err := db.Exec("DELETE FROM user_followers WHERE follower_id = ? AND following_id = ?", currentUserID, targetID).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to unfollow"})
				return
			}
			c.JSON(http.StatusOK, gin.H{"status": "unfollowed"})
		} else {
			// Follow
			if err := db.Exec("INSERT INTO user_followers (follower_id, following_id) VALUES (?, ?)", currentUserID, targetID).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to follow: " + err.Error()})
				return
			}

			// Notify target
			var currentUser models.User
			db.First(&currentUser, currentUserID)
			go notifService.Notify(uint(targetID), models.NotificationWelcome, "New Follower!", currentUser.Username+" started following you.", nil)

			c.JSON(http.StatusOK, gin.H{"status": "followed"})
		}
	})

	// POST /reports - Submit a Report
	r.POST("/reports", auth.AuthMiddleware(), func(c *gin.Context) {
		userID := c.GetUint("user_id")

		var input struct {
			SubjectType models.ReportType `json:"subject_type" binding:"required"`
			SubjectID   uint              `json:"subject_id" binding:"required"`
			Reason      string            `json:"reason" binding:"required"`
			Description string            `json:"description"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		report := models.Report{
			ReporterID:  userID,
			SubjectType: input.SubjectType,
			SubjectID:   input.SubjectID,
			Reason:      input.Reason,
			Description: input.Description,
			Status:      models.ReportPending,
		}

		if err := db.Create(&report).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, report)
	})

	// PATCH /users/me - Update Current User Profile
	r.PATCH("/users/me", auth.AuthMiddleware(), func(c *gin.Context) {
		userID := c.GetUint("user_id")

		var input struct {
			Username string `json:"username"`
			TownID   *uint  `json:"town_id"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		updates := map[string]interface{}{}
		if input.Username != "" {
			updates["username"] = input.Username
		}
		if input.TownID != nil {
			updates["town_id"] = *input.TownID
		}

		if len(updates) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
			return
		}

		if err := db.Model(&models.User{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Fetch updated user
		var user models.User
		db.First(&user, userID)
		c.JSON(http.StatusOK, user)
	})

	// GET /categories - List All Categories
	r.GET("/categories", func(c *gin.Context) {
		var categories []models.Category
		if err := db.Find(&categories).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, categories)
	})

	// GET /towns - List All Towns
	r.GET("/towns", func(c *gin.Context) {
		var towns []models.Town
		if err := db.Find(&towns).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, towns)
	})

	// GET /towns/:town_id/categories - Get categories with auction counts for a town
	r.GET("/towns/:town_id/categories", func(c *gin.Context) {
		townID := c.Param("town_id")

		type CategoryWithCount struct {
			ID           uint   `json:"id"`
			Name         string `json:"name"`
			Slug         string `json:"slug"`
			AuctionCount int    `json:"auction_count"`
		}

		var results []CategoryWithCount

		// Query to count auctions per category for a given town
		err := db.Raw(`
			SELECT c.id, c.name, c.slug, COUNT(a.id) as auction_count
			FROM categories c
			LEFT JOIN auctions a ON a.category_id = c.id AND a.town_id = ? AND a.status = 'active'
			GROUP BY c.id, c.name, c.slug
			ORDER BY c.name
		`, townID).Scan(&results).Error

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, results)
	})

	// GET /auctions - List Active Auctions with Optional Search
	// GET /auctions - List Active Auctions with Robust Search
	r.GET("/auctions", func(c *gin.Context) {
		query := c.Query("q")
		categoryID := c.Query("category_id")
		townID := c.Query("town_id")
		minPriceStr := c.Query("min_price")
		maxPriceStr := c.Query("max_price")
		sortBy := c.Query("sort_by") // created_at, current_price, end_time
		order := c.Query("order")    // asc, desc

		var auctions []models.Auction
		tx := db.Preload("User").Preload("Category").Preload("Town").Where("status = ?", models.StatusActive)

		if query != "" {
			tx = tx.Where("title ILIKE ?", "%"+query+"%")
		}

		if categoryID != "" {
			tx = tx.Where("category_id = ?", categoryID)
		}

		if townID != "" {
			tx = tx.Where("town_id = ?", townID)
		}

		if minPriceStr != "" {
			if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
				tx = tx.Where("current_price >= ?", minPrice)
			}
		}

		if maxPriceStr != "" {
			if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
				tx = tx.Where("current_price <= ?", maxPrice)
			}
		}

		// Sorting
		orderClause := "created_at desc" // Default
		if order != "asc" && order != "desc" {
			order = "desc"
		}

		switch sortBy {
		case "current_price":
			orderClause = "current_price " + order
		case "end_time":
			orderClause = "end_time " + order
		case "created_at":
			orderClause = "created_at " + order
		}

		// Pagination (Default limit 50 usually, but let's keep it simple or allow limit)
		// limitStr := c.Query("limit")
		// if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
		// 	tx = tx.Limit(limit)
		// } else {
		// 	tx = tx.Limit(100)
		// }

		if err := tx.Order(orderClause).Find(&auctions).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, auctions)
	})

	// GET /auctions/:id/bids - Get Bid History for an Auction
	r.GET("/auctions/:id/bids", func(c *gin.Context) {
		auctionID := c.Param("id")

		var bids []models.Bid
		if err := db.Preload("User").Where("auction_id = ?", auctionID).Order("created_at desc").Limit(50).Find(&bids).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, bids)
	})

	// GET /auctions/:id/comments - Get Comments for an Auction
	r.GET("/auctions/:id/comments", func(c *gin.Context) {
		auctionID := c.Param("id")

		var comments []models.Comment
		if err := db.Preload("User").Where("auction_id = ?", auctionID).Order("created_at desc").Limit(50).Find(&comments).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, comments)
	})

	// POST /auctions/:id/comments - Post a Comment
	r.POST("/auctions/:id/comments", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, _ := c.Get("userID")
		auctionIDStr := c.Param("id")
		auctionID, _ := strconv.ParseUint(auctionIDStr, 10, 32)

		var input struct {
			Content string `json:"content" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		comment := models.Comment{
			AuctionID: uint(auctionID),
			UserID:    userID.(uint),
			Content:   input.Content,
		}

		if err := db.Create(&comment).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Reload to get User
		db.Preload("User").First(&comment, comment.ID)

		c.JSON(http.StatusCreated, comment)
	})

	// ========== FAVORITES ENDPOINTS ==========

	// POST /auctions/:id/favorite - Toggle favorite status
	r.POST("/auctions/:id/favorite", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, _ := c.Get("userID")
		auctionIDStr := c.Param("id")
		auctionID, _ := strconv.ParseUint(auctionIDStr, 10, 32)

		var existing models.Favorite
		err := db.Where("user_id = ? AND auction_id = ?", userID, auctionID).First(&existing).Error

		if err == nil {
			// Exists, so remove it (Unlike)
			db.Delete(&existing)
			c.JSON(http.StatusOK, gin.H{"status": "removed", "is_favorited": false})
		} else {
			// Doesn't exist, create it (Like)
			fav := models.Favorite{
				UserID:    userID.(uint),
				AuctionID: uint(auctionID),
			}
			if err := db.Create(&fav).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusCreated, gin.H{"status": "added", "is_favorited": true})
		}
	})

	// GET /users/me/favorites - List my favorites
	r.GET("/users/me/favorites", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, _ := c.Get("userID")

		var favorites []models.Favorite
		// Preload Auction and images
		if err := db.Preload("Auction").Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Map to a list of auctions
		var auctions []models.Auction
		for _, f := range favorites {
			// Ensure auction is valid (not soft deleted, though Preload handles this usually)
			if f.Auction.ID != 0 {
				auctions = append(auctions, f.Auction)
			}
		}

		c.JSON(http.StatusOK, auctions)
	})

	// ========== REVIEW ENDPOINTS ==========

	// GET /users/:id/reviews - Get reviews for a user
	r.GET("/users/:id/reviews", func(c *gin.Context) {
		userID := c.Param("id")

		var reviews []models.Review
		if err := db.Preload("Reviewer").Where("reviewee_id = ?", userID).Order("created_at desc").Find(&reviews).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, reviews)
	})

	// POST /users/:id/reviews - Create a review
	r.POST("/users/:id/reviews", auth.AuthMiddleware(), func(c *gin.Context) {
		reviewerID, _ := c.Get("userID")
		revieweeIDStr := c.Param("id")
		revieweeID, _ := strconv.ParseUint(revieweeIDStr, 10, 32)

		if uint(revieweeID) == reviewerID.(uint) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot review yourself"})
			return
		}

		var input struct {
			Rating    int    `json:"rating" binding:"required,min=1,max=5"`
			Content   string `json:"content" binding:"required"`
			AuctionID *uint  `json:"auction_id"` // Optional
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		review := models.Review{
			ReviewerID: reviewerID.(uint),
			RevieweeID: uint(revieweeID),
			Rating:     input.Rating,
			Content:    input.Content,
			AuctionID:  input.AuctionID,
		}

		if err := db.Create(&review).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Reload to get reviewer details
		db.Preload("Reviewer").First(&review, review.ID)

		c.JSON(http.StatusCreated, review)
	})

	// ========== CHAT ENDPOINTS ==========

	// GET /conversations - List user's conversations
	r.GET("/conversations", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, _ := c.Get("userID")

		var conversations []models.Conversation
		if err := db.Preload("Buyer").Preload("Seller").Preload("Auction").
			Where("buyer_id = ? OR seller_id = ?", userID, userID).
			Order("last_message_at desc").
			Find(&conversations).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, conversations)
	})

	// POST /conversations - Start or get existing conversation
	r.POST("/conversations", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, _ := c.Get("userID")

		var input struct {
			AuctionID uint `json:"auction_id" binding:"required"`
			SellerID  uint `json:"seller_id" binding:"required"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// Check if conversation already exists
		var existing models.Conversation
		if err := db.Where("auction_id = ? AND buyer_id = ? AND seller_id = ?",
			input.AuctionID, userID, input.SellerID).First(&existing).Error; err == nil {
			c.JSON(http.StatusOK, existing)
			return
		}

		// Create new conversation
		conv := models.Conversation{
			AuctionID: input.AuctionID,
			BuyerID:   userID.(uint),
			SellerID:  input.SellerID,
		}
		if err := db.Create(&conv).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, conv)
	})

	// GET /conversations/:id/messages - Get messages in a conversation
	r.GET("/conversations/:id/messages", auth.AuthMiddleware(), func(c *gin.Context) {
		convID := c.Param("id")

		var messages []models.Message
		if err := db.Preload("Sender").Where("conversation_id = ?", convID).
			Order("created_at asc").Find(&messages).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, messages)
	})

	// POST /conversations/:id/messages - Send a message
	r.POST("/conversations/:id/messages", auth.AuthMiddleware(), func(c *gin.Context) {
		userID, _ := c.Get("userID")
		convID := c.Param("id")

		var input struct {
			Content  string `json:"content"`
			ImageURL string `json:"image_url"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if input.Content == "" && input.ImageURL == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Message content or image required"})
			return
		}

		convIDUint, _ := strconv.ParseUint(convID, 10, 32)

		msg := models.Message{
			ConversationID: uint(convIDUint),
			SenderID:       userID.(uint),
			Content:        input.Content,
			ImageURL:       input.ImageURL,
		}
		if err := db.Create(&msg).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Update conversation's last message
		now := time.Now()
		db.Model(&models.Conversation{}).Where("id = ?", convID).Updates(map[string]interface{}{
			"last_message":    input.Content,
			"last_message_at": now,
		})

		// Broadcast via WebSocket
		hub.BroadcastEvent("NEW_MESSAGE", msg)

		c.JSON(http.StatusCreated, msg)
	})

	// ========== IMAGE UPLOAD ==========

	// POST /upload - Upload an image
	r.POST("/upload", auth.AuthMiddleware(), func(c *gin.Context) {
		file, err := c.FormFile("image")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "No image file provided"})
			return
		}

		// Create uploads directory
		uploadDir := "./uploads"
		os.MkdirAll(uploadDir, 0755)

		// Generate unique filename
		ext := ".jpg"
		if len(file.Filename) > 4 {
			ext = file.Filename[len(file.Filename)-4:]
		}
		filename := strconv.FormatInt(time.Now().UnixNano(), 10) + ext
		filepath := uploadDir + "/" + filename

		if err := c.SaveUploadedFile(file, filepath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save image"})
			return
		}

		imageURL := "http://127.0.0.1:8080/uploads/" + filename
		c.JSON(http.StatusOK, gin.H{"url": imageURL})
	})

	// Serve uploaded files
	r.Static("/uploads", "./uploads")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func seedCategories(db *gorm.DB) {
	categories := []models.Category{
		{Name: "Cars & Vehicles", Slug: "cars", DurationDays: 25, MaxActiveSlotsPerTown: 15},
		{Name: "Property / Rentals", Slug: "property", DurationDays: 30, MaxActiveSlotsPerTown: 10},
		{Name: "Electronics", Slug: "electronics", DurationDays: 5, MaxActiveSlotsPerTown: 50},
		{Name: "Furniture", Slug: "furniture", DurationDays: 5, MaxActiveSlotsPerTown: 30},
		{Name: "Farming Equipment", Slug: "farming", DurationDays: 14, MaxActiveSlotsPerTown: 20},
		{Name: "Tools & Hardware", Slug: "tools", DurationDays: 5, MaxActiveSlotsPerTown: 100},
		{Name: "Fashion", Slug: "fashion", DurationDays: 5, MaxActiveSlotsPerTown: 200},
		{Name: "Stationery / Misc", Slug: "stationery", DurationDays: 3, MaxActiveSlotsPerTown: 200},
		// National category might be special, but fitting it here for now
		{Name: "National", Slug: "national", DurationDays: 30, MaxActiveSlotsPerTown: 500},
	}

	for _, cat := range categories {
		if err := db.Where("slug = ?", cat.Slug).Assign(cat).FirstOrCreate(&cat).Error; err != nil {
			log.Printf("Failed to seed category %s: %v", cat.Name, err)
		}
	}
}
