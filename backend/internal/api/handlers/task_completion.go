package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CompleteTask marks a task as completed and generates 'invoice' data
func (h *TaskHandler) CompleteTask(c *gin.Context) {
	userID, _ := c.Get("user_id")
	taskID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	var task models.Task
	if err := h.db.First(&task, "id = ?", taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	// Verify requester is the assigned tasker
	// Use explicit check on AcceptedOfferID link or if unavailable, check offers
	var offer models.Offer
	if task.AcceptedOfferID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task is not assigned to anyone"})
		return
	}

	if err := h.db.First(&offer, "id = ?", task.AcceptedOfferID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Assigned offer data missing"})
		return
	}

	if offer.TaskerID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the assigned tasker can mark this task as complete"})
		return
	}

	// Updates
	// 1. Mark task as completed
	task.Status = "completed"
	// task.CompletedAt is not defined in the model, skipping.
	// Since generated model lacks CompletedAt *Time pointer or we didn't add it, we might skip or use UpdatedAt

	h.db.Model(&task).Update("status", "completed")

	// 2. Update Escrow Transaction to 'released' (or 'issued' for invoice logic)
	// We find the escrow connected to this task
	var escrow models.EscrowTransaction
	if err := h.db.Where("task_id = ?", taskID).First(&escrow).Error; err != nil {
		// If missing, create one now (fallback)
		escrow = models.EscrowTransaction{
			TaskID:   taskID,
			OfferID:  offer.ID,
			PosterID: task.PosterID,
			TaskerID: offer.TaskerID,
			Amount:   offer.Amount,
			Status:   "released", // Equivalent to 'issued' for cash
		}
		h.db.Create(&escrow)
	} else {
		// Update status
		h.db.Model(&escrow).Update("status", "released")
	}

	// 3. Return Invoice Data
	invoice := gin.H{
		"taskId":        task.ID,
		"taskTitle":     task.Title,
		"amount":        offer.Amount,
		"status":        "issued",
		"paymentMethod": "cash", // MVP: Cash only
		"taskerName":    "You",  // Frontend has user data
		"posterId":      task.PosterID,
		"completedAt":   "Just now",
	}

	// TODO: Trigger notification to poster
	notificationData, _ := json.Marshal(map[string]interface{}{
		"task_id":   task.ID.String(),
		"tasker_id": userID.(uuid.UUID).String(),
	})
	notification := models.Notification{
		UserID:  task.PosterID,
		Type:    "task_completed",
		Title:   "Task Completed",
		Message: "Tasker has marked '" + task.Title + "' as complete.", // You might want to truncate title if too long
		Data:    notificationData,
	}
	h.db.Create(&notification)

	// 4. Update Tasker Stats (TasksCompleted)
	// We increment the counter atomically
	if err := h.db.Model(&models.User{}).Where("id = ?", offer.TaskerID).Update("tasks_completed", gorm.Expr("tasks_completed + ?", 1)).Error; err != nil {
		// Log error but assume non-critical for flow
		fmt.Printf("Failed to increment tasks_completed: %v\n", err)
	}

	// 5. Update Poster Stats (TasksPostedCompleted)
	if err := h.db.Model(&models.User{}).Where("id = ?", task.PosterID).Update("tasks_posted_completed", gorm.Expr("tasks_posted_completed + ?", 1)).Error; err != nil {
		fmt.Printf("Failed to increment tasks_posted_completed: %v\n", err)
	}

	// Broadcast via WebSocket
	if h.fcm != nil {
		h.fcm.BroadcastNotification(&notification)
	}

	// Send Push Notification
	if h.fcm != nil {
		err := h.fcm.SendNotification(
			task.PosterID,
			"Task Completed",
			"Tasker has marked '"+task.Title+"' as complete.",
			map[string]string{
				"type":   "task_completed",
				"taskId": task.ID.String(),
				"url":    "/tasks/" + task.ID.String(),
			},
		)
		if err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to send push notification: %v\n", err)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task completed successfully",
		"invoice": invoice,
	})
}
