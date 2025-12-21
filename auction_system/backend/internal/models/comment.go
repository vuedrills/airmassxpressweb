package models

import (
	"time"

	"gorm.io/gorm"
)

type Comment struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	AuctionID uint           `gorm:"not null;index" json:"auction_id"`
	Auction   Auction        `json:"-"` // Avoid circular dependency in JSON or just omit
	UserID    uint           `gorm:"not null" json:"user_id"`
	User      User           `json:"user"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
