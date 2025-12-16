package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
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

	// V2 Fields
	CapacityID      *uuid.UUID       `gorm:"type:uuid" json:"capacity_id,omitempty"`
	Lat             *float64         `json:"lat,omitempty"`
	Lng             *float64         `json:"lng,omitempty"`
	WithOperator    bool             `gorm:"default:false" json:"with_operator"`
	HourlyRate      *decimal.Decimal `gorm:"type:decimal(10,2)" json:"hourly_rate,omitempty"`
	DailyRate       *decimal.Decimal `gorm:"type:decimal(10,2)" json:"daily_rate,omitempty"`
	WeeklyRate      *decimal.Decimal `gorm:"type:decimal(10,2)" json:"weekly_rate,omitempty"`
	DeliveryFee     *decimal.Decimal `gorm:"type:decimal(10,2)" json:"delivery_fee,omitempty"`
	OperatorBundled bool             `gorm:"default:true" json:"operator_bundled"`
	OperatorFee     *decimal.Decimal `gorm:"type:decimal(10,2)" json:"operator_fee,omitempty"`

	// Relationships
	User             *User             `gorm:"foreignKey:UserID" json:"-"`
	EquipmentCapacity *EquipmentCapacity `gorm:"foreignKey:CapacityID" json:"equipment_capacity,omitempty"`
}

// EquipmentCapacity represents a capacity tier for an equipment type
type EquipmentCapacity struct {
	ID            uuid.UUID        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	EquipmentType string           `gorm:"not null;index" json:"equipment_type"`
	CapacityCode  string           `gorm:"not null" json:"capacity_code"`
	DisplayName   string           `gorm:"not null" json:"display_name"`
	MinWeightTons *decimal.Decimal `gorm:"type:decimal(10,2)" json:"min_weight_tons,omitempty"`
	MaxWeightTons *decimal.Decimal `gorm:"type:decimal(10,2)" json:"max_weight_tons,omitempty"`
	SortOrder     int              `gorm:"default:0" json:"sort_order"`
	CreatedAt     time.Time        `json:"created_at"`
}
