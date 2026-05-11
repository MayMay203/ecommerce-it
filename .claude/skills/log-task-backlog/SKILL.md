---
name: log-task-backlog
description: >
  Log a task or feature request to Backlog (workspace5.backlog.com) from a basic design.
  Use when user says "log task", "thêm task", "tạo task backlog", "add feature",
  "tạo feature backlog", or wants to create a Task / Feature issue in Backlog.
argument-hint: "[title?]"
allowed-tools:
  - mcp__backlog__get_project_list
  - mcp__backlog__get_issue_types
  - mcp__backlog__get_priorities
  - mcp__backlog__get_users
  - mcp__backlog__add_issue
  - mcp__backlog__add_issue_comment
  - mcp__backlog__get_issue
---

# Log Task to Backlog

## Usage

```
/log-task-backlog                            → Interactive, prompts for all details
/log-task-backlog "Add payment page"         → Starts with title pre-filled
```

## Workflow

### Step 1 — Fetch context (parallel)

Call all three **in parallel**:
- `mcp__backlog__get_project_list` — to select project
- `mcp__backlog__get_priorities` — global, needed for Step 2
- `mcp__backlog__get_users` — needed for assignee in Step 2

- If only one project → auto-select it, inform the user.
- If multiple → show a numbered list and ask: **"Which project? (enter number)"**

After project is selected, call `mcp__backlog__get_issue_types` and show types
that are NOT "Bug" (e.g. Task, Feature Request, Improvement). Let user pick if
more than one non-bug type exists.

### Step 2 — Gather basic fields

Ask each field **one at a time**, waiting for the user's answer before moving to the next. Move to Step 3 only after all fields are collected.

**Field order:**

1. **Title** — Skip if already provided via argument. Otherwise ask:
   > "What is the task title?"

2. **Layer** — Ask:
   > "Layer? `Backend` | `Frontend` | `Both`"
   - `Backend` — API endpoints, database, business logic, services (NestJS)
   - `Frontend` — UI components, pages, hooks, state management (React)
   - `Both` — full-stack feature; sub-tasks will be split into BE and FE sections

3. **Type** — Ask (show only non-Bug types from the project):
   > "Type? `Task` | `Request` | `Other`"

4. **Priority** — Ask:
   > "Priority? `High` | `Normal` | `Low`"

5. **Assignee** — Show a numbered list from `mcp__backlog__get_users` and ask:
   > "Assignee? (enter number or type part of name, or `unassigned`)"
   - Accept a number, a fuzzy name match, or `"unassigned"` to skip.
   - If the input matches multiple users, show the matches and ask to pick by number.

### Step 3 — Basic design input

**First, check for an existing design file:**
- If the user opened a file under `Basic-Design/*.md` in the IDE (visible via `ide_opened_file` context) → read that file automatically and use it as the design input. Inform the user: _"Using design from `Basic-Design/<filename>.md`."_
- If the user referenced a `Basic-Design/*.md` path in their message → read that file.
- If **neither** is present → ask the user:

> **"Do you have a basic design document? If so, please open it in the IDE (Basic-Design/\*.md) or paste the path / content here:"**

Accept any free-form input — a rough paragraph, a copied design document,
a Slack message, or structured notes. The goal is to capture intent.

Once received, **auto-expand** it into a structured task description using the
layer-specific template below. Show the expanded version and ask:

> **"Does this description look correct? (yes / edit)"**

- `yes` → move to Step 4
- `edit` → ask what to change, update, re-show the expanded version

---

### Expansion Rules

Apply the template matching the selected **Layer**.

#### Layer: Backend

```
**Goal**: <one-sentence goal — start with a verb>

**Backend tasks**:
1. [DB]         <migration or table change — name tables and columns>
2. [Entity]     <TypeORM entity class(es) to create or update>
3. [DTO]        <request / response DTOs with class-validator decorators>
4. [Service]    <business logic method(s) — name the service and method>
5. [Controller] <endpoint(s) — HTTP method + path>
6. [Module]     <wire entity, service, controller into NestJS module>

**Acceptance criteria**:
- [ ] <API endpoint returns correct response for happy path>
- [ ] <validation rejects invalid input with 400>
- [ ] <business rule X is enforced>
- [ ] <DB migration runs without error>

**Notes**: <constraints, related issue keys, external API details>
```

