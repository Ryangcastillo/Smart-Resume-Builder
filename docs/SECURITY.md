# Security policy

This repository follows a security-first approach. Follow these guidelines:

- Do not commit secrets. Use environment variables and a secrets manager.
- Use strong, rotated secrets for JWT and database credentials.
- Keep dependencies updated and use Dependabot.
- Run `npm audit` regularly and address critical vulnerabilities immediately.

## Vulnerability disclosure

If you discover a security issue, please contact the maintainers at security@example.com and include:

- A clear description of the issue
- Steps to reproduce
- Any PoC code or logs

We will acknowledge reported issues within 72 hours and provide regular updates on remediation progress.

## Hardening checklist

- Enforce HTTPS and HSTS
- Use CSP headers for frontend
- Sanitize user input and validate with Zod
- Use parameterized queries (Prisma does this by default)
- Limit upload sizes and scan uploaded files

