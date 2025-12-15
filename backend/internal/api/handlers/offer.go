package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/airmassxpress/backend/internal/config"
	"github.com/airmassxpress/backend/internal/models"
	"github.com/airmassxpress/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type OfferHandler struct {
	cfg *config.Config
	db  *gorm.DB
	fcm *services.FCMService
}

func NewOfferHandler(cfg *config.Config, db *gorm.DB, fcm *services.FCMService) *OfferHandler {
	return &OfferHandler{cfg: cfg, db: db, fcm: fcm}
}

type CreateOfferRequest struct {
	TaskID            string  `json:"task_id" binding:"required"`
	Amount            float64 `json:"amount" binding:"required,gt=0"`
	Description       string  `json:"description" binding:"required"`
	EstimatedDuration string  `json:"estimated_duration"`
	Availability      string  `json:"availability"`
}

func (h *OfferHandler) CreateOffer(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateOfferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify user is an approved tasker
	var user models.User
	if err := h.db.Preload("TaskerProfile").First(&user, "id = ?", userID.(uuid.UUID)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user profile"})
		return
	}

	// For development/testing, we might want to allow this restriction to be bypassed or check carefully
	// User policy: "User cannot make offers unless: tasker_profile.status === approved"
	if !user.IsTasker || user.TaskerProfile == nil || user.TaskerProfile.Status != "approved" {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "Only approved taskers can make offers. Please complete your tasker profile.",
			"code":  "TASKER_PROFILE_REQUIRED",
		})
		return
	}

	taskID, err := uuid.Parse(req.TaskID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	// Verify task exists and is open
	var task models.Task
	if err := h.db.First(&task, "id = ?", taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	if task.Status != "open" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task is not open for offers"})
		return
	}

	// Check Inventory for Equipment Tasks
	if task.TaskType == "equipment" {
		var itemCount int64
		// Check if user has ANY item in inventory that matches the task category
		if err := h.db.Model(&models.InventoryItem{}).
			Where("user_id = ? AND category = ?", userID, task.Category).
			Count(&itemCount).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check inventory"})
			return
		}

		if itemCount == 0 {
			c.JSON(http.StatusForbidden, gin.H{
				"error":    "You must have registered equipment in this category to bid.",
				"code":     "INVENTORY_REQUIRED",
				"category": task.Category,
			})
			return
		}
	}

	offer := models.Offer{
		TaskID:            taskID,
		TaskerID:          userID.(uuid.UUID),
		Amount:            req.Amount,
		Description:       req.Description,
		EstimatedDuration: req.EstimatedDuration,
		Availability:      req.Availability,
		Status:            "pending",
	}

	if err := h.db.Create(&offer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create offer"})
		return
	}

	// Increment offer count
	h.db.Model(&task).Update("offer_count", gorm.Expr("offer_count + ?", 1))

	// Create notification for task poster
	dataJSON, _ := json.Marshal(map[string]interface{}{"task_id": task.ID.String(), "offer_id": offer.ID.String()})
	posterNotification := models.Notification{
		UserID:  task.PosterID,
		Type:    "new_offer",
		Title:   "New Offer Received",
		Message: fmt.Sprintf("You received a new offer of $%.2f for %s", req.Amount, task.Title),
		Data:    dataJSON,
	}
	h.db.Create(&posterNotification)
	if posterNotification.ID == uuid.Nil {
		fmt.Printf("ERROR: Failed to create poster notification for offer creation. DB Error: %v\n", h.db.Error)
	} else {
		fmt.Printf("SUCCESS: Created poster notification %s for new offer\n", posterNotification.ID)
		// Broadcast to WebSocket
		if h.fcm != nil {
			h.fcm.BroadcastNotification(&posterNotification)
		}
	}

	// Send push notification to task poster
	if h.fcm != nil {
		go func() {
			err := h.fcm.SendNotification(
				task.PosterID,
				"New Offer Received",
				fmt.Sprintf("You received a new offer of $%.2f for %s", req.Amount, task.Title),
				map[string]string{
					"type":     "new_offer",
					"task_id":  task.ID.String(),
					"offer_id": offer.ID.String(),
				},
			)
			if err != nil {
				fmt.Printf("Failed to send push notification to poster: %v\n", err)
			}
		}()
	}

	// Reload with relationships
	h.db.Preload("Tasker").First(&offer, "id = ?", offer.ID)

	c.JSON(http.StatusCreated, offer)
}

func (h *OfferHandler) GetOffer(c *gin.Context) {
	offerID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offer ID"})
		return
	}

	var offer models.Offer
	if err := h.db.Preload("Tasker").Preload("Task").Preload("Replies.Author").First(&offer, "id = ?", offerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Offer not found"})
		return
	}

	c.JSON(http.StatusOK, offer)
}

func (h *OfferHandler) UpdateOffer(c *gin.Context) {
	userID, _ := c.Get("user_id")
	offerID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offer ID"})
		return
	}

	var offer models.Offer
	if err := h.db.First(&offer, "id = ?", offerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Offer not found"})
		return
	}

	// Verify ownership
	if offer.TaskerID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&offer).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update offer"})
		return
	}

	c.JSON(http.StatusOK, offer)
}

func (h *OfferHandler) WithdrawOffer(c *gin.Context) {
	userID, _ := c.Get("user_id")
	offerID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offer ID"})
		return
	}

	var offer models.Offer
	if err := h.db.First(&offer, "id = ?", offerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Offer not found"})
		return
	}

	// Verify ownership
	if offer.TaskerID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	offer.Status = "withdrawn"
	if err := h.db.Save(&offer).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to withdraw offer"})
		return
	}

	c.JSON(http.StatusOK, offer)
}

