package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/airmassxpress/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ChatHandler struct {
	db  *gorm.DB
	hub *services.Hub
}

func NewChatHandler(db *gorm.DB, hub *services.Hub) *ChatHandler {
	return &ChatHandler{db: db, hub: hub}
}

// GetConversations returns all conversations for the logged-in user
func (h *ChatHandler) GetConversations(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var conversations []models.Conversation
	// Complex query to join participants
	err := h.db.Model(&models.Conversation{}).
		Joins("JOIN conversation_participants cp ON cp.conversation_id = conversations.id").
		Where("cp.user_id = ?", userID).
		Preload("Participants").
		Preload("Messages", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at desc").Limit(1) // Get latest message
		}).
		Preload("Task"). // Load associated task if exists
		Find(&conversations).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch conversations"})
		return
	}

	// Transform response to match frontend expectations
	type ConversationResponse struct {
		ID                 uuid.UUID                `json:"id"`
		TaskID             *uuid.UUID               `json:"task_id,omitempty"`
		Task               *models.Task             `json:"task,omitempty"`
		Participants       []string                 `json:"participants"`
		ParticipantDetails []map[string]interface{} `json:"participantDetails"`
		LastMessage        interface{}              `json:"lastMessage,omitempty"`
		UnreadCount        int                      `json:"unreadCount"`
		CreatedAt          string                   `json:"createdAt"`
		UpdatedAt          string                   `json:"updatedAt"`
	}

	// We do NOT filter empty conversations anymore.
	// Newly created conversations (from offer acceptance) start empty and need to be visible.
	filteredConversations := conversations

	responses := make([]ConversationResponse, len(filteredConversations))
	for i, conv := range filteredConversations {
		// Build participant ID list and details for other participants
		participantIDs := []string{}
		participantDetails := []map[string]interface{}{}

		for _, p := range conv.Participants {
			participantIDs = append(participantIDs, p.ID.String())
			// Exclude current user from participant details
			if p.ID != userID.(uuid.UUID) {
				participantDetails = append(participantDetails, map[string]interface{}{
					"id":     p.ID.String(),
					"name":   p.Name,
					"avatar": p.AvatarURL,
				})
			}
		}

		var lastMessage interface{}
		if len(conv.Messages) > 0 {
			msg := conv.Messages[0]
			lastMessage = map[string]interface{}{
				"id":             msg.ID.String(),
				"conversationId": msg.ConversationID.String(),
				"senderId":       msg.SenderID.String(),
				"content":        msg.Content,
				"read":           msg.Read,
				"createdAt":      msg.CreatedAt.Format(time.RFC3339),
			}
		}

		// Calculate unread count - messages sent by others that are not read
		var unreadCount int64
		h.db.Model(&models.Message{}).
			Where("conversation_id = ? AND sender_id != ? AND read = false",
				conv.ID, userID.(uuid.UUID)).
			Count(&unreadCount)

		// Debug logging
		if unreadCount > 0 {
			log.Printf("📬 Conversation %s has %d unread messages for user %s",
				conv.ID.String()[:8], unreadCount, userID.(uuid.UUID).String()[:8])
		}

		responses[i] = ConversationResponse{
			ID:                 conv.ID,
			TaskID:             conv.TaskID,
			Task:               conv.Task,
			Participants:       participantIDs,
			ParticipantDetails: participantDetails,
			LastMessage:        lastMessage,
			UnreadCount:        int(unreadCount),
			CreatedAt:          conv.CreatedAt.Format(time.RFC3339),
			UpdatedAt:          conv.UpdatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, responses)
}

// GetMessages returns messages for a specific conversation
func (h *ChatHandler) GetMessages(c *gin.Context) {
	userID, _ := c.Get("user_id")
	conversationID, err := uuid.Parse(c.Param("conversationId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	// Verify participation
	var count int64
	h.db.Model(&models.ConversationParticipant{}).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Count(&count)

	if count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant in this conversation"})
		return
	}

	var messages []models.Message
	if err := h.db.Preload("Sender").Where("conversation_id = ?", conversationID).Order("created_at asc").Find(&messages).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}

	// NOTE: Messages are NOT automatically marked as read when fetching
	// This allows the unread badge to work correctly
	// In the future, we can add an explicit "mark as read" endpoint
	// or mark as read when user scrolls to view messages

	// Transform to camelCase for frontend
	type MessageResponse struct {
		ID             string `json:"id"`
		ConversationID string `json:"conversationId"`
		SenderID       string `json:"senderId"`
		Content        string `json:"content"`
		Read           bool   `json:"read"`
		CreatedAt      string `json:"createdAt"`
	}

	responses := make([]MessageResponse, len(messages))
	for i, msg := range messages {
		responses[i] = MessageResponse{
			ID:             msg.ID.String(),
			ConversationID: msg.ConversationID.String(),
			SenderID:       msg.SenderID.String(),
			Content:        msg.Content,
			Read:           msg.Read,
			CreatedAt:      msg.CreatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, responses)
}

// MarkConversationAsRead marks all messages in a conversation as read for the user
func (h *ChatHandler) MarkConversationAsRead(c *gin.Context) {
	userID, _ := c.Get("user_id")
	conversationID, err := uuid.Parse(c.Param("conversationId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	// Verify participation
	var count int64
	h.db.Model(&models.ConversationParticipant{}).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Count(&count)

	if count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant in this conversation"})
		return
	}

	// Update read status for messages sent by OTHERS to this user
	// Note: We check sender_id != user_id because we don't need to "read" our own messages
	result := h.db.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id != ? AND read = false",
			conversationID, userID.(uuid.UUID)).
		Update("read", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark messages as read"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Messages marked as read",
		"count":   result.RowsAffected,
	})
}

// SendMessage sends a new message in a conversation
func (h *ChatHandler) SendMessage(c *gin.Context) {
	userID, _ := c.Get("user_id")
	conversationID, err := uuid.Parse(c.Param("conversationId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid conversation ID"})
		return
	}

	var req struct {
		Content string `json:"content" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify participation
	var count int64
	h.db.Model(&models.ConversationParticipant{}).
		Where("conversation_id = ? AND user_id = ?", conversationID, userID).
		Count(&count)

	if count == 0 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not a participant in this conversation"})
		return
	}

	message := models.Message{
		ConversationID: conversationID,
		SenderID:       userID.(uuid.UUID),
		Content:        req.Content,
	}

	if err := h.db.Create(&message).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send message"})
		return
	}

	// Reload with sender
	h.db.Preload("Sender").First(&message, "id = ?", message.ID)

	// Transform to camelCase for frontend
	messageResponse := map[string]interface{}{
		"id":             message.ID.String(),
		"conversationId": message.ConversationID.String(),
		"senderId":       message.SenderID.String(),
		"content":        message.Content,
		"read":           message.Read,
		"createdAt":      message.CreatedAt.Format(time.RFC3339),
	}

	// Broadcast message to all participants via WebSocket
	var participants []models.ConversationParticipant
	h.db.Where("conversation_id = ?", conversationID).Find(&participants)

	for _, p := range participants {
		// Don't send to the sender (they already have it from the HTTP response)
		if p.UserID != userID.(uuid.UUID) {
			h.hub.SendToUser(p.UserID, map[string]interface{}{
				"type":    "new_message",
				"message": messageResponse,
			})
		}
	}

	c.JSON(http.StatusCreated, messageResponse)
}
