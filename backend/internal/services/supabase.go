package services

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"

	"github.com/airmassxpress/backend/internal/config"
)

type SupabaseService struct {
	cfg *config.Config
}

func NewSupabaseService(cfg *config.Config) *SupabaseService {
	return &SupabaseService{cfg: cfg}
}

// UploadFile uploads a file to Supabase Storage and returns the public URL
func (s *SupabaseService) UploadFile(fileHeader *multipart.FileHeader, bucket, path string) (string, error) {
	// Open the uploaded file
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer file.Close()

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Prepare request to Supabase Storage API
	// POST /storage/v1/object/{bucket}/{path}
	url := fmt.Sprintf("%s/storage/v1/object/%s/%s", s.cfg.Supabase.URL, bucket, path)

	req, err := http.NewRequest("POST", url, bytes.NewReader(fileBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Authorization", "Bearer "+s.cfg.Supabase.Key)
	req.Header.Set("Content-Type", fileHeader.Header.Get("Content-Type"))
	// upsert equivalent in header? x-upsert
	req.Header.Set("x-upsert", "true")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("supabase api error (status %d): %s", resp.StatusCode, string(body))
	}

	// Construct Public URL
	// {supabaseUrl}/storage/v1/object/public/{bucket}/{path}
	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", s.cfg.Supabase.URL, bucket, path)
	return publicURL, nil
}
