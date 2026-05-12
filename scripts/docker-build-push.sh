#!/bin/bash

set -e

DOCKER_USERNAME="yafenghuang777"
DOCKER_PASSWORD="5820@Feng"
IMAGE_NAME="mindbridge-ai"
IMAGE_TAG="latest"

FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"

echo "=== Docker Build & Push ==="
echo "Image: $FULL_IMAGE_NAME"
echo ""

echo "[1/3] Logging in to Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

echo ""
echo "[2/3] Building Docker image..."
docker build -t "$FULL_IMAGE_NAME" .

echo ""
echo "[3/3] Pushing image to Docker Hub..."
docker push "$FULL_IMAGE_NAME"

echo ""
echo "=== Success ==="
echo "Image pushed: $FULL_IMAGE_NAME"
