package models

type LoginRequest struct {
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type User struct {
	ID              int     `json:"id"`
	Name            string  `json:"name"`
	Phone           string  `json:"phone"`
	Email           string  `json:"email"`
	IsActive        *bool   `json:"is_active,omitempty"`
	ProfilePhoto    *string `json:"profile_photo,omitempty"`
	Gender          *string `json:"gender,omitempty"`
	DateOfBirth     *string `json:"date_of_birth,omitempty"`
	Country         *string `json:"country,omitempty"`
	PhoneCode       *string `json:"phone_code,omitempty"`
	AccountVerified *bool   `json:"account_verified,omitempty"`
}
