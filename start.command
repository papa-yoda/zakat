#!/bin/bash
cd "$(dirname "$0")"

ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
  BINARY="./zakat-darwin-arm64"
elif [ "$ARCH" = "x86_64" ]; then
  BINARY="./zakat-darwin-amd64"
else
  BINARY="./zakat"
fi

# Fall back to generic name
if [ ! -f "$BINARY" ]; then
  BINARY="./zakat"
fi

# Read port from .env
PORT=8080
if [ -f .env ]; then
  PORT=$(grep -E '^PORT=' .env | cut -d= -f2 | tr -d '[:space:]"'"'"'')
  PORT=${PORT:-8080}
fi

# Open browser after a short delay
(sleep 2 && open "http://localhost:$PORT") &

echo "Starting Zakat Calculator on http://localhost:$PORT"
echo "Press Ctrl+C to stop."
echo ""
"$BINARY"

echo ""
echo "Server stopped. Press any key to close."
read -n 1
