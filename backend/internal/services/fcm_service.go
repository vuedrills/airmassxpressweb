package services

import (
	"context"
	"fmt"
	"log"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/messaging"
	"github.com/airmassxpress/backend/internal/models"
	"github.com/google/uuid"
	"google.golang.org/api/option"
	"gorm.io/gorm"
)

type FCMService struct {
	client *messaging.Client
	db     *gorm.DB
	hub    *Hub
}

// NewFCMService initializes the Firebase app and messaging client
// It requires GOOGLE_APPLICATION_CREDENTIALS env var to be set or explicit credentials file
func NewFCMService(db *gorm.DB, hub *Hub, credentialsFile string) (*FCMService, error) {
	ctx := context.Background()
	var opts []option.ClientOption

	if credentialsFile != "" {
		opts = append(opts, option.WithCredentialsFile(credentialsFile))
	}

	app, err := firebase.NewApp(ctx, nil, opts...)
	if err != nil {
		log.Printf("[FCMService] Warning: Failed to initialize Firebase App: %v. Push notifications will be disabled.", err)
		return &FCMService{db: db, hub: hub}, nil // Return partial service
	}

	client, err := app.Messaging(ctx)
	if err != nil {
		log.Printf("[FCMService] Warning: Failed to get Messaging client: %v. Push notifications will be disabled.", err)
		return &FCMService{db: db, hub: hub}, nil // Return partial service
	}

	return &FCMService{
		client: client,
		db:     db,
		hub:    hub,
	}, nil
}

// BroadcastNotification sends a notification via WebSocket
func (s *FCMService) BroadcastNotification(notification *models.Notification) {
	if s.hub == nil {
		fmt.Println("[FCMService] Hub is nil, skipping broadcast")
		return
	}

	fmt.Printf("[FCMService] Broadcasting notification to user %s: %s\n", notification.UserID, notification.ID)

	s.hub.SendToUser(notification.UserID, map[string]interface{}{
		"type":    "new_notification",
		"message": notification,
	})
}

// SendNotification sends a push notification to all valid tokens for a user
func (s *FCMService) SendNotification(userID uuid.UUID, title, body string, data map[string]string) error {
	if s.client == nil {
		fmt.Printf("[FCM] Push notifications disabled (no client). Skipping push for user %s\n", userID)
		return nil
	}

	fmt.Printf("[FCM] SendNotification called for user %s\n", userID) // Entry log

	var tokens []models.FCMToken
	if err := s.db.Where("user_id = ?", userID).Find(&tokens).Error; err != nil {
		fmt.Printf("Error fetching tokens for user %s: %v\n", userID, err)
		return err
	}

	fmt.Printf("[FCM] Found %d tokens for user %s. Sending notification: %s\n", len(tokens), userID, title)

	if len(tokens) == 0 {
		return nil // No tokens found, nothing to do
	}

	// Send to each token individually to avoid deprecated batch/multicast issues
	for _, t := range tokens {
		message := &messaging.Message{
			Token: t.Token,
			Notification: &messaging.Notification{
				Title: title,
				Body:  body,
			},
			Data: data,
		}

		_, err := s.client.Send(context.Background(), message)
		if err != nil {
			log.Printf("Failed to send to token %s: %v", t.Token, err)
			if isRegistrationError(err) {
				s.db.Delete(&t)
			}
		}
	}

	return nil
}

func isRegistrationError(err error) bool {
	// Determine if error is related to invalid/expired token
	// This is a simplified check
	return messaging.IsRegistrationTokenNotRegistered(err)
}
