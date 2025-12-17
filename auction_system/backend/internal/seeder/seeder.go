package seeder

import (
	"log"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/models"
	"gorm.io/gorm"
)

// SeedDemoData populates the DB with realistic data if it's empty
func SeedDemoData(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count > 0 {
		log.Println("Database already seeded, skipping demo data.")
		return
	}

	log.Println("Seeding Demo Data...")

	// 1. Create Towns
	harare := models.Town{Name: "Harare", Slug: "harare", Active: true}
	bulawayo := models.Town{Name: "Bulawayo", Slug: "bulawayo", Active: true}
	mutare := models.Town{Name: "Mutare", Slug: "mutare", Active: true}
	gweru := models.Town{Name: "Gweru", Slug: "gweru", Active: true}

	towns := []*models.Town{&harare, &bulawayo, &mutare, &gweru}
	db.Create(towns)

	// 2. Create Users
	users := []models.User{
		{Username: "tapiwa_h", Email: "tapiwa@example.com", TownID: &harare.ID},
		{Username: "lungi_m", Email: "lungi@example.com", TownID: &bulawayo.ID},
		{Username: "nyasha_z", Email: "nyasha@example.com", TownID: &mutare.ID},
		{Username: "farai_k", Email: "farai@example.com", TownID: &harare.ID},
	}
	db.Create(&users)

	// 3. Get Categories (Assume they are already seeded by main.go)
	var carsCat, elecCat, propCat, furnCat models.Category
	db.Where("slug = ?", "cars").First(&carsCat)
	db.Where("slug = ?", "electronics").First(&elecCat)
	db.Where("slug = ?", "property").First(&propCat)
	db.Where("slug = ?", "furniture").First(&furnCat)

	// 4. Create Auctions (Directly Active for demo purposes)
	now := time.Now()
	end7d := now.Add(7 * 24 * time.Hour)
	end2d := now.Add(2 * 24 * time.Hour)

	auctions := []models.Auction{
		// Cars in Harare
		{
			UserID: users[0].ID, TownID: &harare.ID, CategoryID: carsCat.ID,
			Title:       "Toyota Hilux GD-6 2021",
			Description: "Immaculate condition, 4x4, white, 45000km. Service history available.",
			StartPrice:  35000, CurrentPrice: 35000,
			Status: models.StatusActive, Scope: models.ScopeTown,
			StartTime: &now, EndTime: &end7d,
		},
		{
			UserID: users[3].ID, TownID: &harare.ID, CategoryID: carsCat.ID,
			Title:       "Honda Fit Hybrid",
			Description: "Fuel saver, new tyres, recently imported.",
			StartPrice:  4500, CurrentPrice: 4800, BidCount: 3,
			Status: models.StatusActive, Scope: models.ScopeTown,
			StartTime: &now, EndTime: &end2d,
		},
		// Electronics in Bulawayo
		{
			UserID: users[1].ID, TownID: &bulawayo.ID, CategoryID: elecCat.ID,
			Title:       "iPhone 14 Pro Max 256GB",
			Description: "Boxed, battery health 98%. Deep Purple.",
			StartPrice:  1100, CurrentPrice: 1250, BidCount: 5,
			Status: models.StatusActive, Scope: models.ScopeTown,
			StartTime: &now, EndTime: &end2d,
		},
		{
			UserID: users[1].ID, TownID: &bulawayo.ID, CategoryID: elecCat.ID,
			Title:       "MacBook Air M1",
			Description: "Space Grey, 8GB RAM, 256GB SSD. Minor scratch on lid.",
			StartPrice:  700, CurrentPrice: 700,
			Status: models.StatusActive, Scope: models.ScopeTown,
			StartTime: &now, EndTime: &end7d,
		},
		// Property in Mutare
		{
			UserID: users[2].ID, TownID: &mutare.ID, CategoryID: propCat.ID,
			Title:       "3 Bedroom House in Murambi",
			Description: "Sitting on 2000sqm, borehole, solar backup. Title deeds available.",
			StartPrice:  120000, CurrentPrice: 120000,
			Status: models.StatusActive, Scope: models.ScopeTown,
			StartTime: &now, EndTime: &end7d,
		},
		// Furniture in Gweru
		{
			UserID: users[0].ID, TownID: &gweru.ID, CategoryID: furnCat.ID,
			Title:       "Teak Dining Table (6 Seater)",
			Description: "Solid teak wood, vintage style. Heavy duty.",
			StartPrice:  400, CurrentPrice: 450, BidCount: 2,
			Status: models.StatusActive, Scope: models.ScopeTown,
			StartTime: &now, EndTime: &end7d,
		},
	}

	db.Create(&auctions)
	log.Println("Demo Data Seeded Successfully!")
}
