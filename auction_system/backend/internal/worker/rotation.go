package worker

import (
	"log"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/models"
	"gorm.io/gorm"
)

type RotationWorker struct {
	db *gorm.DB
}

func NewRotationWorker(db *gorm.DB) *RotationWorker {
	return &RotationWorker{db: db}
}

func (w *RotationWorker) Start(interval time.Duration) {
	ticker := time.NewTicker(interval)
	go func() {
		for range ticker.C {
			w.RotateAuctions()
		}
	}()
}

func (w *RotationWorker) RotateAuctions() {
	// Transaction to ensure consistency
	err := w.db.Transaction(func(tx *gorm.DB) error {
		// 1. Expire Active Auctions that have ended
		result := tx.Model(&models.Auction{}).
			Where("status = ? AND end_time <= ?", models.StatusActive, time.Now()).
			Update("status", models.StatusEnded)

		if result.Error != nil {
			return result.Error
		}

		if result.RowsAffected > 0 {
			log.Printf("Expired %d auctions", result.RowsAffected)
		}

		// 2. Promote Waiting Auctions
		// Find Category+Town combinations with available slots
		// This is tricky in a single query.
		// Iterative approach:
		// Find all waiting auctions, grouped by Town/Category?
		// Better: Find ended auctions' context (Town+Category) and check if we can promote there.
		// Or just naive approach: For every waiting auction, check if it can go active.
		// For MVP: Let's find unique (TownID, CategoryID) from the waiting list.

		type ScopeKey struct {
			TownID     *uint
			CategoryID uint
		}

		// This part needs optimization for high scale, but okay for MVP.
		// Let's just create a list of candidates.
		var waitingAuctions []models.Auction
		if err := tx.Where("status = ?", models.StatusWaiting).Order("created_at asc").Find(&waitingAuctions).Error; err != nil {
			return err
		}

		for _, auction := range waitingAuctions {
			// Skip if already checked this bucket in this cycle (optimization needed: maybe we can promote multiple?)
			// keeping it simple: try to promote.

			// Re-check slot limit
			var category models.Category
			if err := tx.First(&category, auction.CategoryID).Error; err != nil {
				continue
			}

			// If town scope
			if auction.Scope == models.ScopeTown && auction.TownID != nil {
				var activeCount int64
				tx.Model(&models.Auction{}).
					Where("town_id = ? AND category_id = ? AND status = ?", auction.TownID, auction.CategoryID, models.StatusActive).
					Count(&activeCount)

				if activeCount < int64(category.MaxActiveSlotsPerTown) {
					// Promote!
					now := time.Now()
					end := now.Add(time.Duration(category.DurationDays) * 24 * time.Hour)

					auction.Status = models.StatusActive
					auction.StartTime = &now
					auction.EndTime = &end

					if err := tx.Save(&auction).Error; err != nil {
						log.Printf("Failed to promote auction %d: %v", auction.ID, err)
					} else {
						log.Printf("Promoted auction %d to active", auction.ID)
						// Notify user here (stub)
					}
				}
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("Rotation error: %v", err)
	}
}
