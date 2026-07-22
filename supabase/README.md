# Database

Postgres schema for Tend (Supabase).

| File | Purpose |
|------|---------|
| `schema.sql` | Full baseline schema |
| `migrations/` | Incremental changes applied after the baseline |

Apply new migrations in the Supabase SQL editor (or CLI) in numeric order. Already-applied migrations are safe to keep here as history — they are not runtime app code.