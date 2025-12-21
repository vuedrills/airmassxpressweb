package models

import (
	"time"

	"gorm.io/gorm"
)

type ReportType string

const (
	ReportAuction ReportType = "auction"
	ReportUser    ReportType = "user"
	ReportComment ReportType = "comment"
)

type ReportStatus string

const (
	ReportPending   ReportStatus = "pending"
	ReportResolved  ReportStatus = "resolved"
	ReportDismissed ReportStatus = "dismissed"
)

type Report struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ReporterID  uint           `gorm:"not null;index" json:"reporter_id"`
	Reporter    User           `json:"reporter,omitempty"`
	SubjectType ReportType     `gorm:"type:varchar(20);not null" json:"subject_type"`
	SubjectID   uint           `gorm:"not null;index" json:"subject_id"`
	Reason      string         `gorm:"type:varchar(100);not null" json:"reason"`
	Description string         `gorm:"type:text" json:"description"`
	Status      ReportStatus   `gorm:"type:varchar(20);default:'pending'" json:"status"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}
