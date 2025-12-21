package models

import (
	"time"
)

// Conversation represents a chat thread between two users about an auction
type Conversation struct {
	ID            uint       `gorm:"primaryKey" json:"id"`
	AuctionID     uint       `gorm:"index" json:"auction_id"`
	Auction       Auction    `json:"auction,omitempty"`
	BuyerID       uint       `gorm:"not null" json:"buyer_id"`
	Buyer         User       `gorm:"foreignKey:BuyerID" json:"buyer,omitempty"`
	SellerID      uint       `gorm:"not null" json:"seller_id"`
	Seller        User       `gorm:"foreignKey:SellerID" json:"seller,omitempty"`
	LastMessage   string     `json:"last_message,omitempty"`
	LastMessageAt *time.Time `json:"last_message_at,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

// Message represents a single chat message
type Message struct {
	ID             uint         `gorm:"primaryKey" json:"id"`
	ConversationID uint         `gorm:"not null;index" json:"conversation_id"`
	Conversation   Conversation `json:"-"`
	SenderID       uint         `gorm:"not null" json:"sender_id"`
	Sender         User         `json:"sender,omitempty"`
	Content        string       `gorm:"type:text;not null" json:"content"`
	ImageURL       string       `json:"image_url,omitempty"`
	IsRead         bool         `gorm:"default:false" json:"is_read"`
	CreatedAt      time.Time    `json:"created_at"`
}
