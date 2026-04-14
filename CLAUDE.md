# Project: hoidanit-ecommerce

## Overview
A full-featured e-commerce platform inspired by Amazon. This project demonstrates building a complete online shopping experience including product catalog, user authentication, shopping cart, checkout process, order management, and admin dashboard.

## Tech Stack
  - Frontend: React 19/Vite, TypeScript
  - Backend: NestJS v11, TypeScript
  - Database: MySQL

## Structure
```
├── frontend/    → @frontend-react-hoidanit/CLAUDE.md
├── backend/     → @backend-nest-hoidanit/CLAUDE.md
└── 01-share-docs/        → Shared documentation
```

## Shared Docs
- @01-share-docs/API_SPEC.md
- @01-share-docs/DATABASE.md

## Available Skills

### Project Setup
- `/init-base [backend|frontend]` - Setup project architecture & environment

### Feature Development
- `/be-crud [feature]` - Generate backend CRUD (entity, controller, service, dto)
- `/fe-crud [feature]` - Generate frontend CRUD (pages, components, hooks)
- `/be-test [feature]` - Write backend tests (unit + integration)
- `/fe-test [feature]` - Write frontend tests (component + hook)

### Skill Routing
When user asks to:
- "tạo feature", "add entity", "generate crud" → Use `/be-crud` or `/fe-crud`
- "viết test", "add tests" → Use `/be-test` or `/fe-test`
- "init project", "setup structure" → Use `/init-base`

### Important
- Always read the skill's required docs BEFORE generating code
- Follow existing patterns in codebase
- Do NOT create feature code when running `/init-base`