package handlers

import (
	"net/http"
	"time"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/airmassxpress/backend/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TaskHandler struct {
	db  *gorm.DB
	fcm *services.FCMService
}

func NewTaskHandler(db *gorm.DB, fcm *services.FCMService) *TaskHandler {
	return &TaskHandler{
		db:  db,
		fcm: fcm,
	}
}

type CreateTaskRequest struct {
	Title       string   `json:"title" binding:"required"`
	Description string   `json:"description" binding:"required"`
	Category    string   `json:"category" binding:"required"`
	Budget      float64  `json:"budget" binding:"required,gt=0"`
	Location    string   `json:"location" binding:"required"`
	Lat         *float64 `json:"lat"`
	Lng         *float64 `json:"lng"`
	DateType    string   `json:"date_type"`
	Date        *string  `json:"date"`
	TimeOfDay   string   `json:"time_of_day"`
	TaskType    string   `json:"task_type"`

	// V2 Fields
	HireDurationType   string  `json:"hire_duration_type"`
	EstimatedHours     *int    `json:"estimated_hours"`
	EstimatedDuration  *int    `json:"estimated_duration"`
	FuelIncluded       bool    `json:"fuel_included"`
	OperatorPreference string  `json:"operator_preference"`
	RequiredCapacityID *string `json:"required_capacity_id"`

	// Location V2
	City           string `json:"city"`
	Suburb         string `json:"suburb"`
	AddressDetails string `json:"address_details"`
}

func (h *TaskHandler) ListTasks(c *gin.Context) {
	var tasks []models.Task

	query := h.db.Preload("Poster").Preload("Attachments")

	// Filters
	if tType := c.Query("task_type"); tType != "" {
		query = query.Where("task_type = ?", tType)
	}
	if category := c.Query("category"); category != "" {
		query = query.Where("category = ?", category)
	}
	// ...

	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if location := c.Query("location"); location != "" {
		query = query.Where("location ILIKE ?", "%"+location+"%")
	}
	if posterID := c.Query("poster_id"); posterID != "" {
		query = query.Where("poster_id = ?", posterID)
	}
	if offeredBy := c.Query("offered_by"); offeredBy != "" {
		// Join with offers to find tasks where this user made an offer
		query = query.Joins("JOIN offers ON offers.task_id = tasks.id").
			Where("offers.tasker_id = ?", offeredBy).
			Group("tasks.id") // Deduplicate in case of multiple offers/replies if any
	}

	// Sorting
	sortBy := c.DefaultQuery("sort", "created_at desc")
	query = query.Order(sortBy)

	if err := query.Find(&tasks).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

func (h *TaskHandler) GetTask(c *gin.Context) {
	id := c.Param("id")
	taskID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	var task models.Task
	if err := h.db.Preload("Poster").Preload("Attachments").Preload("Offers.Tasker").Preload("AcceptedOffer.Tasker").Preload("RequiredCapacity").First(&task, "id = ?", taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) CreateTask(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var taskDate *time.Time
	if req.Date != nil && *req.Date != "" {
		parsedDate, err := time.Parse("2006-01-02", *req.Date)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
			return
		}
		taskDate = &parsedDate
	}

	taskType := "service"
	if req.TaskType != "" {
		taskType = req.TaskType
	}

	var reqCapID *uuid.UUID
	if req.RequiredCapacityID != nil && *req.RequiredCapacityID != "" {
		id, err := uuid.Parse(*req.RequiredCapacityID)
		if err == nil {
			reqCapID = &id
		}
	}

	// Construct Location String for backward compatibility
	// Format: "Details, Suburb, City"
	locationStr := req.Location
	if req.City != "" || req.Suburb != "" {
		parts := []string{}
		if req.AddressDetails != "" {
			parts = append(parts, req.AddressDetails)
		}
		if req.Suburb != "" {
			parts = append(parts, req.Suburb)
		}
		if req.City != "" {
			parts = append(parts, req.City)
		}
		if len(parts) > 0 {
			locationStr = ""
			for i, p := range parts {
				if i > 0 {
					locationStr += ", "
				}
				locationStr += p
			}
		}
	}

	task := models.Task{
		PosterID:           userID.(uuid.UUID),
		Title:              req.Title,
		Description:        req.Description,
		Category:           req.Category,
		Budget:             req.Budget,
		Location:           locationStr, // Use constructed or provided location
		Lat:                req.Lat,
		Lng:                req.Lng,
		DateType:           req.DateType,
		Date:               taskDate,
		TimeOfDay:          req.TimeOfDay,
		Status:             "open",
		TaskType:           taskType,
		HireDurationType:   req.HireDurationType,
		EstimatedHours:     req.EstimatedHours,
		EstimatedDuration:  req.EstimatedDuration,
		FuelIncluded:       req.FuelIncluded,
		OperatorPreference: req.OperatorPreference,
		RequiredCapacityID: reqCapID,
		City:               req.City,
		Suburb:             req.Suburb,
		AddressDetails:     req.AddressDetails,
		LocationConfSource: "user_confirmed_pin",
	}

	if err := h.db.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create task"})
		return
	}

	// Reload with relationships
	h.db.Preload("Poster").First(&task, "id = ?", task.ID)

	c.JSON(http.StatusCreated, gin.H{"taskId": task.ID})
}

type AddAttachmentsRequest struct {
	Attachments []struct {
		URL  string `json:"url" binding:"required"`
		Type string `json:"type" binding:"required"`
		Name string `json:"name"`
	} `json:"attachments" binding:"required"`
}

func (h *TaskHandler) AddAttachments(c *gin.Context) {
	id := c.Param("id")
	taskID, err := uuid.Parse(id)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid task ID"})
		return
	}

	var req AddAttachmentsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify task exists
	var task models.Task
	if err := h.db.First(&task, "id = ?", taskID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	// Create task attachments
	for i, att := range req.Attachments {
		attachment := models.TaskAttachment{
			TaskID:     taskID,
			URL:        att.URL,
			Type:       att.Type,
			Name:       att.Name,
			OrderIndex: i,
		}
		h.db.Create(&attachment)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attachments added successfully"})
}

func (h *TaskHandler) UpdateTask(c *gin.Context) {
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

	// Verify ownership
	if task.PosterID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&task).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update task"})
		return
	}

	c.JSON(http.StatusOK, task)
}

