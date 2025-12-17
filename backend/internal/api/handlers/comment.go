package handlers

import (
	"log"
	"net/http"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/airmassxpress/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CommentHandler struct {
	db  *gorm.DB
	hub *services.Hub
}

func NewCommentHandler(db *gorm.DB, hub *services.Hub) *CommentHandler {
	return &CommentHandler{db: db, hub: hub}
}

// GetTaskQuestions fetches top-level comments (questions) for a task with their nested replies
func (h *CommentHandler) GetTaskQuestions(c *gin.Context) {
	taskID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	var comments []models.Comment
	// Fetch top-level comments (where ParentID is null)
	// Preload User and Children (replies) recursively
	// Note: GORM preload recursion can be tricky. For infinite depth, we might need a recursive CTE or separate query.
	// For now, let's assume 2-level depth (Question -> Replies) or use a recursive function if GORM supports it well.
	// Actually, GORM Preload("Children.User") works deeply if we chain it or use a loop, but simplest is to fetch all for task and build tree in backend or frontend.
	// Let's fetch ALL comments for the task and let frontend build the tree, OR fetch hierarchical.
	// Fetching all is safer for "Unlimited" nesting without complex recursive SQL.

	if err := h.db.
		Preload("User").
		Preload("Children.User").     // Preload 1st level replies
		Preload("Children.Children"). // Preload 2nd level... (usually sufficient for UI)
		Where("task_id = ? AND parent_id IS NULL", taskID).
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch questions"})
		return
	}

	c.JSON(http.StatusOK, comments)
}

type CreateCommentRequest struct {
	Content string   `json:"content" binding:"required"`
	Images  []string `json:"images"`
}

// CreateQuestion posts a new top-level question
func (h *CommentHandler) CreateQuestion(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID := userIDStr.(uuid.UUID)
	taskID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment := models.Comment{
		TaskID:  taskID,
		UserID:  userID,
		Content: req.Content,
		Images:  req.Images,
	}

	if err := h.db.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to post question"})
		return
	}

	// Fetch loaded comment to return
	h.db.Preload("User").First(&comment, comment.ID)

	// BroadCast to Task Room
	// "task_updates:{taskID}"
	log.Printf("Broadcasting new_question to task room: task_updates:%s", taskID.String())
	h.hub.BroadcastToRoom("task_updates:"+taskID.String(), map[string]interface{}{
		"type":    "question_created",
		"comment": comment,
	})

	c.JSON(http.StatusCreated, comment)
}

// ReplyComment posts a reply to an existing comment (question or reply)
func (h *CommentHandler) ReplyComment(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID := userIDStr.(uuid.UUID)
	parentID, err := uuid.Parse(c.Param("id")) // Parent Comment ID
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid comment ID"})
		return
	}

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify parent exists and get TaskID
	var parent models.Comment
	if err := h.db.First(&parent, "id = ?", parentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Parent question not found"})
		return
	}

	comment := models.Comment{
		TaskID:   parent.TaskID, // Inherit TaskID
		UserID:   userID,
		ParentID: &parentID,
		Content:  req.Content,
		Images:   req.Images,
	}

	if err := h.db.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to post reply"})
		return
	}

	// Fetch loaded comment
	h.db.Preload("User").First(&comment, comment.ID)

	// BroadCast to Task Room
	h.hub.BroadcastToRoom("task_updates:"+parent.TaskID.String(), map[string]interface{}{
		"type":    "reply_created",
		"comment": comment,
	})

	c.JSON(http.StatusCreated, comment)
}
