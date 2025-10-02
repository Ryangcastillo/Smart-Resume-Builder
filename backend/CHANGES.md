## Changes in this branch

This branch adds a small unit test and a handful of type-only edits to make the backend compile and run tests under the project's strict TypeScript settings. No runtime behavior was changed.

- Add: `backend/src/test/health.test.ts` — a Jest test for the health endpoint.

- Type-only edits: small annotation fixes, explicit returns, and a `pdf-parse` declaration file to satisfy the compiler.

These changes were made to satisfy strict TypeScript compiler options and ensure tests run in CI without changing runtime behaviour. The edits are limited to type annotations, unused-variable cleanups, explicit returns in route handlers, and a small declaration file for a third-party module.
