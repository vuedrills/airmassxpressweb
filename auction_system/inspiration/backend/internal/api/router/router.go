package router

import (
	"backend/internal/api/handlers"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	// Enable CORS if needed, but for now simple
	r.NoRoute(func(c *gin.Context) {
		println("DEBUG: 404 Not Found for:", c.Request.Method, c.Request.URL.Path)
		c.JSON(http.StatusNotFound, gin.H{"error": "Route not found", "path": c.Request.URL.Path})
	})

	api := r.Group("/api")
	{
		// Auth
		api.POST("/login", handlers.LoginHandler)
		api.POST("/logout", handlers.LogoutHandler)
		api.POST("/registration", handlers.RegistrationHandler)
		api.POST("/send-otp", handlers.SendOTPHandler)
		api.POST("/verify-otp", handlers.VerifyOTPHandler)
		api.POST("/reset-password", handlers.ResetPasswordHandler)
		api.POST("/change-password", handlers.ChangePasswordHandler)

		// Dashboard & Master
		api.GET("/home", handlers.GetDashboardHandler)
		api.GET("/master", handlers.GetMasterHandler)

		// Products
		api.GET("/products", handlers.GetProductsHandler)
		api.GET("/product-details", handlers.GetProductDetailsHandler)
		api.GET("/category-products", handlers.GetCategoryProductsHandler)

		// Categories
		api.GET("/categories", handlers.GetCategoriesHandler)
		api.GET("/sub-categories", handlers.GetSubCategoriesHandler)

		// Shops
		api.GET("/shops", handlers.GetShopsHandler)
		api.GET("/shop", handlers.GetShopDetailsHandler)
		api.GET("/shop-categories", handlers.GetShopCategoriesHandler)

		// Flash Sales
		api.GET("/flash-sales", handlers.GetFlashSalesHandler)

		// Cart Operations
		api.POST("/cart/store", handlers.AddToCartHandler)
		api.GET("/carts", handlers.GetCartHandler)
		api.POST("/cart/increment", handlers.IncrementCartHandler)
		api.POST("/cart/decrement", handlers.DecrementCartHandler)
		api.DELETE("/cart/remove", handlers.RemoveFromCartHandler)
		api.POST("/cart/checkout", handlers.GetCartCheckoutHandler)

		// Favorites
		api.POST("/favorite-add-or-remove", handlers.ToggleFavoriteHandler)
		api.GET("/favorite-products", handlers.GetFavoritesHandler)

		// Orders
		api.POST("/place-order", handlers.PlaceOrderHandler)
		api.GET("/orders", handlers.GetOrdersHandler)
		api.GET("/order-details", handlers.GetOrderDetailsHandler)
		api.POST("/orders/cancel", handlers.CancelOrderHandler)

		// Addresses
		api.GET("/addresses", handlers.GetAddressesHandler)
		api.POST("/address/store", handlers.StoreAddressHandler)

		// Profile
		api.GET("/profile", handlers.GetProfileHandler)
		api.POST("/update-profile", handlers.UpdateProfileHandler)

		// Reviews
		api.GET("/reviews", handlers.GetReviewsHandler)
		api.POST("/product-review", handlers.AddProductReviewHandler)

		// Misc
		api.GET("/countries", handlers.GetCountriesHandler)
		api.GET("/unread-messages", handlers.GetUnreadMessagesHandler)

		// Gifts
		api.GET("/gifts", handlers.GetGiftsHandler)
		api.POST("/gift/store", handlers.StoreGiftHandler)
		api.POST("/gift/update", handlers.UpdateGiftHandler)
		api.DELETE("/gift/delete", handlers.DeleteGiftHandler)

		// Vouchers
		api.GET("/get-vouchers", handlers.GetVouchersHandler)
		api.POST("/vouchers-collect", handlers.CollectVoucherHandler)
		api.POST("/apply-voucher", handlers.ApplyVoucherHandler)

		// Blogs
		api.GET("/blogs", handlers.GetBlogsHandler)
		api.GET("/blog", handlers.GetBlogDetailsHandler)

		// Legal Pages
		api.GET("/legal-pages/privacy-policy", handlers.GetPrivacyPolicyHandler)
		api.GET("/legal-pages/terms-and-conditions", handlers.GetTermsHandler)
		api.GET("/legal-pages/return-and-refund-policy", handlers.GetRefundPolicyHandler)

		// Support
		api.GET("/support", handlers.GetSupportHandler)
		api.POST("/contact-us", handlers.ContactUsHandler)

		// Returns
		api.POST("/return-order", handlers.SubmitReturnHandler)
		api.GET("/return-history", handlers.GetReturnHistoryHandler)
		api.GET("/return-orders", handlers.GetReturnOrdersHandler)
		api.GET("/return-order-details", handlers.GetReturnOrderDetailsHandler)
	}
}
