# On-Premise Docker Build & Run Instructions

## Prerequisites
- Docker and Docker Compose installed

## Build the Docker Image
```
docker compose build
```

## Run the Service
```
docker compose up
```

The app will be available at http://localhost:3000

## Stopping the Service
```
docker compose down
```

## Customization
- To add a database, uncomment and configure the `db` service in `docker-compose.yml`.
- For environment variables, edit the `environment` section in the compose file or use a `.env` file.
