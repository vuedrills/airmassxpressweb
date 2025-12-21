package models

type MasterResponse struct {
	Message string     `json:"message"`
	Data    MasterData `json:"data"`
}

type MasterData struct {
	Currency                Currency         `json:"currency"`
	Currencies              []Currencies     `json:"currencies"`
	PaymentGateways         []PaymentGateway `json:"payment_gateways"`
	IsMultiVendor           bool             `json:"multi_vendor"`
	AppLogo                 string           `json:"app_logo"`
	AppName                 string           `json:"app_name"`
	WebLogo                 string           `json:"web_logo"`
	CashOnDelivery          bool             `json:"cash_on_delivery"`
	OnlinePayment           bool             `json:"online_payment"`
	RegisterOtpType         string           `json:"register_otp_type"`
	OrderPlaceAccountVerify bool             `json:"order_place_account_verify"`
	RegisterOtpVerify       bool             `json:"register_otp_verify"`
	ForgotOtpType           string           `json:"forgot_otp_type"`
	ThemeColors             ThemeColors      `json:"theme_colors"`
	PhoneRequired           bool             `json:"phone_required"`
	PhoneMinLength          int              `json:"phone_min_length"`
	PhoneMaxLength          int              `json:"phone_max_length"`
}

type Currency struct {
	Name     string  `json:"name"`
	Symbol   string  `json:"symbol"`
	Rate     float64 `json:"rate"`
	Position string  `json:"position"`
}

type Currencies struct {
	ID        int     `json:"id"`
	Name      string  `json:"name"`
	Rate      float64 `json:"rate_from_default"`
	Symbol    string  `json:"symbol"`
	IsDefault bool    `json:"is_default"`
}

type PaymentGateway struct {
	ID       int    `json:"id"`
	Title    string `json:"title"`
	Name     string `json:"name"`
	Logo     string `json:"logo"`
	IsActive bool   `json:"is_active"`
}

type ThemeColors struct {
	Primary string `json:"primary"`
}
