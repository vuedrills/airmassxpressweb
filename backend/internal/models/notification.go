package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Notification struct {
	ID        uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"userId"`
	Type      string         `gorm:"size:50;not null" json:"type"` // offer_received, offer_accepted, message_received, etc.
	Title     string         `gorm:"size:255;not null" json:"title"`
	Message   string         `gorm:"type:text;not null" json:"message"`
	Data      datatypes.JSON `gorm:"type:jsonb" json:"data"`
	Read      bool           `gorm:"default:false" json:"read"`
	CreatedAt time.Time      `gorm:"autoCreateTime" json:"created_at"`
}

type EscrowTransaction struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TaskID    uuid.UUID `gorm:"type:uuid" json:"task_id"`
	OfferID   uuid.UUID `gorm:"type:uuid" json:"offer_id"`
	PosterID  uuid.UUID `gorm:"type:uuid;not null" json:"poster_id"`
	TaskerID  uuid.UUID `gorm:"type:uuid;not null" json:"tasker_id"`
	Amount    float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	Status    string    `gorm:"default:'held'" json:"status"` // held, released, refunded
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
