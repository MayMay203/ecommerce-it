---
name: git-commit
description: >
  Stage and commit changes following Conventional Commits standard.
  Use when user says "commit", "git commit", "tạo commit", "save changes".
argument-hint: "[message?]"
allowed-tools:
  - Bash
---

# Git Commit

## Usage

```
/git-commit                   → Auto-generate commit message from diff
/git-commit "feat: add login" → Commit with provided message
```

## Workflow

1. **Check status** — run `git status` + `git diff --stat`
2. **Stage files** — run `git add .` (or specific files if user specified)
3. **Determine message**
   - If user provided a message → validate format, use it
   - If not → read `git diff --cached` and generate a Conventional Commit message
4. **Ask for confirmation** — show the proposed commit message and staged files, then ask:
   > Commit with message: `<message>`? (yes / no / edit)
   - `yes` → proceed
   - `no` → abort, inform user
   - `edit` → ask user to provide a new message, then re-confirm
5. **Commit** — run `git commit -m "<message>"` only after confirmation
6. **Done** — show the commit hash and one-line summary

## Conventional Commits Format

```
<type>(<scope>): <short description>
```

| Type       | When to use                              |
|------------|------------------------------------------|
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `refactor` | Code change, no feature/fix              |
| `test`     | Adding or updating tests                 |
| `docs`     | Documentation only                       |
| `chore`    | Build, config, tooling, dependencies     |
| `style`    | Formatting, no logic change              |
| `perf`     | Performance improvement                  |

**Rules:**
- Subject line ≤ 72 characters
- Lowercase, no period at end
- Scope = module/feature name (optional but recommended)

## Examples

```
feat(auth): add JWT refresh token endpoint
fix(cart): correct quantity update on duplicate item
test(users): add unit tests for UserService
chore: upgrade NestJS to v11
```

## Error Handling

| Situation              | Action                                      |
|------------------------|---------------------------------------------|
| Nothing to commit      | Inform user, show `git status`              |
| Invalid message format | Suggest corrected version, ask to confirm   |
| Commit fails           | Show error, do NOT retry with `--no-verify` |
