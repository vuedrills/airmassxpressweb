package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Conversation struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TaskID    *uuid.UUID     `gorm:"type:uuid;index" json:"task_id,omitempty"` // Optional: Link to task
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Task         *Task     `gorm:"foreignKey:TaskID" json:"task,omitempty"`
	Participants []User    `gorm:"many2many:conversation_participants;" json:"participants,omitempty"`
	Messages     []Message `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
}

type ConversationParticipant struct {
	ConversationID uuid.UUID `gorm:"type:uuid;primaryKey" json:"conversation_id"`
	UserID         uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	CreatedAt      time.Time `json:"created_at"`
}

type Message struct {
	ID             uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ConversationID uuid.UUID `gorm:"type:uuid;not null;index" json:"conversation_id"`
	SenderID       uuid.UUID `gorm:"type:uuid;not null" json:"sender_id"`
	Content        string    `gorm:"type:text;not null" json:"content"`
	Read           bool      `gorm:"default:false" json:"read"`
	CreatedAt      time.Time `json:"created_at"`

	// Relationships
	Sender *User `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
}

func (c *Conversation) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}