#### Layer: Frontend

```
**Goal**: <one-sentence goal — start with a verb>

**Frontend tasks**:
1. [API]       <service function or React hook calling the backend endpoint>
2. [Component] <React component(s) to create — name them>
3. [Page]      <page/route that hosts the component, if new>
4. [State]     <local state, context, or store updates needed>
5. [UX]        <loading state, empty state, error handling in UI>
6. [Types]     <TypeScript interfaces / types for API response and props>

**Acceptance criteria**:
- [ ] <user can see / interact with X>
- [ ] <loading spinner shown while fetching>
- [ ] <error message displayed when API fails>
- [ ] <form validates required fields before submit>

**Notes**: <design references, API endpoint used, related tickets>
```

#### Layer: Both (full-stack)

Split into two ordered sections. BE must be completed before FE can start.

```
**Goal**: <one-sentence goal — start with a verb>

**Backend tasks**:
1. [DB]         <migration — name tables and columns>
2. [Entity]     <TypeORM entity class(es)>
3. [DTO]        <request / response DTOs>
4. [Service]    <business logic — name service and method>
5. [Controller] <endpoint(s) — HTTP method + path>
6. [Module]     <wire into NestJS module>

**Frontend tasks**:
1. [API]       <hook / service function for each endpoint>
2. [Component] <React component(s) — name them>
3. [Page]      <page/route, if new>
4. [State]     <state or context updates>
5. [UX]        <loading, empty, error states>
6. [Types]     <TypeScript interfaces>

**Acceptance criteria**:
- [ ] <API endpoint works end-to-end>
- [ ] <UI displays data correctly>
- [ ] <user action triggers correct API call>
- [ ] <error states handled in both BE and FE>

**Notes**: <constraints, dependencies, design doc link>
```

---

**General expansion rules (apply to all layers)**:
- **Goal**: one sentence, verb-first (Implement / Add / Create / Migrate / Expose).
- **Sub-tasks**: name the actual file, class, endpoint, or component — never use
  vague wording like "implement the feature" or "handle the logic".
- **Acceptance criteria**: user-facing outcomes or verifiable system behaviors only.
- **Notes**: only content the user explicitly mentioned — do not invent scope.
- If the basic design is too vague to derive sub-tasks, ask one clarifying
  question before expanding.

---

**Example** — Layer: Both, basic design from a payment feature doc:

```
**Goal**: Implement the payment method selection step at checkout, supporting
COD, bank transfer, VNPay, and MoMo with async webhook confirmation.

**Backend tasks**:
1. [DB]         Create `payment_method_configs` and `payment_transactions` tables;
                add `payment_method` snapshot column to `orders`
2. [Entity]     Create `PaymentMethodConfig` and `PaymentTransaction` TypeORM entities
3. [DTO]        Create `InitiatePaymentDto` (method, returnUrl) and
                `PaymentStatusDto` response
4. [Service]    Add `PaymentService` with `initiate()`, `handleWebhook()`,
                and `markPaid()` methods
5. [Controller] Expose `POST /orders/:id/pay`, `GET /orders/:id/payment`,
                `POST /webhooks/vnpay`, `POST /webhooks/momo`,
                `PATCH /admin/orders/:id/mark-paid`
6. [Module]     Wire `PaymentModule` with `PaymentService`, `PaymentController`,
                and both entities

**Frontend tasks**:
1. [API]       Create `usePaymentMethods()` hook (GET /payment-methods) and
               `initiatePayment()` service function (POST /orders/:id/pay)
2. [Component] Create `PaymentMethodSelector` component (radio list of methods)
               and `PaymentStatus` component (polls GET /orders/:id/payment)
3. [Page]      Add payment step to `CheckoutPage` after order summary
4. [State]     Track selected method and transaction status in checkout state
5. [UX]        Redirect to `paymentUrl` for VNPay/MoMo; show pending/success/fail
               states; loading skeleton while fetching methods
6. [Types]     Add `PaymentMethod`, `PaymentTransaction`, `InitiatePaymentResponse`
               interfaces

**Acceptance criteria**:
- [ ] Active payment methods are listed on the checkout payment step
- [ ] COD and bank transfer orders are created with status `pending`
- [ ] VNPay/MoMo orders redirect user to gateway URL
- [ ] Webhook updates transaction and order status correctly after HMAC verify
- [ ] Frontend polls and reflects final payment status (success / failed)
- [ ] Admin can toggle methods and manually confirm bank transfers

**Notes**: Webhook endpoints verify HMAC before any DB write.
           `gateway_response` is stored raw and never modified.
```

