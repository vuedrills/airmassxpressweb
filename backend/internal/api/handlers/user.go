package handlers

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserHandler struct {
	db *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{db: db}
}

func (h *UserHandler) GetUser(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Preload all necessary relationships
	var user models.User
	if err := h.db.
		Preload("TaskerProfile").
		Preload("ReviewsReceived", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at DESC")
		}).
		Preload("ReviewsReceived.LinkReviewer").
		Preload("ReviewsReceived.LinkTask").
		First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
	log.Printf("DEBUG: Fetched user %s, Reviews: %d, Tasker: %v", user.ID, len(user.ReviewsReceived), user.IsTasker)
}

func (h *UserHandler) UpdateUser(c *gin.Context) {
	userID, _ := c.Get("user_id")
	paramUserID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Verify user is updating their own profile
	if userID.(uuid.UUID) != paramUserID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Prevent updating sensitive fields
	delete(updates, "id")
	delete(updates, "email")
	delete(updates, "password_hash")
	delete(updates, "rating")
	delete(updates, "review_count")
	delete(updates, "tasks_completed")

	var user models.User
	if err := h.db.Model(&user).Where("id = ?", paramUserID).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	h.db.First(&user, "id = ?", paramUserID)
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) UploadAvatar(c *gin.Context) {
	// TODO: Implement avatar upload
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Avatar upload not yet implemented"})
}

type UpdateFCMTokenRequest struct {
	Token  string `json:"token" binding:"required"`
	Device string `json:"device"`
}

func (h *UserHandler) UpdateFCMToken(c *gin.Context) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID, ok := userIDVal.(uuid.UUID)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("User ID type mismatch: expected uuid.UUID, got %T", userIDVal)})
		return
	}

	var req UpdateFCMTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Upsert token
	token := models.FCMToken{
		UserID:   userID,
		Token:    req.Token,
		Device:   req.Device,
		LastUsed: time.Now(),
	}

	// Use Clauses to handle upsert on conflict
	if err := h.db.Where(models.FCMToken{Token: req.Token}).
		Assign(models.FCMToken{LastUsed: time.Now(), UserID: userID, Device: req.Device}).
		FirstOrCreate(&token).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update FCM token: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "success"})
}

// GetAllUsers returns all users for admin dashboard
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	var users []models.User
	// Preload TaskerProfile to show status
	if err := h.db.Preload("TaskerProfile").Order("created_at desc").Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, users)
}
