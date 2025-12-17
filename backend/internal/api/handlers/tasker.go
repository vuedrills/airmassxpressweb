package handlers

import (
	"net/http"

	"github.com/airmassxpress/backend/internal/config"
	"github.com/airmassxpress/backend/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TaskerHandler struct {
	cfg *config.Config
	db  *gorm.DB
}

func NewTaskerHandler(cfg *config.Config, db *gorm.DB) *TaskerHandler {
	return &TaskerHandler{cfg: cfg, db: db}
}

// GetProfessions returns the list of available professions
func (h *TaskerHandler) GetProfessions(c *gin.Context) {
	// Seed professions if none exist
	var count int64
	h.db.Model(&models.Profession{}).Count(&count)
	if count == 0 {
		h.seedProfessions()
	}

	var professions []models.Profession
	if err := h.db.Find(&professions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch professions"})
		return
	}
	c.JSON(http.StatusOK, professions)
}

// seedProfessions seeds the initial list of professions
func (h *TaskerHandler) seedProfessions() {
	professions := []models.Profession{
		{ID: "plumber", Name: "Plumber", CategoryID: "home_repair"},
		{ID: "electrician", Name: "Electrician", CategoryID: "electrical"},
		{ID: "tiler", Name: "Tiler", CategoryID: "home_repair"},
		{ID: "mechanic", Name: "Mechanic", CategoryID: "mechanics"},
		{ID: "builder", Name: "Builder", CategoryID: "building"},
		{ID: "solar_technician", Name: "Solar Technician", CategoryID: "solar"},
		{ID: "carpenter", Name: "Carpenter", CategoryID: "carpentry"},
		{ID: "painter", Name: "Painter", CategoryID: "painting"},
		{ID: "landscaper", Name: "Landscaper", CategoryID: "landscaping"},
		{ID: "fuel_pump_tech", Name: "Fuel Pump Technician", CategoryID: "mechanics"},
		{ID: "solar_engineer", Name: "Solar Engineer", CategoryID: "solar"},
		{ID: "quantity_surveyor", Name: "Quantity Surveyor", CategoryID: "building"},
		{ID: "land_surveyor", Name: "Land Surveyor", CategoryID: "building"},
		{ID: "geotech_tech", Name: "Geotechnical Technician", CategoryID: "building"},
		{ID: "bricklayer", Name: "Bricklayer", CategoryID: "building"},
		{ID: "project_manager", Name: "Project Manager", CategoryID: "other"},
		{ID: "architect", Name: "Architect", CategoryID: "building"},
		{ID: "civil_engineer", Name: "Civil Engineer", CategoryID: "building"},
		{ID: "electrical_engineer", Name: "Electrical Engineer", CategoryID: "electrical"},
		{ID: "mechanical_engineer", Name: "Mechanical Engineer", CategoryID: "mechanics"},
	}

	for _, p := range professions {
		h.db.FirstOrCreate(&p, models.Profession{ID: p.ID})
	}
}

// UpdateProfileRequest wraps TaskerProfile to include User fields like Location
type UpdateProfileRequest struct {
	models.TaskerProfile
	Location string `json:"location"`
}

