package models

type Product struct {
	ID                 int         `json:"id"`
	Name               string      `json:"name"`
	ShortDescription   string      `json:"short_description"`
	Description        string      `json:"description"`
	Thumbnail          string      `json:"thumbnail"`
	Thumbnails         []Thumbnail `json:"thumbnails"`
	Images             []string    `json:"images"`
	Price              float64     `json:"price"`
	DiscountPrice      float64     `json:"discount_price"`
	DiscountPercentage float64     `json:"discount_percentage"`
	Rating             float64     `json:"rating"`
	TotalReviews       string      `json:"total_reviews"`
	TotalSold          string      `json:"total_sold"`
	Quantity           int         `json:"quantity"`
	IsFavorite         bool        `json:"is_favorite"`
	Shop               Shop        `json:"shop"`
	IsDigital          *bool       `json:"is_digital,omitempty"`
	Colors             []Color     `json:"colors"`
	Sizes              []SizeModel `json:"sizes"`
	Brand              string      `json:"brand"`
}

type Thumbnail struct {
	ID        int    `json:"id"`
	Thumbnail string `json:"thumbnail"`
	URL       string `json:"url"`
	Type      string `json:"type"`
}

type Shop struct {
	ID                 int     `json:"id"`
	Name               string  `json:"name"`
	Logo               string  `json:"logo"`
	Rating             float64 `json:"rating"`
	DeliveryCharge     float64 `json:"delivery_charge"`
	DeliveryChargeType string  `json:"estimated_delivery_time"`
	Banner             string  `json:"banner"`
	TotalProducts      int     `json:"total_products"`
	TotalCategories    int     `json:"total_categories"`
	ShopStatus         string  `json:"shop_status"`
	TotalReviews       string  `json:"total_reviews"`
}

type Color struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

type SizeModel struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}
