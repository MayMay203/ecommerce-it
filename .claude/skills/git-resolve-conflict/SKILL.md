---
name: git-resolve-conflict
description: >
  Detect and resolve Git merge conflicts interactively.
  Use when user says "resolve conflict", "fix conflict", "merge conflict", "xung đột git", "giải quyết conflict".
argument-hint: "[file?]"
allowed-tools:
  - Bash
  - Read
  - Edit
---

# Git Resolve Conflict

## Usage

```
/git-resolve-conflict           → Scan and resolve all conflict files
/git-resolve-conflict src/app   → Resolve conflicts in a specific file/folder
```

## Workflow

1. **Detect conflicts** — run `git diff --name-only --diff-filter=U` to list conflicted files
   - If none found → inform user, show `git status`, stop
2. **Show overview** — list all conflicted files with line counts
3. **For each conflicted file** (one at a time):
   a. Read the file, extract all conflict blocks (`<<<<<<< ... >>>>>>> `)
   b. Show the conflict clearly:
      ```
      [OURS]   — current branch code
      [THEIRS] — incoming branch code
      ```
   c. Suggest a resolution with reasoning, then ask:
      > Resolve `<file>` — keep: **(ours / theirs / both / edit)**
      - `ours` → keep HEAD version
      - `theirs` → keep incoming version
      - `both` → merge both blocks together
      - `edit` → user provides the resolved content
   d. Apply the chosen resolution, remove all conflict markers
4. **Stage resolved files** — run `git add <resolved-files>`
5. **Confirm commit** — ask:
   > All conflicts resolved. Commit now? **(yes / no)**
   - `yes` → run `/git-commit` workflow (with confirm)
   - `no` → stop, inform user to commit manually

## Conflict Block Format

Git conflict markers to detect and remove:

```
// our changes
```

## Rules

- **NEVER auto-resolve** without showing the user both sides
- **NEVER remove conflict markers** without user confirmation per file
- Resolve files **one at a time** — do not batch
- If a file has **multiple conflict blocks**, handle each block separately
- After editing, verify no conflict markers remain: `grep -n "<<<<<<\|=======\|>>>>>>>" <file>`

## Error Handling

| Situation                  | Action                                          |
|----------------------------|-------------------------------------------------|
| No conflicts found         | Inform user, show `git status`                  |
| File has syntax errors after resolve | Warn user, show the problematic lines |
| Conflict markers still remain | Re-read file, ask user to resolve manually  |
| User picks `edit`          | Ask for the exact replacement content           |
