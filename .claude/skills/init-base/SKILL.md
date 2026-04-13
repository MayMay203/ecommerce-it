---
name: init-base
description: >
  Setup project architecture and environment for existing backend or frontend.
  Creates folder structure (feature-based), installs dependencies, configures
  environment.
  Use when user says "init backend", "init frontend", "setup structure",
  "scaffold project", or "setup environment".
argument-hint: "[frontend|backend]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# Setup Project Architecture & Environment

**Scope:** Structure + Dependencies + Configs only. NO feature code.

This skill sets up:
- ✅ Folder structure (feature-based architecture)
- ✅ Dependencies installation
- ✅ Config files (.env, tsconfig, linting, etc.)
- ✅ Core/Shared modules (empty or minimal setup)
- ❌ NOT feature code (use `/be-crud` or `/fe-crud` later)

## Pre-flight Checks

1. **Argument provided?** Must be `frontend` or `backend`
2. **Target directory exists?**
   - Backend: `backend-nest-hoidanit/`
   - Frontend: `frontend-react-hoidanit/`
3. **Project already initialized?** Check for `package.json`
   - If not exists → Error: "Project not found. Create project first."

---

## Task: Backend Scaffolding

### Required Reading (READ FIRST)

| Doc | Purpose |
|-----|---------|
| `01-share-docs/DATABASE.md` | Database schema, entity definitions, naming conventions |
| `01-share-docs/API_SPEC.md` | API endpoints, request/response formats |
| `backend-nest-hoidanit/docs/BE-PROJECT-RULES.md` | Coding conventions, patterns, anti-patterns |
| `backend-nest-hoidanit/docs/BE-ARCHITECTURE.md` | Folder structure, module organization |

### Workflow

1. Read all docs above to understand project conventions
2. Scan current project to see what already exists
3. **Install missing dependencies** (see below)
4. **Create folder structure** as defined in `BE-ARCHITECTURE.md`:
   - Create empty feature folders (e.g., `src/features/auth/`, `src/features/product/`)
   - Create core folders (`src/core/database/`, `src/core/logger/`)
   - Create shared folders (`src/shared/decorators/`, `src/shared/guards/`, etc.)
5. **Setup config files**:
   - `.env.example` with all required variables
   - Database config (connection setup only, no entities yet)
   - JWT config structure
   - Linting/Formatter configs
6. **Setup core modules** (minimal, ready-to-use):
   - Database module (TypeORM connection)
   - Logger module
   - Global exception filter
   - Transform interceptor
7. **Setup shared modules** (empty or with base types only):
   - Response types (`response.type.ts`, `pagination.type.ts`)
   - Base decorators structure
   - Base guards structure
8. **Update `main.ts`** with global pipes, filters, interceptors
9. Keep existing files intact - DO NOT overwrite

**NOT included (do later with `/be-crud`):**
- Entity definitions
- Controllers, Services, Repositories
- Feature-specific code

### Install Missing Dependencies

Check `package.json` and install if not present:

**Core dependencies:**
```bash
# Config
npm install @nestjs/config

# Database (TypeORM + MySQL)
npm install @nestjs/typeorm typeorm mysql2

# Validation
npm install class-validator class-transformer

# Authentication (if needed per docs)
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

**Dev dependencies:**
```bash
# Testing
npm install -D @nestjs/testing

