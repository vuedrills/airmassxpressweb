package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Task struct {
	ID              uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	PosterID        uuid.UUID      `gorm:"type:uuid;not null" json:"poster_id"`
	Title           string         `gorm:"not null" json:"title"`
	Description     string         `gorm:"type:text;not null" json:"description"`
	Category        string         `gorm:"not null;index" json:"category"`
	TaskType        string         `gorm:"default:'service';index" json:"task_type"` // service, equipment
	Budget          float64        `gorm:"type:decimal(10,2);not null" json:"budget"`
	Location        string         `gorm:"not null" json:"location"`
	Lat             *float64       `gorm:"type:decimal(10,8)" json:"lat,omitempty"`
	Lng             *float64       `gorm:"type:decimal(11,8)" json:"lng,omitempty"`
	DateType        string         `gorm:"type:varchar(20)" json:"date_type,omitempty"` // on_date, before_date, flexible
	Date            *time.Time     `json:"date,omitempty"`
	TimeOfDay       string         `json:"time_of_day,omitempty"`
	Status          string         `gorm:"default:'open';index" json:"status"` // open, assigned, in_progress, completed, cancelled
	AcceptedOfferID *uuid.UUID     `gorm:"type:uuid" json:"accepted_offer_id,omitempty"`
	ConversationID  *uuid.UUID     `gorm:"type:uuid" json:"conversation_id,omitempty"`
	OfferCount      int            `gorm:"default:0" json:"offer_count"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Poster        *User            `gorm:"foreignKey:PosterID" json:"poster,omitempty"`
	Attachments   []TaskAttachment `gorm:"foreignKey:TaskID" json:"attachments,omitempty"`
	Offers        []Offer          `gorm:"foreignKey:TaskID" json:"offers,omitempty"`
	AcceptedOffer *Offer           `gorm:"foreignKey:AcceptedOfferID" json:"accepted_offer,omitempty"`
}

type TaskAttachment struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TaskID     uuid.UUID `gorm:"type:uuid;not null" json:"task_id"`
	URL        string    `gorm:"not null" json:"url"`
	Type       string    `gorm:"not null;default:'image'" json:"type"`
	Name       string    `json:"name"`
	OrderIndex int       `gorm:"default:0" json:"order_index"`
	CreatedAt  time.Time `json:"created_at"`
}

func (t *Task) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}
