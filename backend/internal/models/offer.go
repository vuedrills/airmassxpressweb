package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Offer struct {
	ID                uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TaskID            uuid.UUID      `gorm:"type:uuid;not null;index" json:"task_id"`
	TaskerID          uuid.UUID      `gorm:"type:uuid;not null;index" json:"tasker_id"`
	Amount            float64        `gorm:"type:decimal(10,2);not null" json:"amount"`
	Description       string         `gorm:"type:text;not null" json:"description"`
	EstimatedDuration string         `json:"estimated_duration,omitempty"`
	Availability      string         `json:"availability,omitempty"`
	Status            string         `gorm:"default:'pending'" json:"status"` // pending, accepted, rejected, withdrawn
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`

	// V2 Equipment Quote Fields
	QuoteType        string     `gorm:"type:varchar(20)" json:"quote_type,omitempty"` // structured, flexible
	RateType         string     `gorm:"type:varchar(20)" json:"rate_type,omitempty"`  // hourly, daily, weekly
	BaseRate         *float64   `gorm:"type:decimal(10,2)" json:"base_rate,omitempty"`
	DeliveryFee      *float64   `gorm:"type:decimal(10,2)" json:"delivery_fee,omitempty"`
	OperatorFee      *float64   `gorm:"type:decimal(10,2)" json:"operator_fee,omitempty"`
	IncludesOperator bool       `gorm:"default:false" json:"includes_operator"`
	InventoryID      *uuid.UUID `gorm:"type:uuid" json:"inventory_id,omitempty"`

	// Relationships
	Task      *Task          `gorm:"foreignKey:TaskID" json:"task,omitempty"`
	Tasker    *User          `gorm:"foreignKey:TaskerID" json:"tasker,omitempty"`
	Replies   []OfferReply   `gorm:"foreignKey:OfferID" json:"replies,omitempty"`
	Inventory *InventoryItem `gorm:"foreignKey:InventoryID" json:"inventory,omitempty"`
}

type OfferReply struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OfferID   uuid.UUID `gorm:"type:uuid;not null" json:"offer_id"`
	AuthorID  uuid.UUID `gorm:"type:uuid;not null" json:"author_id"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	Author *User `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}

func (o *Offer) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}
