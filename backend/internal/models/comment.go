package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Comment struct {
	ID        uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	TaskID    uuid.UUID      `gorm:"type:uuid;not null;index" json:"task_id"`
	UserID    uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	Content   string         `gorm:"type:text;not null" json:"content"`
	ParentID  *uuid.UUID     `gorm:"type:uuid;index" json:"parent_id,omitempty"` // For nesting
	Images    []string       `gorm:"type:jsonb;serializer:json" json:"images,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User     *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Task     *Task      `gorm:"foreignKey:TaskID" json:"-"`
	Parent   *Comment   `gorm:"foreignKey:ParentID" json:"-"`
	Children []*Comment `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}
