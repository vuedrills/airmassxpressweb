package service

import (
	"errors"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/models"
	"gorm.io/gorm"
)

type AuctionService struct {
	db *gorm.DB
}

func NewAuctionService(db *gorm.DB) *AuctionService {
	return &AuctionService{db: db}
}

type CreateAuctionInput struct {
	UserID      uint
	TownID      *uint
	CategoryID  uint
	Title       string
	Description string
	StartPrice  float64
	Scope       models.AuctionScope
	Images      []string
}

// CreateAuction handles the logic for creating an auction, checking slots, and assigning status.
func (s *AuctionService) CreateAuction(input CreateAuctionInput) (*models.Auction, error) {
	var auction models.Auction

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Validate Category
		var category models.Category
		if err := tx.First(&category, input.CategoryID).Error; err != nil {
			return errors.New("category not found")
		}

		// 2. Validate Town (if town scope)
		if input.Scope == models.ScopeTown {
			if input.TownID == nil {
				return errors.New("town_id is required for town scope")
			}
			var town models.Town
			if err := tx.First(&town, *input.TownID).Error; err != nil {
				return errors.New("town not found")
			}
		}

		// 3. Prepare Auction Object
		auction = models.Auction{
			UserID:      input.UserID,
			TownID:      input.TownID,
			CategoryID:  input.CategoryID,
			Title:       input.Title,
			Description: input.Description,
			// Images:      input.Images, // Need to serialize this properly later
			Scope:        input.Scope,
			StartPrice:   input.StartPrice,
			CurrentPrice: input.StartPrice,
			BidCount:     0,
		}

		// 4. Check Slots
		var status models.AuctionStatus
		if input.Scope == models.ScopeNational {
			// National auctions always active (or different logic? Plan said "Much higher or no slot limits")
			// For MVP let's say National is always active for now, or use a huge limit.
			// Let's treat National as having ample slots.
			status = models.StatusActive
			now := time.Now()
			auction.StartTime = &now
			end := now.Add(time.Duration(category.DurationDays) * 24 * time.Hour) // Or national duration
			// Plan said National duration is 30 days
			// Let's stick to category duration for now, or override if national.
			// Implementation plan said "National: 30 days".
			// We should probably check if category is "National" or just use logic.
			// Let's assume there is a 'National' category ID or we override duration.
			// Simple MVP approach: If scope is National, set duration to 30 days.
			if input.Scope == models.ScopeNational {
				end = now.Add(30 * 24 * time.Hour)
			}
			auction.EndTime = &end

		} else {
			// Town Scope - Check Limits
			var activeCount int64
			if err := tx.Model(&models.Auction{}).
				Where("town_id = ? AND category_id = ? AND status = ?", input.TownID, input.CategoryID, models.StatusActive).
				Count(&activeCount).Error; err != nil {
				return err
			}

			if activeCount < int64(category.MaxActiveSlotsPerTown) {
				status = models.StatusActive
				now := time.Now()
				auction.StartTime = &now
				end := now.Add(time.Duration(category.DurationDays) * 24 * time.Hour)
				auction.EndTime = &end
			} else {
				status = models.StatusWaiting
				// Waiting auctions have no start/end time yet
			}
		}

		auction.Status = status

		if err := tx.Create(&auction).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &auction, nil
}
