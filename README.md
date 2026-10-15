# Tulsi Swaraj E-commerce Platform

A modular TypeScript monorepo for the **Tulsi Swaraj** direct-to-customer e-commerce platform, powered by Node.js/Express, PostgreSQL, and PhonePe Payment Gateway.

## Monorepo Structure

```text
.
├── apps/
│   ├── web/                    # [Placeholder] Existing customer storefront (paste prototype here)
│   ├── api/                    # [To be configured] Node + Express backend API
│   └── README.md
├── packages/
│   ├── contracts/              # Shared request/response schemas & Zod DTOs
│   ├── config/                 # Shared TypeScript & tool configurations
│   ├── ui/                     # Optional shared UI components
│   └── utils/                  # Framework-independent utilities (currency, formatters)
├── docs/
│   ├── prd.md                  # Product Requirements Document
│   └── architecture.md         # Technical Architecture Document
├── scripts/                    # Development, seed, and maintenance scripts
├── .env.example                # Canonical environment variables template
├── .gitignore                  # Monorepo git ignore rules
├── package.json                # Root workspace configuration
├── pnpm-workspace.yaml         # pnpm workspace package definitions
├── tsconfig.base.json          # Shared compiler options
└── README.md
```

## Getting Started

1. **Install Dependencies:**
   ```bash
   pnpm install
   ```

2. **Build Shared Packages:**
   ```bash
   pnpm build
   ```

3. **Frontend Integration:**
   Paste your existing frontend prototype into `apps/web` (or root as configured), after which we will connect it to the shared contracts and backend API.

## Documentation

- [PRD (Product Requirements)](docs/prd.md)
- [Technical Architecture](docs/architecture.md)