func (h *OfferHandler) AcceptOffer(c *gin.Context) {
	userID, _ := c.Get("user_id")
	offerID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offer ID"})
		return
	}

	var offer models.Offer
	if err := h.db.Preload("Task").First(&offer, "id = ?", offerID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Offer not found"})
		return
	}

	// Verify task ownership
	if offer.Task.PosterID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only task poster can accept offers"})
		return
	}

	// Update offer status
	offer.Status = "accepted"
	h.db.Save(&offer)

	// Create conversation between poster and tasker
	conversation := models.Conversation{
		TaskID: &offer.TaskID, // Link conversation to task
	}
	if err := h.db.Create(&conversation).Error; err != nil {
		// Log error but continue
		fmt.Printf("Failed to create conversation: %v\n", err)
	} else {
		// Add participants
		participants := []models.ConversationParticipant{
			{ConversationID: conversation.ID, UserID: userID.(uuid.UUID)},
			{ConversationID: conversation.ID, UserID: offer.TaskerID},
		}
		h.db.Create(&participants)
	}

	// Update task status and link accepted offer and conversation
	updates := map[string]interface{}{
		"status":            "assigned",
		"accepted_offer_id": offer.ID,
		"conversation_id":   conversation.ID,
	}
	h.db.Model(&offer.Task).Updates(updates)

	// Create escrow transaction (Invoice Placeholder)
	escrow := models.EscrowTransaction{
		TaskID:   offer.TaskID,
		OfferID:  offer.ID,
		PosterID: userID.(uuid.UUID),
		TaskerID: offer.TaskerID,
		Amount:   offer.Amount,
		Status:   "held", // Initial status
	}
	h.db.Create(&escrow)

	// Create notification for tasker
	taskerDataJSON, _ := json.Marshal(map[string]interface{}{"task_id": offer.TaskID.String(), "conversation_id": conversation.ID.String()})
	notification := models.Notification{
		UserID:  offer.TaskerID,
		Type:    "offer_accepted",
		Title:   "Offer Accepted!",
		Message: "Your offer for " + offer.Task.Title + " has been accepted.",
		Data:    taskerDataJSON,
	}
	h.db.Create(&notification)
	if notification.ID == uuid.Nil {
		fmt.Printf("ERROR: Failed to create tasker notification. DB Error: %v\n", h.db.Error)
	} else {
		fmt.Printf("SUCCESS: Created tasker notification %s\n", notification.ID)
		if h.fcm != nil {
			h.fcm.BroadcastNotification(&notification)
		}
	}

	// Create confirmation notification for task poster
	posterDataJSON, _ := json.Marshal(map[string]interface{}{
		"task_id":         offer.TaskID.String(),
		"conversation_id": conversation.ID.String(),
		"amount":          offer.Amount,
	})
	posterNotification := models.Notification{
		UserID:  userID.(uuid.UUID),
		Type:    "offer_accepted_by_you",
		Title:   "Offer Accepted",
		Message: fmt.Sprintf("You accepted an offer for %s. Your task is now assigned.", offer.Task.Title),
		Data:    posterDataJSON,
	}
	h.db.Create(&posterNotification)
	if posterNotification.ID == uuid.Nil {
		fmt.Printf("ERROR: Failed to create poster notification for offer acceptance. DB Error: %v\n", h.db.Error)
	} else {
		fmt.Printf("SUCCESS: Created poster notification %s for offer acceptance\n", posterNotification.ID)
		if h.fcm != nil {
			h.fcm.BroadcastNotification(&posterNotification)
		}
	}

	// Send Push Notification to tasker
	if h.fcm != nil {
		go func() {
			err := h.fcm.SendNotification(
				offer.TaskerID,
				"Offer Accepted!",
				"Your offer for "+offer.Task.Title+" has been accepted.",
				map[string]string{
					"type":            "offer_accepted",
					"task_id":         offer.TaskID.String(),
					"conversation_id": conversation.ID.String(),
				},
			)
			if err != nil {
				fmt.Printf("Failed to send push notification to tasker: %v\n", err)
			}
		}()

		// Send push notification to task poster (confirmation)
		go func() {
			err := h.fcm.SendNotification(
				userID.(uuid.UUID),
				"Offer Accepted",
				fmt.Sprintf("You accepted an offer for %s. Your task is now assigned.", offer.Task.Title),
				map[string]string{
					"type":            "offer_accepted_by_you",
					"task_id":         offer.TaskID.String(),
					"conversation_id": conversation.ID.String(),
				},
			)
			if err != nil {
				fmt.Printf("Failed to send push notification to poster: %v\n", err)
			}
		}()
	}

	c.JSON(http.StatusOK, gin.H{
		"offer":           offer,
		"conversation_id": conversation.ID,
		"escrow":          escrow,
	})
}

func (h *OfferHandler) AddReply(c *gin.Context) {
	userID, _ := c.Get("user_id")
	offerID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offer ID"})
		return
	}

	var req struct {
		Message string `json:"message" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reply := models.OfferReply{
		OfferID:  offerID,
		AuthorID: userID.(uuid.UUID),
		Message:  req.Message,
	}

	if err := h.db.Create(&reply).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create reply"})
		return
	}

	// Reload with author
	h.db.Preload("Author").First(&reply, "id = ?", reply.ID)

	c.JSON(http.StatusCreated, reply)
}

func (h *OfferHandler) GetReplies(c *gin.Context) {
	offerID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offer ID"})
		return
	}

	var replies []models.OfferReply
	if err := h.db.Preload("Author").Where("offer_id = ?", offerID).Order("created_at asc").Find(&replies).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch replies"})
		return
	}

	c.JSON(http.StatusOK, replies)
}
