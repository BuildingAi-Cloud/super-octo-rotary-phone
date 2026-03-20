# Health Check Example for Docker Compose

# Add this to your docker-compose.yml under the app service:
# healthcheck:
#   test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
#   interval: 30s
#   timeout: 10s
#   retries: 3

# You may need to implement a /api/health endpoint in your Next.js app for this to work.
