# Makefile for TypeScript/React Project with npm
# ==============================================

# Configuration
# -------------
NPM := npm
PROJECT_NAME := signature-generator
NODE_MODULES := node_modules

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Phony targets (not files)
.PHONY: help install setup dev build preview lint format test test-watch test-ui test-cov test-fast type-check hooks run-hooks clean deploy all

## help: Display this help message
help:
	@echo "$(BLUE)Available targets:$(NC)"
	@grep -E '^## ' $(MAKEFILE_LIST) | sed -e 's/## //' | awk 'BEGIN {FS = ":"}{printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

## all: Run complete setup (install + hooks)
all: install hooks
	@echo "$(GREEN)✓ Project setup complete!$(NC)"

## install: Install npm dependencies
install:
	@echo "$(BLUE)Installing dependencies...$(NC)"
	$(NPM) install
	@echo "$(GREEN)✓ Dependencies installed$(NC)"

## setup: Alias for install
setup: install

## dev: Start development server
dev: $(NODE_MODULES)
	@echo "$(BLUE)Starting development server...$(NC)"
	$(NPM) run dev

## build: Build production artifacts
build: $(NODE_MODULES)
	@echo "$(BLUE)Building production bundle...$(NC)"
	$(NPM) run build
	@echo "$(GREEN)✓ Build complete$(NC)"

## preview: Preview production build locally
preview: $(NODE_MODULES)
	@echo "$(BLUE)Starting preview server...$(NC)"
	$(NPM) run preview

## lint: Run ESLint
lint: $(NODE_MODULES)
	@echo "$(BLUE)Running ESLint...$(NC)"
	$(NPM) run lint

## lint-fix: Run ESLint with auto-fix
lint-fix: $(NODE_MODULES)
	@echo "$(BLUE)Running ESLint with auto-fix...$(NC)"
	$(NPM) run lint:fix

## format: Run Prettier formatter
format: $(NODE_MODULES)
	@echo "$(BLUE)Running Prettier...$(NC)"
	$(NPM) run format

## format-check: Check code formatting
format-check: $(NODE_MODULES)
	@echo "$(BLUE)Checking code formatting...$(NC)"
	$(NPM) run format:check

## test: Run all tests once
test: $(NODE_MODULES)
	@echo "$(BLUE)Running tests...$(NC)"
	$(NPM) run test

## test-watch: Run tests in watch mode
test-watch: $(NODE_MODULES)
	@echo "$(BLUE)Running tests in watch mode...$(NC)"
	$(NPM) run test:watch

## test-ui: Run tests with UI
test-ui: $(NODE_MODULES)
	@echo "$(BLUE)Running tests with UI...$(NC)"
	$(NPM) run test:ui

## test-cov: Run tests with coverage
test-cov: $(NODE_MODULES)
	@echo "$(BLUE)Running tests with coverage...$(NC)"
	$(NPM) run test:coverage

## test-fast: Run fast tests only (for pre-commit)
test-fast: $(NODE_MODULES)
	@echo "$(BLUE)Running fast tests...$(NC)"
	$(NPM) run test:fast

## type-check: Run TypeScript type checking
type-check: $(NODE_MODULES)
	@echo "$(BLUE)Running TypeScript type check...$(NC)"
	$(NPM) run type-check

## hooks: Install pre-commit hooks
hooks:
	@echo "$(BLUE)Installing pre-commit hooks...$(NC)"
	@if ! command -v pre-commit >/dev/null 2>&1; then \
		echo "$(RED)Error: pre-commit not found. Install with: pip install pre-commit$(NC)"; \
		exit 1; \
	fi
	pre-commit install
	@echo "$(GREEN)✓ Pre-commit hooks installed$(NC)"

## run-hooks: Run pre-commit hooks on all files
run-hooks:
	@echo "$(BLUE)Running pre-commit on all files...$(NC)"
	pre-commit run --all-files

## update-hooks: Update pre-commit hooks to latest versions
update-hooks:
	@echo "$(BLUE)Updating pre-commit hooks...$(NC)"
	pre-commit autoupdate
	@echo "$(GREEN)✓ Hooks updated$(NC)"

## deploy: Build and deploy to GitHub Pages
deploy: build
	@echo "$(BLUE)Deploying to GitHub Pages...$(NC)"
	@echo "$(BLUE)Setting up worktree...$(NC)"
	@git worktree add gh-pages-deploy gh-pages 2>/dev/null || (git worktree remove gh-pages-deploy 2>/dev/null; git worktree add gh-pages-deploy gh-pages)
	@echo "$(BLUE)Copying build files...$(NC)"
	@rm -rf gh-pages-deploy/*
	@cp -r dist/* gh-pages-deploy/
	@echo "$(BLUE)Committing and pushing...$(NC)"
	@cd gh-pages-deploy && PRE_COMMIT_ALLOW_NO_CONFIG=1 git add . && PRE_COMMIT_ALLOW_NO_CONFIG=1 git commit -m "Deploy $(shell date +%Y-%m-%d-%H:%M:%S)" && git push origin gh-pages
	@git worktree remove gh-pages-deploy
	@echo "$(GREEN)✓ Deployed to GitHub Pages$(NC)"

## clean: Remove node_modules and build artifacts
clean:
	@echo "$(RED)Cleaning up...$(NC)"
	rm -rf $(NODE_MODULES)
	rm -rf dist
	rm -rf coverage
	rm -rf .vitest
	@echo "$(GREEN)✓ Cleanup complete$(NC)"

## clean-all: Remove everything including lock file
clean-all: clean
	@echo "$(RED)Removing package-lock.json...$(NC)"
	rm -f package-lock.json

$(NODE_MODULES):
	@echo "$(BLUE)node_modules not found. Running npm install...$(NC)"
	$(NPM) install
