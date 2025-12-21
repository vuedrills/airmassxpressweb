package auth

import (
	"errors"
	"time"

	"github.com/airmassxpress/auction_system/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var SecretKey = []byte("super_secret_key_change_in_production")

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

type RegisterInput struct {
	Username string
	Email    string
	Password string
	TownID   uint
}

type LoginInput struct {
	Email    string
	Password string
}

type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

func (s *AuthService) Register(input RegisterInput) (*AuthResponse, error) {
	// hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashed),
		TownID:   &input.TownID,
		Role:     models.RoleUser,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, err
	}

	return s.generateTokenResponse(user)
}

func (s *AuthService) Login(input LoginInput) (*AuthResponse, error) {
	var user models.User
	if err := s.db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return s.generateTokenResponse(user)
}

func (s *AuthService) generateTokenResponse(user models.User) (*AuthResponse, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(24 * time.Hour).Unix(),
	})

	tokenString, err := token.SignedString(SecretKey)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{
		Token: tokenString,
		User:  user,
	}, nil
}