func (h *TaskHandler) DeleteTask(c *gin.Context) {
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

	// Verify ownership
	if task.PosterID != userID.(uuid.UUID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized"})
		return
	}

	if err := h.db.Delete(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete task"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task deleted successfully"})
}

func (h *TaskHandler) UploadTaskImages(c *gin.Context) {
	// TODO: Implement file upload to S3 or local storage
	c.JSON(http.StatusNotImplemented, gin.H{"message": "Image upload not yet implemented"})
}

// GetActiveTasks returns tasks where the current user is the assigned tasker
func (h *TaskHandler) GetActiveTasks(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var tasks []models.Task
	// Find tasks where accepted offer corresponds to this user and status is in_progress OR assigned
	// Order by Oldest First (FIFO queue)
	err := h.db.Preload("Poster").
		Joins("JOIN offers ON offers.id = tasks.accepted_offer_id").
		Where("offers.tasker_id = ? AND (tasks.status = ? OR tasks.status = ?)", userID, "in_progress", "assigned").
		Order("tasks.created_at ASC").
		Find(&tasks).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch active tasks"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// GetPendingReviews returns tasks that are completed by the user (as poster) but not yet reviewed
func (h *TaskHandler) GetPendingReviews(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var tasks []models.Task
	// Find tasks: poster = user, status = completed
	// AND id NOT IN (SELECT task_id FROM reviews)
	// We use a subquery to filter out already reviewed tasks
	err := h.db.
		Preload("AcceptedOffer.Tasker"). // Need tasker info to show who we are reviewing
		Where("poster_id = ? AND status = ?", userID, "completed").
		Where("id NOT IN (SELECT task_id FROM reviews WHERE reviewer_id = ?)", userID).
		Find(&tasks).Error

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pending reviews"})
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// CompleteTask marks a task as completed
// IMPLEMENTATION MOVED TO task_completion.go
