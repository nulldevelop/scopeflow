# Project Context: ScopeFlow

## Prisma Configuration
- **Version:** Prisma 7
- **Generator Provider:** `prisma-client` (Custom/Specific for this project context).
- **Database:** MariaDB using `@prisma/adapter-mariadb`.
- **Output Path:** Client generated at `src/generated/prisma`.

## Engineering Mandates
- Always respect the singleton pattern in `src/lib/prisma.ts` to avoid connection exhaustion during HMR (Hot Module Replacement).
- Maintain the use of Driver Adapters as configured.

## Architecture & Design Patterns
- **File Naming:** Use `snake_case` for folders and `kebab-case` for files (e.g., `create-user.ts`).
- **Route Structure:**
  - `page.tsx`: Server Component only. Responsible for fetching and serving data.
  - `_data-access/`: Server-side only. Contains all `get-xxx.ts` operations.
  - `_actions/`: Server Actions only. Contains `create-xxx.ts`, `update-xxx.ts`, `delete-xxx.ts`.
  - `_schemas/`: Zod validation schemas.
  - `_components/`: Client Components for interactivity and UI.
- **Logic & Error Handling:**
  - Mandatory `try-catch` blocks in Actions and Data Access.
  - Implement **Early Returns** for error handling.
  - **Permissions:** Wrap logic using `src/lib/permissions/with-permission.ts` to access `ctx.userId` and `ctx.organizationId`.
