package handlers

import (
	"backend/internal/models"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func LoginHandler(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trueVal := true
	defaultPhoto := "https://via.placeholder.com/150"
	gender := "Male"
	dob := "2000-01-01"
	country := "USA"
	phoneCode := "+1"

	email := req.Email
	if email == "" {
		email = "user@example.com" // Default if only phone is provided
	}

	// Mock response - structure must match Flutter's expectations
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"data": gin.H{
			"user": gin.H{
				"id":               1,
				"name":             "Test User",
				"email":            email,
				"phone":            req.Phone,
				"is_active":        &trueVal,
				"profile_photo":    &defaultPhoto,
				"gender":           &gender,
				"date_of_birth":    &dob,
				"country":          &country,
				"phone_code":       &phoneCode,
				"account_verified": &trueVal,
			},
			"access": gin.H{
				"token": "mock-token-123",
			},
		},
	})
}

// ==================== AUTH HANDLERS ====================

func RegistrationHandler(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Phone    string `json:"phone"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	trueVal := true
	defaultPhoto := "https://via.placeholder.com/150"

	c.JSON(http.StatusOK, gin.H{
		"message": "Registration successful",
		"data": gin.H{
			"user": gin.H{
				"id":               2,
				"name":             req.Name,
				"email":            req.Email,
				"phone":            req.Phone,
				"is_active":        &trueVal,
				"profile_photo":    &defaultPhoto,
				"account_verified": false,
			},
			"access": gin.H{
				"token": "mock-token-new-user",
			},
		},
	})
}

func SendOTPHandler(c *gin.Context) {
	var req struct {
		Email string `json:"email"`
		Phone string `json:"phone"`
		Type  string `json:"type"` // "register" or "reset"
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "OTP sent successfully",
		"data": gin.H{
			"otp_expires_in": 300, // 5 minutes
		},
	})
}

func VerifyOTPHandler(c *gin.Context) {
	var req struct {
		Email string `json:"email"`
		Phone string `json:"phone"`
		OTP   string `json:"otp"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Accept any OTP for mock
	c.JSON(http.StatusOK, gin.H{
		"message": "OTP verified successfully",
		"data": gin.H{
			"verified": true,
		},
	})
}

func ResetPasswordHandler(c *gin.Context) {
	var req struct {
		Email       string `json:"email"`
		Phone       string `json:"phone"`
		OTP         string `json:"otp"`
		NewPassword string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully",
	})
}

func ChangePasswordHandler(c *gin.Context) {
	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Password changed successfully",
	})
}

func GetCategoriesHandler(c *gin.Context) {
	categories := []models.Category{
		{ID: 1, Name: "Electronics", Thumbnail: "https://picsum.photos/seed/cat1/150/150", SubCategories: []models.SubCategory{}},
		{ID: 2, Name: "Fashion", Thumbnail: "https://picsum.photos/seed/cat2/150/150", SubCategories: []models.SubCategory{}},
		{ID: 3, Name: "Home", Thumbnail: "https://picsum.photos/seed/cat3/150/150", SubCategories: []models.SubCategory{}},
		{ID: 4, Name: "Sports", Thumbnail: "https://picsum.photos/seed/cat4/150/150", SubCategories: []models.SubCategory{}},
		{ID: 5, Name: "Beauty", Thumbnail: "https://picsum.photos/seed/cat5/150/150", SubCategories: []models.SubCategory{}},
	}
	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func GetProductsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"products": mockProducts,
			"total":    len(mockProducts),
			"filters": gin.H{
				"sizes":     []interface{}{},
				"colors":    []interface{}{},
				"brands":    []interface{}{},
				"min_price": 0,
				"max_price": 10000,
			},
		},
	})
}