# Linting (if not present)
npm install -D eslint prettier eslint-config-prettier
```

**Before installing:** 
- Read `package.json` first
- Only install what's missing
- List what will be installed and ask user to confirm

### Validation

- [ ] Folder structure matches `BE-ARCHITECTURE.md`
- [ ] All required dependencies installed
- [ ] `.env.example` has all required variables
- [ ] Database connection configured (not connected yet, just config)
- [ ] Global filters/interceptors registered in `main.ts`
- [ ] Run `npm run start:dev` → server starts without errors
- [ ] Project is ready to add features with `/be-crud`

---

## Task: Frontend Scaffolding

### Required Reading (READ FIRST)

| Doc | Purpose |
|-----|---------|
| `01-share-docs/API_SPEC.md` | API endpoints to consume |
| `frontend-react-hoidanit/docs/FE-PROJECT-RULES.md` | Coding conventions, state management rules |
| `frontend-react-hoidanit/docs/FE-ARCHITECTURE.md` | Folder structure, component organization |

### Workflow

1. Read all docs above to understand project conventions
2. Scan current project to see what already exists
3. **Install missing dependencies** (see below)
4. **Create folder structure** as defined in `FE-ARCHITECTURE.md`:
   - Create empty feature folders (e.g., `src/features/auth/`, `src/features/product/`)
   - Create shared folders (`src/shared/components/`, `src/shared/hooks/`, etc.)
   - Create layouts folder (`src/layouts/`)
   - Create routes folder (`src/routes/`)
5. **Setup config files**:
   - `.env.example` with API base URL, etc.
   - `tailwind.config.js` (if using Tailwind)
   - Path aliases in `tsconfig.json`
6. **Setup shared modules** (minimal, ready-to-use):
   - Axios instance with interceptors (`src/shared/lib/axios.ts`)
   - TanStack Query client (`src/shared/lib/queryClient.ts`)
   - Common types (`src/shared/types/`)
7. **Setup routing base**:
   - Route constants (`src/routes/routes.ts`)
   - Router setup (`src/routes/index.tsx`)
   - ProtectedRoute component (empty/placeholder)
8. **Setup layouts** (minimal structure):
   - MainLayout (basic wrapper)
   - AuthLayout (basic wrapper)
9. Keep existing files intact - DO NOT overwrite

**NOT included (do later with `/fe-crud`):**
- Feature components
- Feature pages
- Feature hooks/services

### Install Missing Dependencies

Check `package.json` and install if not present:

**Core dependencies:**
```bash
# Routing
npm install react-router

# State management - Server state
npm install @tanstack/react-query

# HTTP client
npm install axios

# Forms + Validation
npm install react-hook-form zod @hookform/resolvers

# State management - Client state (if needed)
npm install zustand
```

**Styling dependencies:**
```bash
# Tailwind CSS (if not present)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Icons (optional)
npm install lucide-react
```

**Dev dependencies:**
```bash
# Types
npm install -D @types/node

# Testing (if needed)
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Before installing:** 
- Read `package.json` first
- Only install what's missing
- List what will be installed and ask user to confirm

### Validation

- [ ] Folder structure matches `FE-ARCHITECTURE.md`
- [ ] All required dependencies installed
- [ ] `.env.example` has API base URL
- [ ] Axios instance configured with interceptors
- [ ] TanStack Query client configured
- [ ] Router setup with route constants
- [ ] Run `npm run dev` → app starts without errors
- [ ] Project is ready to add features with `/fe-crud`

---

## Output

After completion, provide:

```
✅ {Backend|Frontend} architecture setup complete!

📁 Location: ./{backend-nest-hoidanit|frontend-react-hoidanit}/

📦 Dependencies installed:
- [list newly installed packages]

📂 Folder structure created:
- src/features/ (empty, ready for features)
- src/core/ (database, logger setup)
- src/shared/ (types, utils ready)
- [other folders...]

⚙️  Configs created:
- .env.example
- [other config files...]

⚠️  Skipped (already exists):
- [list skipped items]

🚀 Next steps:
1. cp .env.example .env
2. Update .env with your settings  
3. npm run {start:dev|dev} to verify setup
4. Use /be-crud or /fe-crud to create features
```

---

## Important Rules

1. **DO NOT delete or overwrite existing files**
2. **Ask before modifying existing files** (like app.module.ts)
3. **Report what was skipped** so user knows what already existed
4. **Keep existing hello world code working**

## Error Handling

| Error | Action |
|-------|--------|
| Missing argument | Ask: "Which project? `/init-base backend` or `/init-base frontend`" |
| Doc file not found | List missing docs and ask user to create them first |
| Project not found | Error: "No package.json found. Is this the right directory?" |