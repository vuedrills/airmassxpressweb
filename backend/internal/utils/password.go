package utils

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

const (
	saltLength = 16
	keyLength  = 32
	argonTime  = 1
	memory     = 64 * 1024
	threads    = 4
)

// HashPassword generates a secure hash of the password using Argon2
func HashPassword(password string) (string, error) {
	salt := make([]byte, saltLength)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}

	hash := argon2.IDKey([]byte(password), salt, argonTime, memory, threads, keyLength)

	// Format: $argon2id$salt$hash
	encodedSalt := base64.RawStdEncoding.EncodeToString(salt)
	encodedHash := base64.RawStdEncoding.EncodeToString(hash)

	return fmt.Sprintf("$argon2id$%s$%s", encodedSalt, encodedHash), nil
}

// VerifyPassword checks if the provided password matches the hash
func VerifyPassword(password, encoded string) (bool, error) {
	parts := strings.Split(encoded, "$")
	if len(parts) != 4 || parts[1] != "argon2id" {
		return false, fmt.Errorf("invalid hash format")
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[2])
	if err != nil {
		return false, err
	}

	expectedHash, err := base64.RawStdEncoding.DecodeString(parts[3])
	if err != nil {
		return false, err
	}

	hash := argon2.IDKey([]byte(password), salt, argonTime, memory, threads, keyLength)

	if len(hash) != len(expectedHash) {
		return false, nil
	}

	for i := range hash {
		if hash[i] != expectedHash[i] {
			return false, nil
		}
	}

	return true, nil
}
