package handlers

import (
	"net/http"

	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EquipmentCapacityHandler struct {
	db *gorm.DB
}

func NewEquipmentCapacityHandler(db *gorm.DB) *EquipmentCapacityHandler {
	return &EquipmentCapacityHandler{db: db}
}

// GetAllCapacities returns all equipment capacities grouped by type
// GET /api/equipment-capacities
func (h *EquipmentCapacityHandler) GetAllCapacities(c *gin.Context) {
	var capacities []models.EquipmentCapacity

	if err := h.db.Order("equipment_type, sort_order").Find(&capacities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch capacities"})
		return
	}

	// Group by equipment type
	grouped := make(map[string][]models.EquipmentCapacity)
	for _, cap := range capacities {
		grouped[cap.EquipmentType] = append(grouped[cap.EquipmentType], cap)
	}

	c.JSON(http.StatusOK, gin.H{
		"capacities": capacities,
		"grouped":    grouped,
	})
}

// GetCapacitiesByType returns capacities for a specific equipment type
// GET /api/equipment-capacities/:type
func (h *EquipmentCapacityHandler) GetCapacitiesByType(c *gin.Context) {
	equipmentType := c.Param("type")

	var capacities []models.EquipmentCapacity
	if err := h.db.Where("equipment_type = ?", equipmentType).Order("sort_order").Find(&capacities).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch capacities"})
		return
	}

	c.JSON(http.StatusOK, capacities)
}

// GetEquipmentTypes returns a list of unique equipment types
// GET /api/equipment-types
func (h *EquipmentCapacityHandler) GetEquipmentTypes(c *gin.Context) {
	var types []string
	if err := h.db.Model(&models.EquipmentCapacity{}).Distinct().Pluck("equipment_type", &types).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch equipment types"})
		return
	}

	c.JSON(http.StatusOK, types)
}
