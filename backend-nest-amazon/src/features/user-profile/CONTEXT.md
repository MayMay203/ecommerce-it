# User Profile Feature — CONTEXT.md

## Entities
- `addresses` — user shipping addresses with `user_id` FK

## Business Rules
- A user can have multiple addresses
- Only one address can be `is_default = true` per user
- Setting a new default must unset previous default in the same transaction
- Only the owning user can read/update/delete their addresses

## Edge Cases
- Address not found or belongs to another user → 404 USER_001
- Deleting the default address — caller should prompt user to set a new default

## Dependencies
- `AuthModule` — resolves `User` entity via DI for ownership checks
