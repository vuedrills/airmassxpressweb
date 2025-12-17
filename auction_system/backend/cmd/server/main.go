package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/models"
	"github.com/airmassxpress/auction_system/backend/internal/seeder"
	"github.com/airmassxpress/auction_system/backend/internal/service"
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
		dsn = "host=localhost user=airmass password=secure_password dbname=airmass_auction port=5432 sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Printf("Warning: Failed to connect to database: %v", err)
	} else {
		log.Println("Database connected successfully")
		// Auto Migrate
		err = db.AutoMigrate(
			&models.User{},
			&models.Town{},
			&models.Category{},
			&models.Auction{},
			&models.Bid{},
		)
		if err != nil {
			log.Printf("Migration failed: %v", err)
		}

		// Seed Categories (idempotent)
		seedCategories(db)

		// Seed Demo Data
		seeder.SeedDemoData(db)
	}

	// Initialize Services
	auctionService := service.NewAuctionService(db)
	rotationWorker := worker.NewRotationWorker(db)

	// Start Worker
	rotationWorker.Start(1 * time.Minute)

	r := gin.Default()

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "pong",
			"status":  "active",
		})
	})

	// Simple endpoint to test creation
	r.POST("/auctions", func(c *gin.Context) {
		var input service.CreateAuctionInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		auction, err := auctionService.CreateAuction(input)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusCreated, auction)
	})

	// GET /auctions - List Active Auctions
	r.GET("/auctions", func(c *gin.Context) {
		// Quick implementation directly here for MVP, or move to service
		// fetching only Active auctions
		var auctions []models.Auction
		// Preload User and Category for display
		if err := db.Preload("User").Preload("Category").Preload("Town").
			Where("status = ?", models.StatusActive).
			Find(&auctions).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, auctions)
	})

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
		if err := db.Where("slug = ?", cat.Slug).FirstOrCreate(&cat).Error; err != nil {
			log.Printf("Failed to seed category %s: %v", cat.Name, err)
		}
	}
}
