---
name: log-bug-backlog
description: >
  Log a bug to Backlog (workspace5.backlog.com) with a structured bug report.
  Supports image paste — analyzes the screenshot and uploads it as evidence.
  Also supports re-opening an existing bug by updating its status and adding a comment.
  Use when user says "log bug", "report bug", "báo lỗi", "tạo bug backlog",
  "found a bug", "re-open bug", "reopen", or wants to create/reopen a Bug issue in Backlog.
argument-hint: "[title? | reopen <ISSUE-KEY>]"
allowed-tools:
  - mcp__backlog__get_project_list
  - mcp__backlog__get_issue_types
  - mcp__backlog__get_priorities
  - mcp__backlog__get_users
  - mcp__backlog__add_issue
  - mcp__backlog__add_issue_comment
  - mcp__backlog__get_issue
  - mcp__backlog__update_issue
  - Bash
---

# Log Bug to Backlog

## Configuration

```
BACKLOG_API_KEY = i9oMHbBQWDArr2nAU8aLhrQmbj6U0zN84HWrJi7SyjVKqUaDTLwozyGLyF7je9eR
BACKLOG_DOMAIN  = workspace5.backlog.com
```

## Usage

```
/log-bug-backlog                              → Asks mode: new bug or re-open
/log-bug-backlog "Login fails on mobile"      → New bug with title pre-filled
/log-bug-backlog reopen ECOMMERCE-5          → Re-open flow for that issue key
<paste image> then /log-bug-backlog           → New bug — auto-analyzes screenshot as evidence
```

## Workflow

### Step 0 — Ask mode (unless already clear from argument)

At the very start, ask the user which mode they want:

```
What would you like to do?
  1) Log a new bug
  2) Re-open an existing bug
```

**Skip this question if:**
- The argument contains a title or image → go to **New Bug flow (Step 0A)**
- The argument contains "reopen" or an issue key pattern (e.g. `PROJECT-123`) → go to **Re-open flow (Step R1)**

---

## Re-open Flow

### Step R1 — Get issue key

If not already provided in the argument, ask:
> "Enter the issue key to re-open (e.g. ECOMMERCE-5):"

Call `mcp__backlog__get_issue` with the provided key and display the current issue:

```
Current issue:
  Key      : <ISSUE-KEY>
  Title    : <title>
  Status   : <current status>
  Assignee : <name | Unassigned>
```

If issue not found → inform user and ask to re-enter the key.

### Step R2 — Ask for re-open reason

Ask the user:
> "Why is this bug being re-opened? (your reason will be posted as a comment)"

This is **required** — do not proceed without a reason.

### Step R3 — Confirm before updating

Display a preview:

```
┌──────────────────────────────────────────────────┐
│  Issue    : <ISSUE-KEY>                          │
│  Title    : <title>                              │
│  Action   : Re-open (status → Open)              │
├──────────────────────────────────────────────────┤
│  Comment  : <reason>                             │
└──────────────────────────────────────────────────┘
Proceed? (yes / no)
```

### Step R4 — Update status and add comment

Call **both in parallel**:

1. `mcp__backlog__update_issue` with:
   - `issueIdOrKey`: the issue key
   - `statusId`: `1` (Open)

2. `mcp__backlog__add_issue_comment` with:
   - `issueIdOrKey`: the issue key
   - `content`: the re-open reason from Step R2

### Step R5 — Display result

```
✓ Bug re-opened!

  Issue Key : <ISSUE-KEY>
  Title     : <title>
  Status    : Open
  Comment   : posted
  URL       : https://workspace5.backlog.com/view/<ISSUE-KEY>
```

---

## New Bug Flow

### Step 0A — Detect image input

**If the user pasted or attached an image** (screenshot, UI capture, error dialog):

1. Analyze the image using your vision capability.
2. Extract as much bug context as possible:
   - What UI/feature is shown?
   - What appears broken or unexpected?
   - Any visible error messages, status codes, or stack traces?
   - Environment clues (browser, device, URL, etc.)
3. Inform the user: _"I can see [description]. I'll pre-fill the bug fields from this screenshot and attach it as evidence."_
4. Keep a reference to the image. You will upload it in Step 3.5.

If **no image** was provided, skip to Step 1.

### Step 1 — Fetch context (parallel)

Call all three **in parallel**:
- `mcp__backlog__get_project_list` — to select project
- `mcp__backlog__get_priorities` — global, needed for Step 2
- `mcp__backlog__get_users` — needed for assignee in Step 2

- If only one project → auto-select it, inform the user.
- If multiple → show a numbered list and ask: **"Which project? (enter number)"**

After project is selected, call `mcp__backlog__get_issue_types` and find the
closest match to "Bug". Store its ID for submission.

### Step 2 — Gather basic fields

Ask the user for the following in a **single prompt** (skip title if already
provided via argument or extracted from image):

```
Title    : <short, specific summary of the bug>
Priority : Critical | High | Normal | Low
Assignee : <name or part of name — or "unassigned">
```

If an image was analyzed in Step 0, pre-fill the Title suggestion based on what
you observed. Let the user confirm or edit it.

