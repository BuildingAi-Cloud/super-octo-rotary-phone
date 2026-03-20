# Monitoring & Logging Guidance

- For container logs: Use `docker compose logs app` or configure a logging driver.
- For advanced monitoring: Integrate with Prometheus, Grafana, or a cloud monitoring solution.
- Consider using healthcheck endpoint for uptime monitoring.
- For error tracking: Integrate with Sentry or similar service in your app code.