func GetDashboardHandler(c *gin.Context) {
	// Filter just a few products for "Popular"
	popular := mockProducts
	if len(popular) > 5 {
		popular = popular[:5]
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"banners": []map[string]interface{}{
				{
					"id":        1,
					"thumbnail": "https://picsum.photos/seed/banner1/800/400",
					"title":     "Big Sale!",
					"url":       "",
				},
				{
					"id":        2,
					"thumbnail": "https://picsum.photos/seed/banner2/800/400",
					"title":     "New Arrivals",
					"url":       "",
				},
			},
			"categories": []models.Category{
				{ID: 1, Name: "Electronics", Thumbnail: "https://picsum.photos/seed/cat1/150/150", SubCategories: []models.SubCategory{}},
				{ID: 2, Name: "Fashion", Thumbnail: "https://picsum.photos/seed/cat2/150/150", SubCategories: []models.SubCategory{}},
				{ID: 3, Name: "Home", Thumbnail: "https://picsum.photos/seed/cat3/150/150", SubCategories: []models.SubCategory{}},
				{ID: 4, Name: "Sports", Thumbnail: "https://picsum.photos/seed/cat4/150/150", SubCategories: []models.SubCategory{}},
				{ID: 5, Name: "Beauty", Thumbnail: "https://picsum.photos/seed/cat5/150/150", SubCategories: []models.SubCategory{}},
			},
			"shops":            mockShops,
			"popular_products": popular,
			"just_for_you": gin.H{
				"total":    len(mockProducts),
				"products": mockProducts,
			},
			"flash_sales": []map[string]interface{}{
				// Add if needed
			},
		},
	})
}

func GetMasterHandler(c *gin.Context) {
	res := models.MasterResponse{
		Message: "success",
		Data: models.MasterData{
			Currency: models.Currency{
				Name:     "USD",
				Symbol:   "$",
				Rate:     1.0,
				Position: "left",
			},
			Currencies: []models.Currencies{
				{ID: 1, Name: "USD", Symbol: "$", Rate: 1.0, IsDefault: true},
			},
			PaymentGateways: []models.PaymentGateway{
				{ID: 1, Title: "COD", Name: "Cash On Delivery", IsActive: true},
			},
			IsMultiVendor:           true,
			AppLogo:                 "",
			AppName:                 "Auction App",
			WebLogo:                 "",
			CashOnDelivery:          true,
			OnlinePayment:           true,
			RegisterOtpType:         "email",
			RegisterOtpVerify:       false,
			OrderPlaceAccountVerify: false,
			ForgotOtpType:           "email",
			ThemeColors: models.ThemeColors{
				Primary: "#FF0000",
			},
			PhoneRequired:  false,
			PhoneMinLength: 10,
			PhoneMaxLength: 12,
		},
	}
	c.JSON(http.StatusOK, res)
}

func GetFlashSalesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"running_flash_sale": nil,
		},
	})
}

func GetProductDetailsHandler(c *gin.Context) {
	idStr := c.Query("product_id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID is required"})
		return
	}

	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Product ID"})
		return
	}

	var product *models.Product
	for _, p := range mockProducts {
		if p.ID == id {
			product = &p
			break
		}
	}

	if product == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"product":          product,
			"related_products": []models.Product{},
		},
	})
}

// ==================== CART & ORDER MOCK DATA ====================

// CartProduct matches Flutter's CartProduct model
type CartProduct struct {
	ID                 int         `json:"id"`
	Quantity           int         `json:"quantity"`
	Name               string      `json:"name"`
	Thumbnail          string      `json:"thumbnail"`
	Brand              string      `json:"brand"`
	Price              float64     `json:"price"`
	DiscountPrice      float64     `json:"discount_price"`
	DiscountPercentage float64     `json:"discount_percentage"`
	Rating             float64     `json:"rating"`
	TotalReviews       string      `json:"total_reviews"`
	TotalSold          string      `json:"total_sold"`
	Color              interface{} `json:"color"`
	Size               interface{} `json:"size"`
	Unit               interface{} `json:"unit"`
	IsDigital          bool        `json:"is_digital"`
}

