---
name: fe-crud
description: >
  Generate CRUD for a frontend feature. Creates pages, components, hooks,
  services, and types following project conventions.
  Use when user says "create crud", "add feature", "generate pages",
  "tạo crud", or wants to add new frontend feature.
argument-hint: "[feature-name]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
---

# Generate Frontend CRUD

**Scope:** Creates complete CRUD UI for one feature.

## Pre-flight Checks

1. **Argument provided?** Feature name required (e.g., `product`, `order`, `auth`)
2. **Project initialized?** Check `src/features/` folder exists
   - If not → Suggest: "Run `/init-base frontend` first"
3. **Feature already exists?** Check `src/features/{feature-name}/`
   - If exists → Ask: "Feature exists. Add to it or overwrite?"

---

## Required Reading (READ FIRST)

| Doc | What to look for |
|-----|------------------|
| `01-share-docs/API_SPEC.md` | Endpoints to call, request/response format |
| `frontend-react-hoidanit/docs/FE-PROJECT-RULES.md` | Coding patterns, state management rules |
| `frontend-react-hoidanit/docs/FE-ARCHITECTURE.md` | Folder structure, component organization |

---

## Workflow

### Step 1: Gather Information

Ask user (if not clear from context):
- Feature name: `product`, `order`, `user`
- Which pages needed? (list, detail, create, edit)
- Need admin pages too?
- Any special UI requirements?

### Step 2: Check Existing Code

- Read existing features in `src/features/` for patterns
- Check shared components available
- Follow the same patterns exactly

### Step 3: Summary & Confirmation (REQUIRED — do NOT skip)

Before writing any file, present the full plan and **wait for user confirmation**.

Output format:
```
📋 Plan for feature "{feature-name}"

📁 Files to be CREATED:
- src/features/{feature-name}/index.ts
- src/features/{feature-name}/types/{feature}.types.ts
- src/features/{feature-name}/services/{feature}.service.ts
- src/features/{feature-name}/hooks/use{Feature}s.ts
- src/features/{feature-name}/hooks/use{Feature}.ts
- src/features/{feature-name}/hooks/useCreate{Feature}.ts
- src/features/{feature-name}/hooks/useUpdate{Feature}.ts
- src/features/{feature-name}/hooks/useDelete{Feature}.ts
- src/features/{feature-name}/components/{Feature}List.tsx
- src/features/{feature-name}/components/{Feature}Card.tsx
- src/features/{feature-name}/components/{Feature}Form.tsx
- src/features/{feature-name}/components/{Feature}Detail.tsx
- src/features/{feature-name}/pages/{Feature}ListPage.tsx
- src/features/{feature-name}/pages/{Feature}DetailPage.tsx
- src/features/{feature-name}/pages/{Feature}CreatePage.tsx  (if applicable)
- src/features/{feature-name}/pages/{Feature}EditPage.tsx    (if applicable)

📝 Files to be UPDATED:
- src/routes/routes.ts   → add route constants
- src/routes/index.tsx   → add route entries

⚠️  {N} files will be created, {M} files will be updated.

Proceed? (yes / no / adjust)
```

**Rules:**
- Do NOT create or edit any file before the user replies "yes" (or equivalent affirmative)
- If user says "no" → stop and ask what to change
- If user says "adjust" / requests changes → update the plan and show it again
- Only after explicit approval → proceed to Step 4

### Step 4: Generate Files

Create in order:

```
src/features/{feature-name}/
├── index.ts                          # Barrel exports
├── components/
│   ├── {Feature}List.tsx            # List/table component
│   ├── {Feature}Card.tsx            # Card item component
│   ├── {Feature}Form.tsx            # Create/Edit form
│   ├── {Feature}Detail.tsx          # Detail view
│   └── {Feature}Filters.tsx         # Filter/search (if needed)
├── pages/
│   ├── {Feature}ListPage.tsx        # List page
│   ├── {Feature}DetailPage.tsx      # Detail page
│   ├── {Feature}CreatePage.tsx      # Create page (if needed)
│   └── {Feature}EditPage.tsx        # Edit page (if needed)
├── hooks/
│   ├── use{Feature}s.ts             # List query hook
│   ├── use{Feature}.ts              # Single item query hook
│   ├── useCreate{Feature}.ts        # Create mutation hook
│   ├── useUpdate{Feature}.ts        # Update mutation hook
│   └── useDelete{Feature}.ts        # Delete mutation hook
├── services/
│   └── {feature}.service.ts         # API calls
└── types/
    └── {feature}.types.ts           # TypeScript types
```

### Step 5: Implement Each Layer

**Types:** Match API_SPEC.md response
```typescript
interface Product {
  id: number;
  name: string;
  // ... from API_SPEC.md
}
```

**Service:** API calls using shared axios
```typescript
export const productService = {
  getAll: (params) => axios.get('/products', { params }),
  getById: (id) => axios.get(`/products/${id}`),
  create: (data) => axios.post('/products', data),
  update: (id, data) => axios.patch(`/products/${id}`, data),
  delete: (id) => axios.delete(`/products/${id}`),
};
```

**Hooks:** TanStack Query wrappers
```typescript
export const useProducts = (params) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  });
};
```

**Components:** Reusable UI pieces
- Use shared components from `src/shared/components/`
- Tailwind CSS for styling
- Handle loading, error, empty states

**Pages:** Connect everything
- Use hooks for data
- Handle routing params
- Minimal logic (delegate to components)

### Step 6: Add Routes

Update `src/routes/`:
- Add route constants to `routes.ts`
- Add routes to router config
- Add to navigation (if applicable)

---

## Output

```
✅ Feature "{feature-name}" created!

📁 Files created:
- src/features/{feature-name}/
  ├── index.ts
  ├── components/
  │   ├── {Feature}List.tsx
  │   ├── {Feature}Card.tsx
  │   └── {Feature}Form.tsx
  ├── pages/
  │   ├── {Feature}ListPage.tsx
  │   └── {Feature}DetailPage.tsx
  ├── hooks/
  │   ├── use{Feature}s.ts
  │   └── use{Feature}.ts
  ├── services/{feature}.service.ts
  └── types/{feature}.types.ts

📝 Updated:
- src/routes/routes.ts (added constants)
- src/routes/index.tsx (added routes)

🚀 Next steps:
1. Review generated code
2. Run `npm run dev` to verify
3. Navigate to /{feature} to test
4. Run `/fe-test {feature}` to generate tests
```

---

## Important Rules

1. **Follow existing patterns** - Read other features first
2. **Match API_SPEC.md** - Types match API response exactly
3. **Use TanStack Query** - No useEffect for data fetching
4. **Use shared components** - Don't reinvent Button, Input, Modal
5. **Handle all states** - Loading, error, empty, success
6. **No `any` types** - Proper TypeScript types

## Error Handling

| Error | Action |
|-------|--------|
| Missing feature name | Ask: "Which feature? e.g., `/fe-crud product`" |
| API_SPEC.md not found | Ask user for endpoint details |
| Feature already exists | Ask: "Overwrite or add to existing?" |
| Backend not ready | Can still generate with mock types |
