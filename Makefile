.PHONY: dev build run clean

# Run backend in dev mode (frontend: cd web && npm run dev)
dev:
	go run .

# Build production binary (frontend must be built first)
build:
	cd web && npm run build
	CGO_ENABLED=0 go build -o zakat .

# Run the built binary
run:
	./zakat

# Remove build artifacts
clean:
	rm -f zakat
	rm -rf web/dist
