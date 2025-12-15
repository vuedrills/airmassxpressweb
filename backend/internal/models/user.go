package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID                   uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email                string    `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash         string    `gorm:"not null" json:"-"`
	Name                 string    `gorm:"not null" json:"name"`
	Phone                string    `json:"phone,omitempty"`
	AvatarURL            string    `json:"avatar_url,omitempty"`
	Bio                  string    `json:"bio,omitempty"`
	Location             string    `json:"location,omitempty"`
	IsVerified           bool      `gorm:"default:false" json:"is_verified"`
	Rating               float64   `gorm:"type:decimal(3,2);default:0" json:"rating"`
	ReviewCount          int       `gorm:"default:0" json:"review_count"`
	TasksCompleted       int       `gorm:"default:0" json:"tasks_completed"`
	TasksPostedCompleted int       `gorm:"default:0" json:"tasks_posted_completed"`
	// Additional Stats for Badges
	TasksCompletedOnTime int `gorm:"default:0" json:"tasks_completed_on_time"`

	// Badges
	BadgeTopRated      bool `gorm:"default:false" json:"badge_top_rated"`
	BadgeOnTime        bool `gorm:"default:false" json:"badge_on_time"`
	BadgeRehired       bool `gorm:"default:false" json:"badge_rehired"`
	BadgeCommunicator  bool `gorm:"default:false" json:"badge_communicator"`
	BadgeQuickResponse bool `gorm:"default:false" json:"badge_quick_response"`

	MemberSince    time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"member_since"`
	LastActivityAt time.Time      `json:"last_activity_at"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	TasksPosted     []Task   `gorm:"foreignKey:PosterID" json:"-"`
	OffersGiven     []Offer  `gorm:"foreignKey:TaskerID" json:"-"`
	ReviewsReceived []Review `gorm:"foreignKey:RevieweeID" json:"reviews_received"`

	// Tasker Fields
	IsTasker      bool           `gorm:"default:false" json:"is_tasker"`
	TaskerProfile *TaskerProfile `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"tasker_profile,omitempty"`

	// Notification Tokens
	FCMTokens []FCMToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE;" json:"-"`
}

type Qualification struct {
	Name   string `json:"name"`
	Issuer string `json:"issuer"`
	Date   string `json:"date"` // YYYY-MM-DD
	URL    string `json:"url"`
}

type TaskerProfile struct {
	UserID             uuid.UUID `gorm:"type:uuid;primary_key" json:"user_id"`
	Status             string    `gorm:"default:'not_started'" json:"status"` // not_started, in_progress, pending_review, approved
	OnboardingStep     int       `gorm:"default:1" json:"onboarding_step"`
	Bio                string    `json:"bio,omitempty"`
	ProfilePictureURL  string    `json:"profile_picture_url,omitempty"`
	SelfieURL          string    `json:"selfie_url,omitempty"`
	EcocashNumber      string    `json:"ecocash_number,omitempty"`
	AddressDocumentURL string    `json:"address_document_url,omitempty"`

	// JSONB Columns
	IDDocumentURLs []string        `gorm:"type:jsonb;serializer:json" json:"id_document_urls,omitempty"`
	ProfessionIDs  []string        `gorm:"type:jsonb;serializer:json" json:"profession_ids,omitempty"`
	PortfolioURLs  []string        `gorm:"type:jsonb;serializer:json" json:"portfolio_urls,omitempty"`
	Qualifications []Qualification `gorm:"type:jsonb;serializer:json" json:"qualifications,omitempty"`
	Availability   Availability    `gorm:"type:jsonb;serializer:json" json:"availability,omitempty"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Availability struct {
	Monday    []string `json:"monday"` // e.g. ["09:00-17:00"]
	Tuesday   []string `json:"tuesday"`
	Wednesday []string `json:"wednesday"`
	Thursday  []string `json:"thursday"`
	Friday    []string `json:"friday"`
	Saturday  []string `json:"saturday"`
	Sunday    []string `json:"sunday"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	if u.MemberSince.IsZero() {
		u.MemberSince = time.Now()
	}
	return nil
}
