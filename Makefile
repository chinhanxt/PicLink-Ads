.PHONY: dev build start install clean help

# Default target runs development server
dev:
	npm run dev

# Build the Next.js production app
build:
	npm run build

# Start production server
start:
	npm run start

# Install node dependencies
install:
	npm install

# Clean build artifacts
clean:
	rm -rf .next

# Show help
help:
	@echo "PicLink Ads Commands:"
	@echo "  make dev      - Start Next.js dev server"
	@echo "  make build    - Build production bundle"
	@echo "  make start    - Start production server"
	@echo "  make install  - Install npm dependencies"
	@echo "  make clean    - Remove build cache (.next)"
