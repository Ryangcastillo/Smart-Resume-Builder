# Troubleshooting Guide

This page documents common issues you may encounter when setting up or running the ATS Resume Builder project.

## 1) Missing dependencies or TypeScript declaration errors

Problem: TypeScript reports "Cannot find module 'x' or its corresponding type declarations." or ESLint/type issues.

Fixes:
Ensure you installed dependencies:

```powershell
cd backend
npm ci
cd ../frontend
npm ci
```

- If TypeScript can't find types for popular packages, install types:

```powershell
cd backend
npm i -D @types/express @types/cors @types/node
cd ../frontend
npm i -D @types/react @types/react-dom
```

## 2) Prisma errors connecting to Neon

- Ensure `DATABASE_URL` is correctly set in `backend/.env`.
- Run `npx prisma generate` to regenerate the client before running migrations.
- For Neon, use the recommended direct connection string and enable SSL if required.

## 3) Docker bind mount permission issues on Windows

- Use WSL2 or Docker Desktop with file sharing enabled. Avoid mounting host windows paths directly without proper permissions.
- Alternatively, use the production Dockerfile for building images instead of mounting source volumes.

## 4) Port conflicts

- Frontend defaults to port 3000, backend to 3001. Adjust `frontend/vite.config.ts` or `backend/.env` if needed.

## 5) Common VS Code issues

- Ensure recommended extensions are installed, then reload the window.
- If formatting or linting doesn't run on save, check `.vscode/settings.json` and ensure the default formatter is installed.

## 6) Neon Auth integration

- The repo includes a placeholder middleware `backend/src/middleware/auth.ts`. Replace the placeholder with actual Neon Auth verification per Neon docs.

## 7) Seed script errors

- If seeding fails, run migrations first and ensure Prisma client is generated.
- Use `NODE_ENV=development npm run db:seed` to avoid destructive actions in production.

If you're stuck, paste the exact error output here and I'll help further.
