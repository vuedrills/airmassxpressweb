package models

import (
	"time"
)

type Town struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"uniqueIndex;not null" json:"name"`
	Slug      string    `gorm:"uniqueIndex;not null" json:"slug"`
	Active    bool      `gorm:"default:true" json:"active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Category struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	Name                  string    `gorm:"uniqueIndex;not null" json:"name"`
	Slug                  string    `gorm:"uniqueIndex;not null" json:"slug"`
	DurationDays          int       `gorm:"not null" json:"duration_days"`
	MaxActiveSlotsPerTown int       `gorm:"not null" json:"max_active_slots_per_town"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}
