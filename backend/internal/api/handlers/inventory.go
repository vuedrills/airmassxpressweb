package handlers

import (
	"net/http"

	"github.com/airmassxpress/backend/internal/config"
	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
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
	Name        string   `json:"name" binding:"required"`
	Category    string   `json:"category" binding:"required"`
	Capacity    string   `json:"capacity"`
	Location    string   `json:"location"`
	Photos      []string `json:"photos"`
	IsAvailable bool     `json:"is_available"`
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
		UserID:      userID.(uuid.UUID),
		Name:        req.Name,
		Category:    req.Category,
		Capacity:    req.Capacity,
		Location:    req.Location,
		Photos:      req.Photos,
		IsAvailable: req.IsAvailable, // defaulting to false if not sent? or true?
	}
	// If photos is nil, GORM handles it as null/empty

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
