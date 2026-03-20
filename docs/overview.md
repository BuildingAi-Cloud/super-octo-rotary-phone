# Overview

Buildings.com is an AI-native and legacy building management platform for commercial and residential properties. It provides secure, scalable, and privacy-focused solutions for property owners, managers, and residents.

- SaaS and On-Premise deployment
- AI-driven automation and analytics
- Legacy system integration
- Privacy and security by design

---

# Documentation

## 1. On-Premise Deployment
- See ON_PREMISE_DOCKER.md for Docker build/run instructions
- See docker-compose.yml for service orchestration

## 2. Environment Variables
- See .env.example for required secrets and configuration

## 3. HTTPS Setup
- See HTTPS_SETUP.md for enabling HTTPS with self-signed certificates

## 4. Health Checks
- See HEALTHCHECK.md for Docker health check configuration

## 5. Monitoring & Logging
- See MONITORING.md for guidance on logs and monitoring

## 6. CI/CD
- See .github/workflows/ci.yml for GitHub Actions workflow

## 7. Security
- Authentication logic must be implemented securely (see app/api/auth.ts)
- No secrets are hardcoded; always use environment variables
- Dependencies are regularly audited for vulnerabilities

## 8. Pricing
- Pricing plans are defined in components/pricing-section.tsx

## 9. Stripe Integration
- Stripe checkout logic is in app/actions/stripe.ts

## 10. Customization
- Add databases or other services in docker-compose.yml
- Extend health checks and monitoring as needed

For further help, contact the BuildSync team or open an issue on GitHub.
