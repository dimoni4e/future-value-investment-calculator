# Database Restore & Dump Formats

This repo now includes multiple dump formats for different restore tools.

## Files

- `backup-full.sql` (plain SQL, already present): use with `psql -f`.
- `backup-full.custom` (custom format): use with `pg_restore`.
- `backup-schema.sql` (schema only): definitions, no data.
- `backup-data-inserts.sql` (data only): INSERT statements for existing schema.
- `restore-wrapper.sql`: transactional drop + include of `backup-full.sql`.

## When to Use Which

| Goal                                         | Recommended File        | Command                                   |
| -------------------------------------------- | ----------------------- | ----------------------------------------- |
| Full recreate (objects + data)               | backup-full.sql         | `psql "$URL" -f backup-full.sql`          |
| Full recreate with selective restore options | backup-full.custom      | `pg_restore -d "$URL" backup-full.custom` |
| Only schema (migrations bootstrap)           | backup-schema.sql       | `psql "$URL" -f backup-schema.sql`        |
| Only data (schema already exists)            | backup-data-inserts.sql | `psql "$URL" -f backup-data-inserts.sql`  |
| Idempotent destructive rebuild               | restore-wrapper.sql     | `psql "$URL" -f restore-wrapper.sql`      |

## Examples

```bash
# Custom format restore into empty DB
dropdb --if-exists mydb
createdb mydb
pg_restore -d mydb backup-full.custom

# Specific table only from custom dump
pg_restore -d mydb -t public.scenario backup-full.custom

# Data only reload (truncate + load)
psql "$URL" -c 'TRUNCATE public.scenario RESTART IDENTITY CASCADE;'
psql "$URL" -f backup-data-inserts.sql
```

## pg_restore Tips

- List dump contents: `pg_restore -l backup-full.custom`
- Restore only schema: `pg_restore -d mydb --schema-only backup-full.custom`
- Exclude a table: create list file, remove its entry, then `pg_restore -L listfile -d mydb backup-full.custom`

## Extensions

Ensure required extensions (`pg_trgm`, `pgcrypto`, `unaccent`) are available. If not, connect as a privileged role and run:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

## Environment Variable URL

You can export your connection string as `URL` for brevity:

```bash
export URL="postgresql://user:pass@host:port/db?sslmode=require"
psql "$URL" -f backup-full.sql
```

## Validation Checklist Post-Restore

1. Row counts: `SELECT count(*) FROM public.scenario;`
2. Random sample: `SELECT * FROM public.scenario LIMIT 5;`
3. Extensions installed: `SELECT extname FROM pg_extension;`
4. Indexes: `\d public.scenario` (psql) or pgAdmin UI.

## Creating New Dumps (macOS with Homebrew)

```bash
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"
pg_dump "$URL" -Fc -f backup-full.custom
pg_dump "$URL" -f backup-full.sql
pg_dump "$URL" --schema-only -f backup-schema.sql
pg_dump "$URL" --data-only --inserts -f backup-data-inserts.sql
```

## Notes

- Custom format (`-Fc`) is the only one accepted by `pg_restore`.
- Plain SQL dumps are human-readable and executed via `psql`.
- Keep credentials out of committed files; `.env.local` remains git-ignored.