### Step 4 — Confirm before submitting

Display a formatted preview:

```
┌──────────────────────────────────────────────────┐
│  Project   : <project name>                      │
│  Type      : <Task | Feature Request | ...>      │
│  Priority  : <priority>                          │
│  Assignee  : <name | Unassigned>                 │
│  Title     : <title>                             │
├──────────────────────────────────────────────────┤
│  Description:                                    │
│  <full expanded description>                     │
└──────────────────────────────────────────────────┘
Submit? (yes / no / edit)
```

- `yes` → proceed to Step 5
- `no` → abort, inform user
- `edit` → ask which field to change, update it, re-show preview

### Step 5 — Create the issue

Call `mcp__backlog__add_issue` with:

| Field         | Value                                              |
|---------------|----------------------------------------------------|
| `projectId`   | Selected project ID                                |
| `summary`     | Title from Step 2                                  |
| `issueTypeId` | Selected issue type ID                             |
| `priorityId`  | Selected priority ID                               |
| `assigneeId`  | Selected user ID (omit field if unassigned)        |
| `description` | Expanded description from Step 3 (markdown)        |

### Step 6 — Display result

Call `mcp__backlog__get_issue` with the new issue ID and display:

```
✓ Task created successfully!

  Issue Key : <PROJECT-123>
  Title     : <title>
  Type      : <type>
  Priority  : <priority>
  Assignee  : <name | Unassigned>
  URL       : https://workspace5.backlog.com/view/<PROJECT-123>
```

If the user wants to add a comment, call `mcp__backlog__add_issue_comment`.

## Title Guidelines

- ❌ `"Add payment"`
- ✅ `"[BE][Checkout] Implement payment API with VNPay and MoMo webhook support"`
- ✅ `"[FE][Checkout] Build payment method selector and status polling UI"`
- ✅ `"[Checkout] Full-stack payment method selection (COD, bank transfer, VNPay, MoMo)"`
- Pattern: `[Layer][Module] Verb + what + key context`
  - Use `[BE]`, `[FE]`, or omit prefix for Both

## Priority Guide

| Priority | When to use                                          |
|----------|------------------------------------------------------|
| Critical | Blocking release, no workaround, critical path       |
| High     | Important feature, needed for next sprint            |
| Normal   | Standard task, has a defined timeline                |
| Low      | Nice-to-have, backlog candidate, low urgency         |

## Error Handling

| Situation                        | Action                                                         |
|----------------------------------|----------------------------------------------------------------|
| No projects found                | Inform user, check API key / permissions                       |
| No non-bug issue types           | Show all types, ask user to pick one                           |
| No users returned                | Skip assignee, set unassigned, warn user                       |
| Assignee name matches multiple   | Show matched names, ask to pick by number                      |
| Layer not specified              | Ask: "Is this Backend, Frontend, or Both?"                     |
| No Basic-Design/*.md file opened | Ask: "Do you have a basic design document? Open it in the IDE or paste the path / content here" |
| Basic design is empty            | Prompt: "Please describe what needs to be done"                |
| Basic design too vague for layer | Ask one clarifying question about that layer before expanding  |
| Title too short (< 5 chars)      | Ask for a more descriptive title                               |
| `add_issue` fails                | Show error, offer to retry or abort                            |
