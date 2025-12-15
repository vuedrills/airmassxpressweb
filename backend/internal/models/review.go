package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Review struct {
	ID                    uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TaskID                uuid.UUID  `gorm:"type:uuid;not null" json:"task_id"` // One review per task
	ReviewerID            uuid.UUID  `gorm:"type:uuid;not null" json:"reviewer_id"`
	RevieweeID            uuid.UUID  `gorm:"type:uuid;not null" json:"reviewee_id"`
	Rating                float64    `gorm:"type:decimal(3,2);not null" json:"rating"` // Composite score
	RatingCommunication   int        `gorm:"not null" json:"rating_communication"`     // 1-5
	RatingTime            int        `gorm:"not null" json:"rating_time"`              // 1-5
	RatingProfessionalism int        `gorm:"not null" json:"rating_professionalism"`   // 1-5
	Comment               string     `gorm:"type:text" json:"comment"`
	Reply                 string     `gorm:"type:text" json:"reply,omitempty"` // Tasker's reply
	ReplyCreatedAt        *time.Time `json:"reply_created_at,omitempty"`
	Weight                float64    `gorm:"type:decimal(5,4);default:1.0" json:"weight"` // Calculated weight based on logic

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	LinkTask     *Task `gorm:"foreignKey:TaskID" json:"task,omitempty"`
	LinkReviewer *User `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`
	LinkReviewee *User `gorm:"foreignKey:RevieweeID" json:"reviewee,omitempty"`
}

func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ID == uuid.Nil {
		r.ID = uuid.New()
	}
	return nil
}
