# User Profile Feature — CONTEXT.md

## Responsibility
Shipping addresses CRUD, profile settings page

## API Mapping
| Action | Endpoint |
|--------|----------|
| List addresses | `GET /addresses` |
| Create address | `POST /addresses` |
| Get address | `GET /addresses/:id` |
| Update address | `PATCH /addresses/:id` |
| Delete address | `DELETE /addresses/:id` |
| Set default | `PATCH /addresses/:id/default` |

## Business Rules
- Only the owning user can CRUD their addresses
- One address marked `isDefault = true` at most
- Setting a new default must unset previous one
- Address not found → show 404 error toast

## Dependencies
- `auth` — `useAuthStore` for user identity and auth guard

## Exports (via index.ts)
- `AddressListPage`, `ProfilePage`
- Types: `Address`, `CreateAddressRequest`
