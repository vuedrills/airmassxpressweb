package service

import (
	"github.com/airmassxpress/auction_system/backend/internal/models"
	"github.com/airmassxpress/auction_system/backend/internal/socket"
	"gorm.io/gorm"
)

type NotificationService struct {
	db  *gorm.DB
	hub *socket.Hub
}

func NewNotificationService(db *gorm.DB, hub *socket.Hub) *NotificationService {
	return &NotificationService{db: db, hub: hub}
}

func (s *NotificationService) Notify(userID uint, notifType models.NotificationType, title, message string, auctionID *uint) error {
	notification := models.Notification{
		UserID:    userID,
		Type:      notifType,
		Title:     title,
		Message:   message,
		AuctionID: auctionID,
		IsRead:    false,
	}

	if err := s.db.Create(&notification).Error; err != nil {
		return err
	}

	// Broadcast via WebSocket
	s.hub.BroadcastToUser(userID, "NOTIFICATION_RECEIVED", notification)

	return nil
}
