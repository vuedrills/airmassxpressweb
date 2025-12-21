package models

import (
	"time"

	"gorm.io/gorm"
)

type NotificationType string

const (
	NotificationOutbid       NotificationType = "outbid"
	NotificationWon          NotificationType = "won"
	NotificationEndingSoon   NotificationType = "ending_soon"
	NotificationNewBid       NotificationType = "new_bid"
	NotificationAuctionEnded NotificationType = "auction_ended"
	NotificationWelcome      NotificationType = "welcome"
)

type Notification struct {
	ID        uint             `gorm:"primaryKey" json:"id"`
	UserID    uint             `gorm:"not null;index" json:"user_id"`
	User      User             `json:"-"`
	Type      NotificationType `gorm:"type:varchar(50);not null" json:"type"`
	Title     string           `gorm:"not null" json:"title"`
	Message   string           `gorm:"type:text;not null" json:"message"`
	AuctionID *uint            `json:"auction_id,omitempty"`
	Auction   *Auction         `json:"auction,omitempty"`
	IsRead    bool             `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time        `json:"created_at"`
	UpdatedAt time.Time        `json:"updated_at"`
	DeletedAt gorm.DeletedAt   `gorm:"index" json:"-"`
}
