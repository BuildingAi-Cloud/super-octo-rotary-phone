# Self-signed certificate generation (for local HTTPS)
# Run these commands in your terminal:
# openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"

# To use HTTPS in Docker Compose, add the following to your service:
#    volumes:
#      - ./cert.pem:/app/cert.pem
#      - ./key.pem:/app/key.pem
#    environment:
#      - HTTPS=true
#      - SSL_CRT_FILE=/app/cert.pem
#      - SSL_KEY_FILE=/app/key.pem

# Update your Next.js server to use these certs if running custom server (not needed for Vercel/standard next start)
