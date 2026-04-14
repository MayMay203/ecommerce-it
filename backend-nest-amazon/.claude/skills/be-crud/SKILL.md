---
name: be-crud
description: >
  Generate CRUD for a backend feature/entity. Creates entity, controller, 
  service, repository, DTOs, and module following project conventions.
  Use when user says "create crud", "add feature", "generate entity",
  "tạo crud", or wants to add new backend feature.
argument-hint: "[feature-name]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# Generate Backend CRUD

**Scope:** Creates complete CRUD for one feature/entity.

## Pre-flight Checks

1. **Argument provided?** Feature name required (e.g., `product`, `order`, `auth`)
2. **Project initialized?** Check `src/features/` folder exists
   - If not → Suggest: "Run `/init-base backend` first"
3. **Feature already exists?** Check `src/features/{feature-name}/`
   - If exists → Ask: "Feature exists. Add to it or overwrite?"

---

## Required Reading (READ FIRST)

| Doc | What to look for |
|-----|------------------|
| `01-share-docs/DATABASE.md` | Entity schema, columns, relationships, naming conventions |
| `01-share-docs/API_SPEC.md` | Endpoints, request/response format, error codes |
| `backend-nest-hoidanit/docs/BE-PROJECT-RULES.md` | Coding patterns, anti-patterns, naming conventions |
| `backend-nest-hoidanit/docs/BE-ARCHITECTURE.md` | Folder structure, file organization |

---

## Workflow

### Step 1: Gather Information

Ask user (if not clear from context):
- Entity name (singular): `Product`, `Order`, `User`
- Fields/columns (or reference DATABASE.md)
- Relationships (belongs to, has many)
- Need authentication? Which endpoints?

### Step 2: Check Existing Code

- Read existing entities in `src/features/` for patterns
- Check how other features structure their files
- Follow the same patterns exactly

### Step 3: Generate Files

Create in order:

```
src/features/{feature-name}/
├── {feature}.module.ts
├── {feature}.controller.ts
├── {feature}.service.ts
├── repositories/
│   └── {entity}.repository.ts
├── entities/
│   └── {entity}.entity.ts
├── dto/
│   ├── create-{entity}.dto.ts
│   ├── update-{entity}.dto.ts
│   └── query-{entity}.dto.ts (if needed)
├── types/
│   └── {feature}.types.ts (if needed)
└── CONTEXT.md (brief feature documentation)
```

### Step 4: Implement Each File

**Entity:** Follow DATABASE.md schema exactly
- Use TypeORM decorators
- Define relationships
- Add indexes per DATABASE.md

**DTOs:** Follow API_SPEC.md
- class-validator decorators
- Proper types (no `any`)

**Repository:** Complex queries only
- Simple queries stay in service

**Service:** Business logic
- Use repository for data access
- Proper error handling with NestJS exceptions

**Controller:** Routing + validation
- RESTful endpoints per API_SPEC.md
- Swagger decorators
- Response transformation

**Module:** Wire everything
- Import dependencies
- Export if needed by other features

### Step 5: Register Module

Update `app.module.ts`:
- Import new feature module
- Add to imports array

---

## Output

```
✅ Feature "{feature-name}" created!

📁 Files created:
- src/features/{feature-name}/
  ├── {feature}.module.ts
  ├── {feature}.controller.ts
  ├── {feature}.service.ts
  ├── repositories/{entity}.repository.ts
  ├── entities/{entity}.entity.ts
  ├── dto/create-{entity}.dto.ts
  ├── dto/update-{entity}.dto.ts
  └── CONTEXT.md

📝 Updated:
- src/app.module.ts (added import)

🚀 Next steps:
1. Review generated code
2. Run `npm run start:dev` to verify
3. Test endpoints with Postman/Thunder Client
4. Run `/be-test {feature-name}` to generate tests
```

---

## Important Rules

1. **Follow existing patterns** - Read other features first
2. **Match DATABASE.md exactly** - Column names, types, relationships
3. **Match API_SPEC.md exactly** - Endpoints, response format
4. **No `any` types** - Use proper TypeScript types
5. **Validation in DTOs** - Use class-validator
6. **Error handling** - Use NestJS built-in exceptions

## Error Handling

| Error | Action |
|-------|--------|
| Missing feature name | Ask: "Which feature? e.g., `/be-crud product`" |
| DATABASE.md not found | Ask user for entity schema |
| Feature already exists | Ask: "Overwrite or add to existing?" |
