package models

import (
	"time"

	"github.com/google/uuid"
)

type InventoryItem struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Name        string    `gorm:"not null" json:"name"`
	Category    string    `gorm:"not null;index" json:"category"`
	Capacity    string    `json:"capacity,omitempty"`
	Location    string    `json:"location,omitempty"`
	Photos      []string  `gorm:"type:jsonb;serializer:json" json:"photos,omitempty"`
	IsAvailable bool      `gorm:"default:true" json:"is_available"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"-"`
}