// CartItem matches Flutter's CartItem model (grouped by shop)
type CartItemResponse struct {
	ShopID     int           `json:"shop_id"`
	ShopName   string        `json:"shop_name"`
	ShopLogo   string        `json:"shop_logo"`
	ShopRating string        `json:"shop_rating"`
	HasGift    bool          `json:"has_gift"`
	Products   []CartProduct `json:"products"`
}

type Order struct {
	ID          int                `json:"id"`
	OrderNumber string             `json:"order_number"`
	Items       []CartItemResponse `json:"items"`
	Total       float64            `json:"total"`
	Status      string             `json:"status"`
	CreatedAt   string             `json:"created_at"`
}

// Internal cart storage
type internalCartItem struct {
	ProductID int
	Product   models.Product
	Quantity  int
	ColorID   int
	SizeID    int
}

var internalCart = []internalCartItem{}
var mockOrders = []Order{}
var mockFavorites []models.Product
var orderIDCounter = 1

// Helper to build cart_items response
func buildCartItemsResponse() []CartItemResponse {
	// Group products by shop
	shopMap := make(map[int]*CartItemResponse)

	for _, item := range internalCart {
		shop := item.Product.Shop
		if _, exists := shopMap[shop.ID]; !exists {
			shopMap[shop.ID] = &CartItemResponse{
				ShopID:     shop.ID,
				ShopName:   shop.Name,
				ShopLogo:   shop.Logo,
				ShopRating: fmt.Sprintf("%.1f", shop.Rating),
				HasGift:    false,
				Products:   []CartProduct{},
			}
		}

		cartProduct := CartProduct{
			ID:                 item.ProductID,
			Quantity:           item.Quantity,
			Name:               item.Product.Name,
			Thumbnail:          item.Product.Thumbnail,
			Brand:              item.Product.Brand,
			Price:              item.Product.Price + 0.001,
			DiscountPrice:      item.Product.DiscountPrice + 0.001,
			DiscountPercentage: item.Product.DiscountPercentage + 0.001,
			Rating:             item.Product.Rating + 0.001,
			TotalReviews:       item.Product.TotalReviews,
			TotalSold:          item.Product.TotalSold,
			Color:              nil,
			Size:               nil,
			Unit:               nil,
			IsDigital:          false,
		}

		// Add color if available
		if len(item.Product.Colors) > 0 {
			cartProduct.Color = gin.H{"id": item.Product.Colors[0].ID, "name": item.Product.Colors[0].Name, "price": item.Product.Colors[0].Price + 0.001}
		}
		// Add size if available
		if len(item.Product.Sizes) > 0 {
			cartProduct.Size = gin.H{"id": item.Product.Sizes[0].ID, "name": item.Product.Sizes[0].Name, "price": item.Product.Sizes[0].Price + 0.001}
		}

		shopMap[shop.ID].Products = append(shopMap[shop.ID].Products, cartProduct)
	}

	// Convert map to slice
	result := []CartItemResponse{}
	for _, v := range shopMap {
		result = append(result, *v)
	}
	return result
}

// ==================== CART HANDLERS ====================

