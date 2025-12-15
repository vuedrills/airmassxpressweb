package middleware

import (
	"time"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// UpdateActivity updates the user's last_activity_at timestamp
func UpdateActivity(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// Get user ID from context (set by AuthMiddleware)
		userID, exists := c.Get("user_id")
		if !exists {
			return
		}

		// Update asynchronously to avoid blocking response
		go func(uid uuid.UUID) {
			// Using Map to update only the specific field, bypassing hooks if needed or just simple update
			db.Model(&models.User{}).Where("id = ?", uid).UpdateColumn("last_activity_at", time.Now())
		}(userID.(uuid.UUID))
	}
}
