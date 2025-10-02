# Production checklist

- Ensure `DATABASE_URL` is set to the production Neon connection string.
- Use `prisma migrate deploy` to run migrations in production.
- Configure secrets in your hosting provider (Vercel/Railway) not in code.
- Build frontend and serve via CDN (Vercel/Netlify) and backend via container or serverless.
- Set up Sentry and logs (SENTRY_DSN) and monitor with DataDog/Logtail.

## Monitoring & Logging
- Use Winston to log server events; forward logs to Logtail or DataDog.
- Add Sentry for error aggregation.
- Use Prometheus/Grafana for metrics if self-hosting.

## Security Best Practices
- Use HTTPS everywhere and HSTS header.
- Rotate secrets and use vault solutions (Azure Key Vault, AWS Secrets Manager).
- Enforce strong JWT secrets and short-lived tokens.
- Rate limit API endpoints and use WAF if possible.
- Scan dependencies for vulnerabilities with `npm audit` and Dependabot.
