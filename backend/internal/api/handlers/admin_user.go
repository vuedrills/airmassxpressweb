package handlers

import (
	"net/http"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AdminVerifyUser verifies a user account (dev/testing only)
func (h *UserHandler) AdminVerifyUser(c *gin.Context) {
	var req struct {
		UserID string `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Update user verification status
	result := h.db.Model(&models.User{}).Where("id = ?", userID).Update("is_verified", true)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify user"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User verified successfully"})
}