For **Assignee**: show a numbered list from `mcp__backlog__get_users`.
The user can type a number, type part of a name (fuzzy match), or type
`"unassigned"` to skip.

### Step 3 — Gather bug description

Ask the user to fill in the bug report. Pre-fill any fields extractable from
the image (environment, visible steps, error text):

```
Environment     : dev | staging | prod | <browser / OS / version>
Steps to reproduce:
  1.
  2.
  3.
Expected result :
Actual result   :
Notes           : <error logs, related issue keys>
```

Minimum required before proceeding: at least one step + expected + actual.
If any are missing, prompt the user to fill them in before continuing.

### Step 3.5 — Upload image attachment (only if image was provided)

If an image was pasted/attached, ask the user: _"Where is the screenshot saved?
Please provide the file path (e.g. `/tmp/screenshot.png`) so I can upload it to
Backlog."_

If the user provides a path, upload it using the Backlog Attachment API:

```bash
curl -s -X POST \
  "https://workspace5.backlog.com/api/v2/space/attachment?apiKey=$BACKLOG_API_KEY" \
  -F "file=@{IMAGE_PATH}"
```

Parse the JSON response and extract the `id` field — this is the `attachmentId`.

Example success response: `{"id": 12345, "name": "screenshot.png", ...}`

If upload succeeds → inform user: _"Screenshot uploaded (attachment ID: 12345)."_
If upload fails → warn user: _"Could not upload image — issue will be created without attachment. Continuing..."_ and proceed without it.

If the user does not provide a path, skip the upload silently.

### Step 4 — Confirm before submitting

Display a formatted preview:

```
┌──────────────────────────────────────────────────┐
│  Project   : <project name>                      │
│  Type      : Bug                                 │
│  Priority  : <priority>                          │
│  Assignee  : <name | Unassigned>                 │
│  Title     : <title>                             │
├──────────────────────────────────────────────────┤
│  Environment : <env>                             │
│                                                  │
│  Steps to reproduce:                             │
│  1. <step>                                       │
│  2. <step>                                       │
│                                                  │
│  Expected : <expected>                           │
│  Actual   : <actual>                             │
│                                                  │
│  Notes    : <notes>                              │
│  Attachment: <filename | none>                   │
└──────────────────────────────────────────────────┘
Submit? (yes / no / edit)
```

- `yes` → proceed to Step 5
- `no` → abort, inform user
- `edit` → ask which field to change, update it, re-show preview

### Step 5 — Create the issue

Call `mcp__backlog__add_issue` with:

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| `projectId`     | Selected project ID                                |
| `summary`       | Title from Step 2                                  |
| `issueTypeId`   | Bug issue type ID from Step 1                      |
| `priorityId`    | Selected priority ID                               |
| `assigneeId`    | Selected user ID (omit field if unassigned)        |
| `description`   | Formatted bug report from Step 3 (markdown)        |
| `attachmentId`  | Attachment ID from Step 3.5 (omit if none)         |

Description format sent to Backlog:

```
**Environment**: <env>

**Steps to reproduce**:
1. <step>
2. <step>
3. <step>

**Expected**: <expected result>
**Actual**: <actual result>

**Notes**: <notes>
```

### Step 6 — Display result

Call `mcp__backlog__get_issue` with the new issue ID and display:

```
✓ Bug reported successfully!

  Issue Key  : <PROJECT-123>
  Title      : <title>
  Priority   : <priority>
  Assignee   : <name | Unassigned>
  Attachment : <filename | none>
  URL        : https://workspace5.backlog.com/view/<PROJECT-123>
```

If the user wants to add a comment, call `mcp__backlog__add_issue_comment`.

## Title Guidelines

- ❌ `"Bug in login"`
- ✅ `"[Auth] Login fails with 401 when token expired on mobile"`
- Pattern: `[Module] What happens + when/where`

## Priority Guide

| Priority | When to use                                       |
|----------|---------------------------------------------------|
| Critical | Production down, data loss, security breach       |
| High     | Major feature broken, blocking multiple users     |
| Normal   | Bug with a workaround, moderate user impact       |
| Low      | Minor UI issue, cosmetic, rarely triggered        |

## Error Handling

| Situation                        | Action                                              |
|----------------------------------|-----------------------------------------------------|
| No projects found                | Inform user, check API key / permissions            |
| No "Bug" issue type in project   | Show available types, ask user to select manually   |
| No users returned                | Skip assignee, set unassigned, warn user            |
| Assignee name matches multiple   | Show matched names, ask to pick by number           |
| Missing steps / expected / actual | Re-prompt: "Please fill in the missing fields"    |
| Title too short (< 5 chars)      | Ask for a more descriptive title                    |
| Image path not found             | Warn user, continue without attachment              |
| Attachment upload fails (non-2xx) | Warn user, continue without attachment             |
| `add_issue` fails                | Show error, offer to retry or abort                 |
| Re-open: issue key not found     | Inform user, ask to re-enter the key                |
| Re-open: issue already Open      | Warn: "This issue is already Open. Still add a comment? (yes/no)" |
| Re-open: reason left empty       | Re-prompt: "A reason is required to re-open"        |
| `update_issue` fails             | Show error, offer to retry or abort                 |