func AddToCartHandler(c *gin.Context) {
	var req struct {
		ProductID int  `json:"product_id"`
		Quantity  int  `json:"quantity"`
		Size      int  `json:"size"`
		Color     int  `json:"color"`
		IsBuyNow  bool `json:"is_buy_now"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if req.Quantity == 0 {
		req.Quantity = 1
	}

	// Find product
	var product *models.Product
	for _, p := range mockProducts {
		if p.ID == req.ProductID {
			product = &p
			break
		}
	}
	if product == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Check if already in cart
	for i, item := range internalCart {
		if item.ProductID == req.ProductID {
			internalCart[i].Quantity += req.Quantity
			c.JSON(http.StatusOK, gin.H{
				"message": "Cart updated",
				"data": gin.H{
					"cart_items": buildCartItemsResponse(),
				},
			})
			return
		}
	}

	// Add new item
	internalCart = append(internalCart, internalCartItem{
		ProductID: req.ProductID,
		Product:   *product,
		Quantity:  req.Quantity,
		ColorID:   req.Color,
		SizeID:    req.Size,
	})

	c.JSON(http.StatusOK, gin.H{
		"message": "Added to cart",
		"data": gin.H{
			"cart_items": buildCartItemsResponse(),
		},
	})
}

func GetCartHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"cart_items": buildCartItemsResponse(),
		},
	})
}

func IncrementCartHandler(c *gin.Context) {
	var req struct {
		ProductID int `json:"product_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i, item := range internalCart {
		if item.ProductID == req.ProductID {
			internalCart[i].Quantity++
			c.JSON(http.StatusOK, gin.H{
				"message": "Quantity increased",
				"data": gin.H{
					"cart_items": buildCartItemsResponse(),
				},
			})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
}

func DecrementCartHandler(c *gin.Context) {
	var req struct {
		ProductID int `json:"product_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i, item := range internalCart {
		if item.ProductID == req.ProductID {
			if internalCart[i].Quantity > 1 {
				internalCart[i].Quantity--
				c.JSON(http.StatusOK, gin.H{
					"message": "Quantity decreased",
					"data": gin.H{
						"cart_items": buildCartItemsResponse(),
					},
				})
			} else {
				// Remove item if quantity would be 0
				internalCart = append(internalCart[:i], internalCart[i+1:]...)
				c.JSON(http.StatusOK, gin.H{
					"message": "Item removed from cart",
					"data": gin.H{
						"cart_items": buildCartItemsResponse(),
					},
				})
			}
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
}

func RemoveFromCartHandler(c *gin.Context) {
	var req struct {
		ProductID int `json:"product_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i, item := range internalCart {
		if item.ProductID == req.ProductID {
			internalCart = append(internalCart[:i], internalCart[i+1:]...)
			c.JSON(http.StatusOK, gin.H{
				"message": "Item removed from cart",
				"data": gin.H{
					"cart_items": buildCartItemsResponse(),
				},
			})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
}

func GetCartCheckoutHandler(c *gin.Context) {
	subtotal := 0.0
	for _, item := range internalCart {
		price := item.Product.Price
		if item.Product.DiscountPrice > 0 {
			price = item.Product.DiscountPrice
		}
		subtotal += price * float64(item.Quantity)
	}
	shipping := 10.0
	tax := subtotal * 0.1
	total := subtotal + shipping + tax

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"checkout": gin.H{
				"total_amount":     subtotal + 0.001,
				"payable_amount":   total + 0.001,
				"coupon_discount":  0.001,
				"delivery_charge":  shipping + 0.001,
				"gift_charge":      0.001,
				"order_tax_amount": tax + 0.001,
				"all_vat_taxes":    []interface{}{},
			},
			"apply_coupon": false,
			"cart_items":   buildCartItemsResponse(),
		},
	})
}

// ==================== FAVORITES HANDLERS ====================

func ToggleFavoriteHandler(c *gin.Context) {
	var req struct {
		ProductID int `json:"product_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if already favorite
	for i, fav := range mockFavorites {
		if fav.ID == req.ProductID {
			mockFavorites = append(mockFavorites[:i], mockFavorites[i+1:]...)
			c.JSON(http.StatusOK, gin.H{"message": "Removed from favorites", "is_favorite": false})
			return
		}
	}

	// Add to favorites
	for _, p := range mockProducts {
		if p.ID == req.ProductID {
			mockFavorites = append(mockFavorites, p)
			c.JSON(http.StatusOK, gin.H{"message": "Added to favorites", "is_favorite": true})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
}

func GetFavoritesHandler(c *gin.Context) {
	if mockFavorites == nil {
		mockFavorites = []models.Product{}
	}
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"products": mockFavorites}})
}

// ==================== ORDER HANDLERS ====================

func PlaceOrderHandler(c *gin.Context) {
	if len(internalCart) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	total := 0.0
	for _, item := range internalCart {
		price := item.Product.Price
		if item.Product.DiscountPrice > 0 {
			price = item.Product.DiscountPrice
		}
		total += price * float64(item.Quantity)
	}
	total += 10.0        // shipping
	total += total * 0.1 // tax

	order := Order{
		ID:          orderIDCounter,
		OrderNumber: "ORD-" + strconv.Itoa(1000+orderIDCounter),
		Items:       buildCartItemsResponse(),
		Total:       total,
		Status:      "pending",
		CreatedAt:   "2025-12-21T10:00:00Z",
	}
	orderIDCounter++

	mockOrders = append(mockOrders, order)
	internalCart = []internalCartItem{} // Clear cart

	c.JSON(http.StatusOK, gin.H{
		"message": "Order placed successfully",
		"data":    order,
	})
}

func GetOrdersHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data":  mockOrders,
		"total": len(mockOrders),
	})
}

func GetOrderDetailsHandler(c *gin.Context) {
	idStr := c.Query("order_id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	for _, order := range mockOrders {
		if order.ID == id {
			c.JSON(http.StatusOK, gin.H{"data": order})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
}

func CancelOrderHandler(c *gin.Context) {
	var req struct {
		OrderID int `json:"order_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for i, order := range mockOrders {
		if order.ID == req.OrderID {
			if order.Status == "cancelled" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Order already cancelled"})
				return
			}
			mockOrders[i].Status = "cancelled"
			c.JSON(http.StatusOK, gin.H{"message": "Order cancelled", "data": mockOrders[i]})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
}

// ==================== OTHER HANDLERS ====================

func GetShopsHandler(c *gin.Context) {
	// Simple pagination mock
	pageStr := c.Query("page")
	page, _ := strconv.Atoi(pageStr)
	if page < 1 {
		page = 1
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"shops": mockShops,
			"total": len(mockShops),
		},
	})
}

