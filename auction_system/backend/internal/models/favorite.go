package models

import (
	"time"

	"gorm.io/gorm"
)

type Favorite struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"not null;index:idx_user_auction,unique" json:"user_id"`
	AuctionID uint           `gorm:"not null;index:idx_user_auction,unique" json:"auction_id"`
	User      User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Auction   Auction        `gorm:"foreignKey:AuctionID" json:"auction,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
