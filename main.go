package main

import (
	"bufio"
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"zakat/internal/server"
	"zakat/internal/store"
)

//go:embed all:web/dist
var embeddedFiles embed.FS

func main() {
	loadDotEnv(".env")

	dbPath := "data/zakat.db"
	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatal(err)
	}

	s, err := store.NewSQLiteStore(dbPath)
	if err != nil {
		log.Fatal(err)
	}

	// Strip the "web/dist" prefix so the FS root is the dist directory
	distFS, err := fs.Sub(embeddedFiles, "web/dist")
	if err != nil {
		log.Fatal(err)
	}

	handler := server.New(s, distFS)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	addr := "0.0.0.0:" + port
	fmt.Printf("Zakat calculator listening on %s\n", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}

// loadDotEnv reads a .env file and sets any key=value pairs as environment
// variables, skipping keys that are already set in the environment.
func loadDotEnv(path string) {
	f, err := os.Open(path)
	if err != nil {
		return // .env is optional
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		key, value, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		key = strings.TrimSpace(key)
		value = strings.Trim(strings.TrimSpace(value), `"'`)
		if key != "" && os.Getenv(key) == "" {
			os.Setenv(key, value)
		}
	}
}
