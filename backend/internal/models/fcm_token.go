package models

import (
	"time"

	"github.com/google/uuid"
)

type FCMToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	Token     string    `gorm:"uniqueIndex" json:"token"`
	Device    string    `json:"device"` // e.g., "web", "android", "ios"
	LastUsed  time.Time `json:"last_used"`
	CreatedAt time.Time `json:"created_at"`
}
