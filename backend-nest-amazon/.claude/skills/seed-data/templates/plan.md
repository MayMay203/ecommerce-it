# Plan Template

```
📋 SEED PLAN: {entity} ({count} records)

Prerequisites:
  • package.json "seed" script: {EXISTS ✓ | WILL ADD ⚠️}
  • @faker-js/faker: {EXISTS ✓ | WILL INSTALL ⚠️}

Dependencies to seed first:
  {numbered list: EXISTS ✓ | CREATE NEW | SKIP (seeded)}

Target:
  {n}. {entity} ({count}) - {status}

Files to create:
  • {list}

Files to modify:
  • {list if any}

Commands:
  $ npm run seed -- {entity} {count}

⚠️  This will INSERT data into your database.

Proceed? (yes/no)
```

## Confirm responses

| Response | Action |
|----------|--------|
| yes, y, ok, proceed, tiếp tục | Execute |
| no, n, cancel, hủy | Abort |
