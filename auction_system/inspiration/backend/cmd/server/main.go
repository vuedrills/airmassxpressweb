package main

import (
	"log"

	"backend/internal/api/router"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Initialize routes
	router.SetupRoutes(r)

	log.Println("Server starting on port 8081...")
	if err := r.Run(":8081"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