// UpdateProfile handle partial updates to the tasker profile
func (h *TaskerHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 1. Update User Location if provided
	if req.Location != "" {
		if err := h.db.Model(&models.User{}).Where("id = ?", userID).Update("location", req.Location).Error; err != nil {
			// Log error but continue
		}
	}

	// 2. Fetch existing profile or create one if it doesn't exist
	var profile models.TaskerProfile
	err := h.db.First(&profile, "user_id = ?", userID.(uuid.UUID)).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new profile linked to user
			profile = models.TaskerProfile{
				UserID: userID.(uuid.UUID),
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}
	}

	// Update fields based on request (accessing embedded fields directly)
	if req.Status != "" {
		profile.Status = req.Status
	}
	if req.OnboardingStep > 0 {
		profile.OnboardingStep = req.OnboardingStep
	}
	if req.Bio != "" {
		profile.Bio = req.Bio
	}
	if req.ProfilePictureURL != "" {
		profile.ProfilePictureURL = req.ProfilePictureURL
		// Sync to User Avatar
		h.db.Model(&models.User{}).Where("id = ?", userID).Update("avatar_url", req.ProfilePictureURL)
	}
	if req.SelfieURL != "" {
		profile.SelfieURL = req.SelfieURL
	}

	if req.AddressDocumentURL != "" {
		profile.AddressDocumentURL = req.AddressDocumentURL
	}
	if req.EcocashNumber != "" {
		profile.EcocashNumber = req.EcocashNumber
	}

	if len(req.ProfessionIDs) > 0 {
		profile.ProfessionIDs = req.ProfessionIDs
	}
	if len(req.IDDocumentURLs) > 0 {
		profile.IDDocumentURLs = req.IDDocumentURLs
	}
	if len(req.PortfolioURLs) > 0 {
		profile.PortfolioURLs = req.PortfolioURLs
	}
	if len(req.Qualifications) > 0 {
		profile.Qualifications = req.Qualifications
	}

	// Update Availability days explicitly if provided
	if len(req.Availability.Monday) > 0 {
		profile.Availability.Monday = req.Availability.Monday
	}
	if len(req.Availability.Tuesday) > 0 {
		profile.Availability.Tuesday = req.Availability.Tuesday
	}
	if len(req.Availability.Wednesday) > 0 {
		profile.Availability.Wednesday = req.Availability.Wednesday
	}
	if len(req.Availability.Thursday) > 0 {
		profile.Availability.Thursday = req.Availability.Thursday
	}
	if len(req.Availability.Friday) > 0 {
		profile.Availability.Friday = req.Availability.Friday
	}
	if len(req.Availability.Saturday) > 0 {
		profile.Availability.Saturday = req.Availability.Saturday
	}
	if len(req.Availability.Sunday) > 0 {
		profile.Availability.Sunday = req.Availability.Sunday
	}

	// Save profile
	if err := h.db.Save(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	// Ensure User.IsTasker is true
	if err := h.db.Model(&models.User{}).Where("id = ?", userID).Update("is_tasker", true).Error; err != nil {
		// Log error but continue as profile is saved
	}

	// Return updated user with tasker profile to keep frontend in sync (avatar_url included)
	var user models.User
	if err := h.db.Preload("TaskerProfile").First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "Profile updated", "profile": profile})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated", "profile": profile, "user": user})
}

type UploadMetadataRequest struct {
	FileURL string `json:"file_url" binding:"required"`
	Type    string `json:"type" binding:"required"` // id_document, selfie, portfolio
}

// UploadMetadata handles file upload metadata confirmation
func (h *TaskerHandler) UploadMetadata(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req UploadMetadataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Fetch or create profile
	var profile models.TaskerProfile
	err := h.db.First(&profile, "user_id = ?", userID.(uuid.UUID)).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			profile = models.TaskerProfile{UserID: userID.(uuid.UUID)}
		} else {
			c.JSON(http.StatusNotFound, gin.H{"error": "Profile not found"})
			return
		}
	}

	switch req.Type {
	case "id_document":
		profile.IDDocumentURLs = append(profile.IDDocumentURLs, req.FileURL)
	case "selfie":
		profile.SelfieURL = req.FileURL
	case "portfolio":
		profile.PortfolioURLs = append(profile.PortfolioURLs, req.FileURL)
	case "profile_picture":
		profile.ProfilePictureURL = req.FileURL
		// Sync to User Avatar
		h.db.Model(&models.User{}).Where("id = ?", userID).Update("avatar_url", req.FileURL)
	case "qualification":
		// No-op for now, as Qualifications are saved in the final step via UpdateProfile
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file type"})
		return
	}

	if err := h.db.Save(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file metadata"})
		return
	}

	// Return updated user with tasker profile to keep frontend in sync (avatar_url included)
	var user models.User
	if err := h.db.Preload("TaskerProfile").First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"message": "File metadata saved", "profile": profile})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File metadata saved", "profile": profile, "user": user})
}

// ApproveTasker simulates admin approval for local dev
func (h *TaskerHandler) ApproveTasker(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update Profile
	var profile models.TaskerProfile
	if err := h.db.First(&profile, "user_id = ?", user.ID).Error; err != nil {
		// If no profile, create one? Or error? Admin should approve existing profile.
		// For dev tool flexibility, let's create if missing.
		profile = models.TaskerProfile{UserID: user.ID}
	}

	profile.Status = "approved"
	if err := h.db.Save(&profile).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile status"})
		return
	}

	// Update User IsTasker
	if err := h.db.Model(&user).Update("is_tasker", true).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User approved as tasker", "user": user, "profile": profile})
}
