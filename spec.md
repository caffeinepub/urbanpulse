# UrbanPulse

## Current State
Full-stack ICP app with Motoko backend storing issues, users, upvotes. Admin dashboard at `/admin` shows issues table with status update and delete. No dedicated database explorer exists.

## Requested Changes (Diff)

### Add
- New `/database` route and page: a full database explorer for admins
- Issues table tab: all columns (ID, title, description, category, status, upvotes, location, reporter, createdAt, resolvedAt, photo), searchable and filterable by status/category
- Stats tab: overview cards with totals
- CSV export button for issues data
- Admin-only guard (redirect to /login if not admin)
- Link to `/database` in Layout nav (desktop + mobile) for admins

### Modify
- `App.tsx`: add `/database` route
- `Layout.tsx`: add Database nav link for admins

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/pages/Database.tsx` with tabs: Issues table + Stats overview
2. Issues tab: search input, category filter, status filter, sortable columns, full row detail, CSV export
3. Add route in `App.tsx`
4. Add nav link in `Layout.tsx` for admins
