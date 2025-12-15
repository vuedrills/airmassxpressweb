package handlers

import (
	"log"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/airmassxpress/backend/internal/models"
)

type ReviewHandler struct {
	db *gorm.DB
}

func NewReviewHandler(db *gorm.DB) *ReviewHandler {
	return &ReviewHandler{db: db}
}

type CreateReviewRequest struct {
	TaskID                uuid.UUID `json:"task_id" binding:"required"`
	RatingCommunication   int       `json:"rating_communication" binding:"required,min=1,max=5"`
	RatingTime            int       `json:"rating_time" binding:"required,min=1,max=5"`
	RatingProfessionalism int       `json:"rating_professionalism" binding:"required,min=1,max=5"`
	Comment               string    `json:"comment"`
}

func (h *ReviewHandler) CreateReview(c *gin.Context) {
	reviewerIDStr, _ := c.Get("user_id")
	reviewerID := reviewerIDStr.(uuid.UUID)

	var req CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Fetch Task to verify existence and poster
	var task models.Task
	if err := h.db.Preload("Poster").Preload("AcceptedOffer").First(&task, "id = ?", req.TaskID).Error; err != nil {
		log.Printf("CreateReview: Task not found: %v", req.TaskID)
		c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
		return
	}

	log.Printf("CreateReview: Task %s status: %s, PosterID: %s, ReviewerID: %s", task.ID, task.Status, task.PosterID, reviewerID)

	var revieweeID uuid.UUID

	// Check if reviewer is Poster -> Reviewing Tasker
	if task.PosterID == reviewerID {
		if task.AcceptedOffer == nil {
			log.Printf("CreateReview: No accepted offer for task %s", task.ID)
			c.JSON(http.StatusBadRequest, gin.H{"error": "Task does not have an accepted offer"})
			return
		}
		revieweeID = task.AcceptedOffer.TaskerID
	} else if task.AcceptedOffer != nil && task.AcceptedOffer.TaskerID == reviewerID {
		// Reviewer is Tasker -> Reviewing Poster
		revieweeID = task.PosterID
	} else {
		// Neither Poster nor Tasker
		log.Printf("CreateReview: Forbidden - Reviewer %s is neither Poster nor Tasker", reviewerID)
		c.JSON(http.StatusForbidden, gin.H{"error": "Not authorized to review this task"})
		return
	}

	if task.Status != "completed" {
		log.Printf("CreateReview: Task not completed (current: %s)", task.Status)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Task must be completed before reviewing"})
		return
	}

	// Double check if THIS reviewer has already reviewed THIS task
	var existing models.Review
	if err := h.db.Where("task_id = ? AND reviewer_id = ?", task.ID, reviewerID).First(&existing).Error; err == nil {
		log.Printf("CreateReview: Review already exists for task %s by reviewer %s", task.ID, reviewerID)
		c.JSON(http.StatusConflict, gin.H{"error": "You have already reviewed this task"})
		return
	}

	// 2. Calculate Review Weight
	// Base weight = 1.0
	// Verified Job = 1.2x (Assuming all jobs here are verified)
	// Larger Job (> $100) = 1.1x
	weight := 1.2 // Verified base
	if task.Budget > 100 {
		weight *= 1.1
	}

	// Calculate Composite Rating
	compositeRating := float64(req.RatingCommunication+req.RatingTime+req.RatingProfessionalism) / 3.0

	// Use specific Rating fields mapped to Go struct
	review := models.Review{
		TaskID:                task.ID,
		ReviewerID:            reviewerID,
		RevieweeID:            revieweeID,
		Rating:                compositeRating,
		RatingCommunication:   req.RatingCommunication,
		RatingTime:            req.RatingTime,
		RatingProfessionalism: req.RatingProfessionalism,
		Comment:               req.Comment,
		Weight:                weight,
	}

	// Debug log the review object before save
	log.Printf("CreateReview: Attempting to save review: %+v", review)

	if err := h.db.Create(&review).Error; err != nil {
		log.Printf("CreateReview: DB Create Error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit review"})
		return
	}

	log.Printf("CreateReview: Successfully created review %s", review.ID)

	// 3. Recalculate User Aggregate Rating & Update Badges
	go h.updateUserStats(review.RevieweeID)

	c.JSON(http.StatusCreated, review)
}

