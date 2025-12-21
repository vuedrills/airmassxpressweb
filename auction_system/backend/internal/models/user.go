package models

import (
	"time"

	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

type User struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	Username   string         `gorm:"uniqueIndex;not null" json:"username"`
	Email      string         `gorm:"uniqueIndex;not null" json:"email"`
	Password   string         `gorm:"not null" json:"-"` // Stored as hash, not returned in JSON
	TownID     *uint          `json:"town_id"`           // User belongs to a town
	Town       *Town          `json:"town,omitempty"`
	Role       UserRole       `gorm:"type:varchar(20);default:'user'" json:"role"`
	IsVerified bool           `gorm:"default:false" json:"is_verified"` // Verified seller badge
	AvatarURL  string         `json:"avatar_url,omitempty"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Social Graph
	Followers []*User `gorm:"many2many:user_followers;joinForeignKey:following_id;joinReferences:follower_id" json:"-"`
	Following []*User `gorm:"many2many:user_followers;joinForeignKey:follower_id;joinReferences:following_id" json:"-"`

	Favorites []Favorite `json:"favorites,omitempty"`

	ReviewsReceived []Review `gorm:"foreignKey:RevieweeID" json:"-"`
	ReviewsGiven    []Review `gorm:"foreignKey:ReviewerID" json:"-"`
}
