package service

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/models"
	"github.com/airmassxpress/auction_system/backend/internal/socket"
	"gorm.io/datatypes"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type AuctionService struct {
	db     *gorm.DB
	hub    *socket.Hub
	notifS *NotificationService
}

func NewAuctionService(db *gorm.DB, hub *socket.Hub, notifS *NotificationService) *AuctionService {
	return &AuctionService{db: db, hub: hub, notifS: notifS}
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
		// 1. Fetch User to validate Home Town Rule
		var user models.User
		if err := tx.First(&user, input.UserID).Error; err != nil {
			return errors.New("user not found")
		}

		// 2. Validate Category
		var category models.Category
		if err := tx.First(&category, input.CategoryID).Error; err != nil {
			return errors.New("category not found")
		}

		// 3. Validate Town & Scope Rules
		if input.Scope == models.ScopeTown {
			if input.TownID == nil {
				return errors.New("town_id is required for town scope")
			}
			// Enforce: User can only create in their home town
			if user.TownID == nil || *user.TownID != *input.TownID {
				return errors.New("you can only create auctions in your home town")
			}

			var town models.Town
			if err := tx.First(&town, *input.TownID).Error; err != nil {
				return errors.New("town not found")
			}
		}

		// 4. Prepare Auction Object
		auction = models.Auction{
			UserID:       input.UserID,
			TownID:       input.TownID,
			CategoryID:   input.CategoryID,
			Title:        input.Title,
			Description:  input.Description,
			Scope:        input.Scope,
			StartPrice:   input.StartPrice,
			CurrentPrice: input.StartPrice,
			BidCount:     0,
		}

		if len(input.Images) > 0 {
			imgsJSON, err := json.Marshal(input.Images)
			if err == nil {
				auction.Images = datatypes.JSON(imgsJSON)
			}
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

	// Broadcast Creation
	s.hub.BroadcastEvent("AUCTION_CREATED", auction)

	return &auction, nil
}

func (s *AuctionService) PlaceBid(auctionID, userID uint, amount float64) (*models.Auction, error) {
	var auction models.Auction

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// 1. Lock Auction Row for Update
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).First(&auction, auctionID).Error; err != nil {
			return errors.New("auction not found")
		}

		// 2. Validation
		if auction.Status != models.StatusActive {
			return errors.New("auction is not active")
		}
		if amount <= auction.CurrentPrice {
			return errors.New("bid must be higher than current price")
		}
		// TODO: Minimum increment check (e.g. +$1 or +5%)

		// 3. Anti-Sniping
		now := time.Now()
		if auction.EndTime != nil && auction.EndTime.Sub(now) < 5*time.Minute {
			newEnd := auction.EndTime.Add(5 * time.Minute)
			auction.EndTime = &newEnd
		}

		// 4. Update Auction
		auction.CurrentPrice = amount
		auction.BidCount++
		if err := tx.Save(&auction).Error; err != nil {
			return err
		}

		// 5. Create Bid Record
		bid := models.Bid{
			AuctionID: auctionID,
			UserID:    userID,
			Amount:    amount,
			CreatedAt: now,
		}
		if err := tx.Create(&bid).Error; err != nil {
			return err
		}

		// 6. Notifications
		// Notify owner
		if auction.UserID != userID {
			go s.notifS.Notify(auction.UserID, models.NotificationNewBid, "New Bid!", "Someone placed a bid on your item.", &auction.ID)
		}

		// Notify previous high bidder (if any)
		var prevBid models.Bid
		if err := tx.Where("auction_id = ? AND user_id != ?", auctionID, userID).Order("amount desc").First(&prevBid).Error; err == nil {
			go s.notifS.Notify(prevBid.UserID, models.NotificationOutbid, "Outbid!", "You have been outbid on an item.", &auction.ID)
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// 6. Broadcast Event
	payload := map[string]interface{}{
		"auction_id":    auction.ID,
		"current_price": auction.CurrentPrice,
		"bid_count":     auction.BidCount,
		"end_time":      auction.EndTime,
		"last_bidder":   userID, // Maybe hide this or only show username if preloaded
	}
	s.hub.BroadcastEvent("BID_PLACED", payload)

	return &auction, nil
}

// GetUserAuctions returns auctions created by the user
func (s *AuctionService) GetUserAuctions(userID uint) ([]models.Auction, error) {
	var auctions []models.Auction
	if err := s.db.Preload("Category").Preload("Town").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&auctions).Error; err != nil {
		return nil, err
	}
	return auctions, nil
}

// GetUserBids returns bids placed by the user, preloading the related Auction
func (s *AuctionService) GetUserBids(userID uint) ([]models.Bid, error) {
	var bids []models.Bid
	if err := s.db.Preload("Auction").Preload("Auction.Category").Preload("Auction.Town").
		Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&bids).Error; err != nil {
		return nil, err
	}
	return bids, nil
}
