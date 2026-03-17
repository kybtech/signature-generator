# Email Signature Generator

A TypeScript/React single-page application for generating professional email signatures for Trusted Carrier Logistik GmbH employees.

## Features

- **Interactive Form**: Fill in your personal details (name, title, phone, email)
- **Optional Photo Upload**: Add a personal photo to your signature
- **Live Preview**: See your signature update in real-time
- **Copy to Clipboard**: One-click copy of HTML signature
- **Download HTML**: Save signature as an HTML file
- **Email-Ready**: All images inlined as data URIs for email client compatibility

## Prerequisites

- Node.js 18+
- npm 9+
- Make (for running development commands)

## Quick Start

```bash
# Install dependencies
make install

# Start development server
make dev

# Open browser to http://localhost:5173
```

## Available Make Commands

### Setup & Installation

- `make all` - Complete project setup (install + hooks)
- `make install` - Install npm dependencies
- `make setup` - Alias for install

### Development

- `make dev` - Start Vite development server
- `make build` - Build production bundle
- `make preview` - Preview production build locally
- `make format` - Auto-format code with Prettier
- `make format-check` - Check code formatting
- `make lint` - Run ESLint
- `make lint-fix` - Run ESLint with auto-fix
- `make type-check` - Run TypeScript type checking

### Testing

- `make test` - Run all tests once
- `make test-watch` - Run tests in watch mode
- `make test-ui` - Run tests with UI
- `make test-cov` - Run tests with coverage
- `make test-fast` - Run fast tests only (for pre-commit)

### Pre-commit Hooks

- `make hooks` - Install pre-commit hooks
- `make run-hooks` - Run pre-commit hooks on all files
- `make update-hooks` - Update pre-commit hooks to latest versions

**IMPORTANT**: NEVER use `git commit --no-verify`. Pre-commit hooks (including fast tests) MUST always run. This is the "no broken windows" policy.

### Deployment

- `make deploy` - Build and deploy to GitHub Pages

### Cleanup

- `make clean` - Remove node_modules and build artifacts
- `make clean-all` - Remove everything including package-lock.json

### Help

- `make help` - Display all available commands with descriptions

## Development Workflow

1. **First time setup**: `make all`
2. **Start dev server**: `make dev`
3. **Make changes**: Edit code in `src/`
4. **Run tests**: `make test` (TDD: write tests first!)
5. **Format & lint**: `make format && make lint`
6. **Type check**: `make type-check`
7. **Commit**: Git hooks will run automatically (tests, lint, type check)

## Project Structure

```
.
├── src/
│   ├── components/          # React components
│   │   ├── SignatureForm.tsx       # User input form
│   │   ├── SignaturePreview.tsx    # Live signature preview
│   │   └── SignatureOutput.tsx     # Copy/download controls
│   ├── utils/               # Utility functions
│   │   ├── signatureTemplate.ts    # HTML generation
│   │   ├── imageUtils.ts           # Image to data URI conversion
│   │   ├── clipboardUtils.ts       # Clipboard operations
│   │   └── assetsLoader.ts         # Load company assets
│   ├── assets/              # Company assets (logos, icons)
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── tests/
│   ├── unit/                # Unit tests
│   ├── integration/         # Integration tests
│   └── fixtures/            # Test data
├── public/                  # Static assets
├── dist/                    # Build output (generated)
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest test configuration
├── .pre-commit-config.yaml  # Pre-commit hooks configuration
├── .github/workflows/       # GitHub Actions workflows
└── Makefile                 # Development commands
```

## How to Use the Generated Signature

1. **Fill in the form** with your personal details
2. **Upload a photo** (optional, PNG/JPEG/SVG, max 5MB)
3. **Preview** the signature in real-time
4. **Copy to clipboard** or **download as HTML**
5. **Paste into your email client**:
   - **Gmail**: Settings → See all settings → General → Signature
   - **Outlook**: File → Options → Mail → Signatures
   - **Apple Mail**: Preferences → Signatures

## Testing

This project follows Test-Driven Development (TDD):

- **Write tests first**, then implementation
- **Fast tests** in pre-commit hooks (unit tests < 5s each)
- **Integration tests** run separately or in CI
- **Coverage target**: >80%

### Test Categories

- **Unit Tests**: `tests/unit/` - Fast, isolated function tests
- **Integration Tests**: `tests/integration/` - Component and full app tests
- **Slow Tests**: Marked in filenames (`*.slow.test.ts`) - excluded from pre-commit

### Running Tests

```bash
make test           # All tests
make test-fast      # Fast tests only (pre-commit)
make test-watch     # Watch mode for TDD
make test-cov       # With coverage report
```

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Live URL**: `https://[username].github.io/signature-generator/`

### Manual Deployment

```bash
make deploy
```

This will:
1. Build the production bundle
2. Push to `gh-pages` branch
3. Trigger GitHub Pages deployment

## Code Style

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (120 char line length)
- **Pre-commit**: Prettier, ESLint, fast tests, type check

## License

Proprietary.

## Contributing

1. Fork the repository
2. Create a feature branch
3. **Write tests first** (TDD workflow)
4. Implement the feature
5. Run `make test && make format && make lint && make type-check`
6. Commit (pre-commit hooks will run automatically)
7. Push and submit a pull request