// Mock address storage
var mockAddresses = []gin.H{}
var addressIDCounter = 1

func GetAddressesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": mockAddresses})
}

func StoreAddressHandler(c *gin.Context) {
	var req struct {
		Name         string  `json:"name"`
		Phone        string  `json:"phone"`
		AddressType  string  `json:"address_type"`
		AddressLine  string  `json:"address_line"`
		AddressLine2 string  `json:"address_line_2"`
		PostalCode   string  `json:"postal_code"`
		City         string  `json:"city"`
		State        string  `json:"state"`
		Country      string  `json:"country"`
		Latitude     float64 `json:"latitude"`
		Longitude    float64 `json:"longitude"`
		IsDefault    bool    `json:"is_default"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	address := gin.H{
		"id":             addressIDCounter,
		"name":           req.Name,
		"phone":          req.Phone,
		"address_type":   req.AddressType,
		"address_line":   req.AddressLine,
		"address_line_2": req.AddressLine2,
		"postal_code":    req.PostalCode,
		"city":           req.City,
		"state":          req.State,
		"country":        req.Country,
		"latitude":       req.Latitude + 0.001,
		"longitude":      req.Longitude + 0.001,
		"is_default":     req.IsDefault,
	}
	addressIDCounter++
	mockAddresses = append(mockAddresses, address)

	c.JSON(http.StatusOK, gin.H{
		"message": "Address stored successfully",
		"data":    address,
	})
}

func GetProfileHandler(c *gin.Context) {
	trueVal := true
	defaultPhoto := "https://via.placeholder.com/150"
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":               1,
			"name":             "Test User",
			"email":            "user@example.com",
			"phone":            "1234567890",
			"is_active":        &trueVal,
			"profile_photo":    &defaultPhoto,
			"account_verified": &trueVal,
		},
	})
}

func UpdateProfileHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

func GetReviewsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"reviews":        []interface{}{},
			"total_reviews":  0,
			"average_rating": 4.5,
		},
	})
}

func AddProductReviewHandler(c *gin.Context) {
	var req struct {
		ProductID int     `json:"product_id"`
		Rating    float64 `json:"rating"`
		Comment   string  `json:"comment"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review submitted successfully",
		"data": gin.H{
			"id":         1,
			"product_id": req.ProductID,
			"rating":     req.Rating + 0.001,
			"comment":    req.Comment,
			"user": gin.H{
				"id":   1,
				"name": "Test User",
			},
			"created_at": "2024-12-21T12:00:00Z",
		},
	})
}

func GetSubCategoriesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}

func GetShopDetailsHandler(c *gin.Context) {
	if len(mockShops) > 0 {
		c.JSON(http.StatusOK, gin.H{"data": mockShops[0]})
	} else {
		c.JSON(http.StatusNotFound, gin.H{"error": "Shop not found"})
	}
}

func GetShopCategoriesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}

func LogoutHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func GetCountriesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{
		gin.H{"id": 1, "name": "United States", "code": "US"},
		gin.H{"id": 2, "name": "United Kingdom", "code": "UK"},
	}})
}

func GetCategoryProductsHandler(c *gin.Context) {
	// Return products filtered by category (mock: return all)
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"products": mockProducts,
			"total":    len(mockProducts),
			"filters": gin.H{
				"sizes":     []interface{}{},
				"colors":    []interface{}{},
				"brands":    []interface{}{},
				"min_price": 0,
				"max_price": 10000,
			},
		},
	})
}

func GetUnreadMessagesHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"count": 0,
		},
	})
}

// ==================== GIFTS HANDLERS ====================

func GetGiftsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}

func StoreGiftHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Gift stored successfully", "data": gin.H{"id": 1}})
}

func UpdateGiftHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Gift updated successfully"})
}

func DeleteGiftHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Gift deleted successfully"})
}

// ==================== VOUCHERS HANDLERS ====================

func GetVouchersHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": []gin.H{
			{
				"id":               1,
				"code":             "SAVE10",
				"name":             "10% Off",
				"discount_type":    "percentage",
				"discount_value":   10.001,
				"min_order_amount": 50.001,
				"max_discount":     20.001,
				"expires_at":       "2025-12-31",
				"is_collected":     false,
			},
		},
	})
}

func CollectVoucherHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Voucher collected successfully"})
}

func ApplyVoucherHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Voucher applied successfully",
		"data": gin.H{
			"discount_amount": 10.001,
		},
	})
}

// ==================== BLOGS HANDLERS ====================

func GetBlogsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": []gin.H{
			{
				"id":         1,
				"title":      "Welcome to Our Store",
				"content":    "We're excited to announce our new product lineup...",
				"thumbnail":  "https://picsum.photos/seed/blog1/400/200",
				"created_at": "2024-12-20",
				"author":     "Admin",
			},
		},
	})
}

func GetBlogDetailsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":         1,
			"title":      "Welcome to Our Store",
			"content":    "We're excited to announce our new product lineup. This is a detailed blog post about our store...",
			"thumbnail":  "https://picsum.photos/seed/blog1/800/400",
			"created_at": "2024-12-20",
			"author":     "Admin",
		},
	})
}

// ==================== LEGAL PAGES HANDLERS ====================

func GetPrivacyPolicyHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"title":   "Privacy Policy",
			"content": "This is our privacy policy. We respect your privacy and protect your personal data...",
		},
	})
}

func GetTermsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"title":   "Terms and Conditions",
			"content": "These are our terms and conditions. By using our service, you agree to...",
		},
	})
}

func GetRefundPolicyHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"title":   "Return and Refund Policy",
			"content": "Our return policy allows returns within 30 days of purchase...",
		},
	})
}

// ==================== SUPPORT HANDLERS ====================

func GetSupportHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"email":   "support@example.com",
			"phone":   "+1-800-123-4567",
			"address": "123 Main St, City, Country",
			"hours":   "Mon-Fri 9AM-6PM",
		},
	})
}

func ContactUsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Message sent successfully"})
}

// ==================== RETURNS HANDLERS ====================

func SubmitReturnHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Return request submitted successfully",
		"data": gin.H{
			"return_id": 1,
			"status":    "pending",
		},
	})
}

func GetReturnHistoryHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}

func GetReturnOrdersHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": []interface{}{}})
}

func GetReturnOrderDetailsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": gin.H{}})
}
