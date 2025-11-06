#!/bin/bash
set -e # stop on error


# Load frontend env
export $(grep -v '^#' ./client/.env | xargs)

# Build the Docker images (multi-stage)
echo "Building Docker image..."
docker build \
  --build-arg VITE_BACKEND_URL=$VITE_BACKEND_URL \
  --build-arg VITE_WS_URL=$VITE_WS_URL \
  -t ghostwriter:latest \.

# Run the container
echo "Running container..."
docker run -p 8080:8080 --env-file ./server/.env ghostwriter:latest