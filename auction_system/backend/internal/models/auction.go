package models

import (
	"time"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type AuctionStatus string
type AuctionScope string

const (
	StatusWaiting   AuctionStatus = "waiting"
	StatusActive    AuctionStatus = "active"
	StatusEnded     AuctionStatus = "ended"
	StatusCompleted AuctionStatus = "completed"

	ScopeTown     AuctionScope = "town"
	ScopeNational AuctionScope = "national"
)

type Auction struct {
	ID         uint     `gorm:"primaryKey" json:"id"`
	UserID     uint     `gorm:"not null" json:"user_id"`
	User       User     `json:"user"`
	TownID     *uint    `json:"town_id"` // Nullable if scope is national (though usually national might still track origin, but scope defines visibility)
	Town       *Town    `json:"town,omitempty"`
	CategoryID uint     `gorm:"not null" json:"category_id"`
	Category   Category `json:"category"`

	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Images      datatypes.JSON `json:"images"` // Expecting JSON array of strings

	Status AuctionStatus `gorm:"type:varchar(20);default:'waiting';index" json:"status"`
	Scope  AuctionScope  `gorm:"type:varchar(20);not null" json:"scope"`

	StartTime *time.Time `json:"start_time"`
	EndTime   *time.Time `json:"end_time"`

	StartPrice   float64 `gorm:"not null" json:"start_price"`
	CurrentPrice float64 `gorm:"not null" json:"current_price"`
	BidCount     int     `gorm:"default:0" json:"bid_count"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type Bid struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AuctionID uint      `gorm:"not null;index" json:"auction_id"`
	Auction   Auction   `json:"auction"` // Add relation
	UserID    uint      `gorm:"not null" json:"user_id"`
	User      User      `json:"user"`
	Amount    float64   `gorm:"not null" json:"amount"`
	CreatedAt time.Time `json:"created_at"`
}
