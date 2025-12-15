package models

import (
	"time"
)

type Profession struct {
	ID         string    `gorm:"primary_key" json:"id"` // Using string ID like "plumber"
	Name       string    `gorm:"not null" json:"name"`
	CategoryID string    `gorm:"not null" json:"category_id"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}