type ReplyReviewRequest struct {
	Reply string `json:"reply" binding:"required"`
}

func (h *ReviewHandler) ReplyReview(c *gin.Context) {
	userIDStr, _ := c.Get("user_id")
	userID := userIDStr.(uuid.UUID)
	reviewID := c.Param("id")

	var review models.Review
	if err := h.db.First(&review, "id = ?", reviewID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	if review.RevieweeID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Only the reviewed user can reply"})
		return
	}

	if review.Reply != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Already replied to this review"})
		return
	}

	var req ReplyReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	review.Reply = req.Reply
	review.ReplyCreatedAt = &now

	if err := h.db.Save(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save reply"})
		return
	}

	c.JSON(http.StatusOK, review)
}

// updateUserStats recalculates ratings with time decay and updates badges
func (h *ReviewHandler) updateUserStats(userID uuid.UUID) {
	var user models.User
	if err := h.db.First(&user, "id = ?", userID).Error; err != nil {
		return
	}

	var reviews []models.Review
	if err := h.db.Where("reviewee_id = ?", userID).Find(&reviews).Error; err != nil {
		return
	}

	if len(reviews) == 0 {
		return
	}

	var weightedSum float64
	var totalWeight float64
	var commSum int // For badges

	now := time.Now()

	for _, r := range reviews {
		// Time Decay: New reviews count more.
		// Decay Factor = 1 / (log(days + 1) + 1) -> drops slowly
		daysSince := now.Sub(r.CreatedAt).Hours() / 24.0
		timeFactor := 1.0 / (math.Log10(daysSince+1) + 1)

		effectiveWeight := r.Weight * timeFactor

		weightedSum += r.Rating * effectiveWeight
		totalWeight += effectiveWeight

		commSum += r.RatingCommunication
		// Assuming RatingTime=5 means perfect on-time
		if r.RatingTime == 5 {
			user.TasksCompletedOnTime++
		}
	}

	// Update Rating
	if totalWeight > 0 {
		user.Rating = weightedSum / totalWeight
	} else {
		user.Rating = 0
	}
	user.ReviewCount = len(reviews)

	// Update Badges logic
	// ⭐ Top Rated: Rating > 4.8 & > 5 reviews
	user.BadgeTopRated = user.Rating >= 4.8 && user.ReviewCount >= 5

	// 🕒 On-Time: 95% punctuality on last 20 tasks (simplified here to global)
	// Needs more complex query for "last 20", using global ratio for now
	if user.ReviewCount > 0 {
		onTimeRatio := float64(user.TasksCompletedOnTime) / float64(user.ReviewCount)
		user.BadgeOnTime = onTimeRatio >= 0.95 && user.ReviewCount >= 5
	}

	// 👍 Great Communicator: Avg comm rating > 4.5
	avgComm := float64(commSum) / float64(user.ReviewCount)
	user.BadgeCommunicator = avgComm >= 4.5 && user.ReviewCount >= 5

	// 🔁 Rehired: (Placeholder logic) check if multiple reviews from same reviewer
	// badge_quick_response: (Placeholder) would need msg response time tracking

	// 4. Update TasksCompleted count from actual tasks table (Source of Truth)
	// We count tasks where the user is the AcceptedOffer.TaskerID and status is 'completed'
	var completedCount int64
	// SQL: SELECT count(*) FROM tasks JOIN offers ON tasks.accepted_offer_id = offers.id WHERE offers.tasker_id = ? AND tasks.status = 'completed'
	h.db.Table("tasks").
		Joins("JOIN offers ON tasks.accepted_offer_id = offers.id").
		Where("offers.tasker_id = ? AND tasks.status = ?", userID, "completed").
		Count(&completedCount)

	user.TasksCompleted = int(completedCount)

	h.db.Save(&user)
}
