# Role-Based Access Control (RBAC) Summary

This document outlines the implementation of the RBAC system for the ViralClip AI platform, addressing route security, database policies, and user roles.

## 1. Route Security (`ProtectedRoute`)

A centralized `<ProtectedRoute>` component now wraps the application routes in `App.tsx`:

- **Guest Routes (`/`)**: Only accessible by unauthenticated users or visitors. Authenticated clients are automatically redirected to `/dashboard`.
- **Authenticated Routes**: `/dashboard`, `/marketplace`, `/projects`, `/channels`, `/audits`, and `/settings` are protected. Unauthenticated visitors are redirected to `/`.
- **Admin Routes (`/admin`)**: Exclusively accessible to users with the `admin` role. Standard clients attempting to access this route are safely redirected to `/dashboard`.

## 2. Row Level Security (RLS) Adjustments

A new database migration (`20260318040000_rbac_admin_policies.sql`) was introduced.

- **Client Restrictions**: Existing policies remain strictly intact. Standard clients (`role = 'client'`) can only `SELECT`, `INSERT`, `UPDATE`, and `DELETE` records where `user_id = auth.uid()`.
- **Global Visibility**: A new secure function `is_admin()` was created. Policies were added allowing `admin` users to execute `SELECT` on all rows across the following tables:
  - `users`
  - `channels`
  - `audits`
  - `projects`
  - `credits`
  - `transactions`

Admin users can now view all platform data for management purposes (e.g., in the `/admin` interface).

## 3. Admin Promotion Mechanism

No hardcoded credentials exist in the codebase. Administrator access is strictly controlled via the database.

**To promote the first admin, run this snippet in the Supabase SQL Editor:**

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## 4. Role Matrix

The platform's frontend and TypeScript definitions officially support the following roles:

- `visitor`: Unauthenticated session, limited to public pages.
- `client`: Standard authenticated user, isolated to their own data.
- `admin`: Elevated user with global visibility and access to the management dashboard.
- `affiliate`, `collaborator`, `operator_ia`: These roles are defined in the schema and TypeScript types for future scalability. Currently, the system gracefully falls back to treating them as `client` regarding route access, ensuring they do not accidentally receive administrative privileges.
