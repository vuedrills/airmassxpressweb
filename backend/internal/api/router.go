package api

import (
	"github.com/airmassxpress/backend/internal/api/handlers"
	"github.com/airmassxpress/backend/internal/api/middleware"
	"github.com/airmassxpress/backend/internal/config"
	"github.com/airmassxpress/backend/internal/services"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(cfg *config.Config, db *gorm.DB, fcm *services.FCMService, hub *services.Hub) *gin.Engine {
	router := gin.Default()

	// CORS middleware
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = cfg.CORS.AllowedOrigins
	corsConfig.AllowCredentials = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(cfg, db)
	taskHandler := handlers.NewTaskHandler(db, fcm, hub)
	offerHandler := handlers.NewOfferHandler(cfg, db, fcm, hub)
	notificationHandler := handlers.NewNotificationHandler(db)
	userHandler := handlers.NewUserHandler(db)
	taskerHandler := handlers.NewTaskerHandler(cfg, db)
	chatHandler := handlers.NewChatHandler(db, hub)
	commentHandler := handlers.NewCommentHandler(db, hub)
	equipmentCapacityHandler := handlers.NewEquipmentCapacityHandler(db)

	// Public routes
	api := router.Group("/api/v1")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/refresh", authHandler.RefreshToken)
		}

		// Public task browsing
		// IMPORTANT: More specific routes must come BEFORE general routes
		api.GET("/tasks/:id/questions", commentHandler.GetTaskQuestions)
		api.GET("/tasks", taskHandler.ListTasks)
		api.GET("/tasks/:id", taskHandler.GetTask)

		// Public user profiles
		api.GET("/users/:id", userHandler.GetUser)

		// Public professions
		api.GET("/professions", taskerHandler.GetProfessions)

		// Equipment capacities (public)
		api.GET("/equipment-capacities", equipmentCapacityHandler.GetAllCapacities)
		api.GET("/equipment-capacities/:type", equipmentCapacityHandler.GetCapacitiesByType)
		api.GET("/equipment-types", equipmentCapacityHandler.GetEquipmentTypes)

		// Admin routes (dev only)
		admin := api.Group("/admin")
		{
			admin.POST("/approve-tasker", taskerHandler.ApproveTasker)
			admin.POST("/verify-user", userHandler.AdminVerifyUser)
			admin.GET("/taskers/pending", taskerHandler.GetPendingTaskers)
			admin.GET("/users", userHandler.GetAllUsers)
		}

	}

	// Static files
	router.Static("/uploads", "./uploads")
	router.Static("/avatars", "./public/avatars")
	router.Static("/public", "./public")
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware(cfg))
	protected.Use(middleware.UpdateActivity(db))
	{
		// Auth (authenticated)
		protected.GET("/auth/me", authHandler.GetMe)
		protected.POST("/auth/logout", authHandler.Logout)

		// User management
		protected.PATCH("/users/:id", userHandler.UpdateUser)
		protected.POST("/users/:id/avatar", userHandler.UploadAvatar)
		protected.POST("/users/fcm-token", userHandler.UpdateFCMToken)

		// Tasker management
		protected.POST("/tasker/profile", taskerHandler.UpdateProfile)
		protected.POST("/tasker/upload-metadata", taskerHandler.UploadMetadata)

		// Task management
		protected.GET("/tasks/active", taskHandler.GetActiveTasks)
		protected.POST("/tasks", taskHandler.CreateTask)
		protected.PATCH("/tasks/:id", taskHandler.UpdateTask)
		protected.DELETE("/tasks/:id", taskHandler.DeleteTask)
		protected.POST("/tasks/:id/images", taskHandler.UploadTaskImages)
		protected.PUT("/tasks/:id/attachments", taskHandler.AddAttachments)
		protected.POST("/tasks/:id/complete", taskHandler.CompleteTask)
		protected.GET("/reviews/pending", taskHandler.GetPendingReviews)

		// Offers
		protected.POST("/offers", offerHandler.CreateOffer)
		protected.GET("/offers/:id", offerHandler.GetOffer)
		protected.PATCH("/offers/:id", offerHandler.UpdateOffer)
		protected.DELETE("/offers/:id", offerHandler.WithdrawOffer)
		protected.POST("/offers/:id/accept", offerHandler.AcceptOffer)
		protected.POST("/offers/:id/replies", offerHandler.AddReply)
		protected.GET("/offers/:id/replies", offerHandler.GetReplies)

		// Notifications
		protected.GET("/notifications", notificationHandler.ListNotifications)
		protected.PATCH("/notifications/:id/read", notificationHandler.MarkAsRead)
		protected.PATCH("/notifications/read-all", notificationHandler.MarkAllAsRead)

		// Chat
		protected.GET("/conversations", chatHandler.GetConversations)
		protected.GET("/conversations/:conversationId/messages", chatHandler.GetMessages)
		protected.POST("/conversations/:conversationId/messages", chatHandler.SendMessage)
		protected.POST("/conversations/:conversationId/read", chatHandler.MarkConversationAsRead)

		// WebSocket endpoint for real-time messaging
		protected.GET("/ws", func(c *gin.Context) {
			services.ServeWs(hub, c)
		})

		// Protected routes for posting questions/replies
		protected.POST("/tasks/:id/questions", commentHandler.CreateQuestion)
		protected.POST("/questions/:id/reply", commentHandler.ReplyComment)

		// Reviews
		reviewHandler := handlers.NewReviewHandler(db)
		protected.POST("/reviews", reviewHandler.CreateReview)
		protected.POST("/reviews/:id/reply", reviewHandler.ReplyReview)

		// Inventory
		supabaseService := services.NewSupabaseService(cfg)
		inventoryHandler := handlers.NewInventoryHandler(cfg, db, supabaseService)
		protected.GET("/inventory", inventoryHandler.GetMyInventory)
		protected.POST("/inventory", inventoryHandler.CreateInventoryItem)
		protected.POST("/inventory/upload", inventoryHandler.UploadImage)
		protected.PUT("/inventory/:id", inventoryHandler.UpdateInventoryItem)
		protected.DELETE("/inventory/:id", inventoryHandler.DeleteInventoryItem)
	}

	return router
}
