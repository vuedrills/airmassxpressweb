package main

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"golang.org/x/crypto/argon2"
)

const (
	saltLength = 16
	keyLength  = 32
	argonTime  = 1
	memory     = 64 * 1024
	threads    = 4
)

func main() {
	password := "12345678"

	salt := make([]byte, saltLength)
	rand.Read(salt)

	hash := argon2.IDKey([]byte(password), salt, argonTime, memory, threads, keyLength)

	encodedSalt := base64.RawStdEncoding.EncodeToString(salt)
	encodedHash := base64.RawStdEncoding.EncodeToString(hash)

	fmt.Printf("$argon2id$%s$%s\n", encodedSalt, encodedHash)
}
