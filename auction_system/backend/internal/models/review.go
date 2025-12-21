package models

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	ReviewerID uint  `json:"reviewer_id"`
	Reviewer   *User `json:"reviewer,omitempty"`

	RevieweeID uint  `json:"reviewee_id"`
	Reviewee   *User `json:"reviewee,omitempty"`

	AuctionID *uint    `json:"auction_id,omitempty"`
	Auction   *Auction `json:"auction,omitempty"`

	Rating  int    `json:"rating"` // 1-5
	Content string `json:"content"`
}
