package handlers

import (
	"net/http"

	"github.com/airmassxpress/backend/internal/config"
	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type InventoryHandler struct {
	cfg *config.Config
	db  *gorm.DB
}

func NewInventoryHandler(cfg *config.Config, db *gorm.DB) *InventoryHandler {
	return &InventoryHandler{cfg: cfg, db: db}
}

type CreateInventoryItemRequest struct {
	Name            string   `json:"name" binding:"required"`
	Category        string   `json:"category" binding:"required"`
	Capacity        string   `json:"capacity"`
	CapacityID      *string  `json:"capacity_id"`
	Location        string   `json:"location"`
	Photos          []string `json:"photos"`
	IsAvailable     bool     `json:"is_available"`
	WithOperator    bool     `json:"with_operator"`
	OperatorBundled bool     `json:"operator_bundled"`
	HourlyRate      *float64 `json:"hourly_rate"`
	DailyRate       *float64 `json:"daily_rate"`
	WeeklyRate      *float64 `json:"weekly_rate"`
	DeliveryFee     *float64 `json:"delivery_fee"`
	OperatorFee     *float64 `json:"operator_fee"`
	Lat             *float64 `json:"lat"`
	Lng             *float64 `json:"lng"`
}

// GetMyInventory list items for current user
func (h *InventoryHandler) GetMyInventory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var items []models.InventoryItem
	if err := h.db.Where("user_id = ?", userID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch inventory"})
		return
	}

	c.JSON(http.StatusOK, items)
}

// CreateInventoryItem adds a new item
func (h *InventoryHandler) CreateInventoryItem(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req CreateInventoryItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	item := models.InventoryItem{
		UserID:          userID.(uuid.UUID),
		Name:            req.Name,
		Category:        req.Category,
		Capacity:        req.Capacity,
		Location:        req.Location,
		Photos:          req.Photos,
		IsAvailable:     req.IsAvailable,
		WithOperator:    req.WithOperator,
		OperatorBundled: req.OperatorBundled,
	}

	// V2 optional fields
	if req.CapacityID != nil {
		capID, err := uuid.Parse(*req.CapacityID)
		if err == nil {
			item.CapacityID = &capID
		}
	}
	if req.HourlyRate != nil {
		d := decimal.NewFromFloat(*req.HourlyRate)
		item.HourlyRate = &d
	}
	if req.DailyRate != nil {
		d := decimal.NewFromFloat(*req.DailyRate)
		item.DailyRate = &d
	}
	if req.WeeklyRate != nil {
		d := decimal.NewFromFloat(*req.WeeklyRate)
		item.WeeklyRate = &d
	}
	if req.DeliveryFee != nil {
		d := decimal.NewFromFloat(*req.DeliveryFee)
		item.DeliveryFee = &d
	}
	if req.OperatorFee != nil {
		d := decimal.NewFromFloat(*req.OperatorFee)
		item.OperatorFee = &d
	}
	if req.Lat != nil {
		item.Lat = req.Lat
	}
	if req.Lng != nil {
		item.Lng = req.Lng
	}

	if err := h.db.Create(&item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// DeleteInventoryItem
func (h *InventoryHandler) DeleteInventoryItem(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	itemID := c.Param("id")
	if err := h.db.Where("id = ? AND user_id = ?", itemID, userID).Delete(&models.InventoryItem{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item deleted"})
}
