package main

import (
	"fmt"
	"log"

	"github.com/airmassxpress/backend/internal/api"
	"github.com/airmassxpress/backend/internal/config"
	"github.com/airmassxpress/backend/internal/models"
	"github.com/airmassxpress/backend/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load configuration:", err)
	}

	// Set Gin mode
	gin.SetMode(cfg.Server.GinMode)

	// Connect to database
	db, err := gorm.Open(postgres.Open(cfg.GetDSN()), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate database schema
	log.Println("Running database migrations...")
	err = db.AutoMigrate(
		&models.User{},
		&models.TaskerProfile{},
		&models.Task{},
		&models.Comment{},
		&models.TaskAttachment{},
		&models.Offer{},
		&models.OfferReply{},
		&models.Notification{},
		&models.Review{},
		&models.Conversation{},
		&models.ConversationParticipant{},
		&models.Message{},
		&models.EscrowTransaction{},
		&models.Profession{},
		&models.FCMToken{},
		&models.InventoryItem{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	log.Println("Database migrations completed successfully")

	// Initialize services
	// CREDENTIALS: Use env var or default locations.
	// For dev, if no creds, it might fail or we should handle gracefully.
	// Initialize WebSocket Hub
	hub := services.NewHub()
	go hub.Run()

	// Initialize services
	// CREDENTIALS: Use env var or default locations.
	// For dev, if no creds, it might fail or we should handle gracefully.
	fcmService, err := services.NewFCMService(db, hub, "serviceAccountKey.json") // Use local key file
	if err != nil {
		log.Printf("Warning: Failed to initialize FCM service: %v", err)
	}

	// Initialize router
	router := api.SetupRouter(cfg, db, fcmService, hub)

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server starting on %s", addr)
	if err := router.Run(addr); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
