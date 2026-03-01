.PHONY: dev build run clean release release-clean gh-pages

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

# Build release zips for all platforms
release: clean
	cd web && npm run build
	mkdir -p release
	# macOS ARM64
	GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -o release/zakat-darwin-arm64 .
	cd release && mkdir -p zakat-macos-arm64 && cp zakat-darwin-arm64 zakat-macos-arm64/zakat && cp ../start.command zakat-macos-arm64/ && chmod +x zakat-macos-arm64/start.command && cp ../.env.example zakat-macos-arm64/.env && zip -r zakat-macos-arm64.zip zakat-macos-arm64 && rm -rf zakat-macos-arm64 zakat-darwin-arm64
	# macOS AMD64
	GOOS=darwin GOARCH=amd64 CGO_ENABLED=0 go build -o release/zakat-darwin-amd64 .
	cd release && mkdir -p zakat-macos-amd64 && cp zakat-darwin-amd64 zakat-macos-amd64/zakat && cp ../start.command zakat-macos-amd64/ && chmod +x zakat-macos-amd64/start.command && cp ../.env.example zakat-macos-amd64/.env && zip -r zakat-macos-amd64.zip zakat-macos-amd64 && rm -rf zakat-macos-amd64 zakat-darwin-amd64
	# Windows AMD64
	GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -o release/zakat.exe .
	cd release && mkdir -p zakat-windows-amd64 && cp zakat.exe zakat-windows-amd64/ && cp ../start.bat zakat-windows-amd64/ && cp ../.env.example zakat-windows-amd64/.env && zip -r zakat-windows-amd64.zip zakat-windows-amd64 && rm -rf zakat-windows-amd64 zakat.exe
	# Linux AMD64
	GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o release/zakat-linux .
	cd release && mkdir -p zakat-linux-amd64 && cp zakat-linux zakat-linux-amd64/zakat && cp ../.env.example zakat-linux-amd64/.env && zip -r zakat-linux-amd64.zip zakat-linux-amd64 && rm -rf zakat-linux-amd64 zakat-linux
	@echo "Release zips created in release/"

# Remove release artifacts
release-clean:
	rm -rf release

# Build and deploy lite version to gh-pages
gh-pages:
	cd web && VITE_MODE=lite npm run build -- --base=/zakat/
	@echo "Lite build ready in web/dist/ — deploy to gh-pages branch"
