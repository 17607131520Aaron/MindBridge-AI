#!/bin/bash

set -e

DOCKER_USERNAME="yafenghuang777"
DOCKER_PASSWORD="5820@Feng"
IMAGE_NAME="mindbridge-ai"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:$IMAGE_TAG"

SERVER_IP="120.53.227.126"
SERVER_USER="ubuntu"
SERVER_PASSWORD="5820@Feng"
CONTAINER_NAME="mindbridge-ai"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env.local file not found at $ENV_FILE"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

JWT_SECRET="your_jwt_secret"
AUTH_COOKIE_SECURE="${AUTH_COOKIE_SECURE:-false}"

echo "=== Step 1/4: Docker Login ==="
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

echo ""
echo "=== Step 2/4: Build Image ==="
docker build --platform linux/amd64 -t "$FULL_IMAGE_NAME" "$PROJECT_ROOT"

echo ""
echo "=== Step 3/4: Save & Upload Image ==="
docker save "$FULL_IMAGE_NAME" -o /tmp/mindbridge-ai.tar
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no /tmp/mindbridge-ai.tar "$SERVER_USER@$SERVER_IP:/tmp/"

echo ""
echo "=== Step 4/4: Deploy to Server ==="
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << EOF
docker load -i /tmp/mindbridge-ai.tar
rm /tmp/mindbridge-ai.tar
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
docker run -d \
  --name $CONTAINER_NAME \
  -p 3000:3000 \
  --restart unless-stopped \
  -e MYSQL_HOST=$MYSQL_HOST \
  -e MYSQL_PORT=$MYSQL_PORT \
  -e MYSQL_USER=$MYSQL_USER \
  -e MYSQL_PASSWORD=$MYSQL_PASSWORD \
  -e MYSQL_DATABASE=$MYSQL_DATABASE \
  -e JWT_SECRET=$JWT_SECRET \
  -e AUTH_COOKIE_SECURE=$AUTH_COOKIE_SECURE \
  -e SENSENOVA_API_KEY=$SENSENOVA_API_KEY \
  $FULL_IMAGE_NAME
EOF

echo ""
echo "=== Step 5/5: Cleanup ==="
rm /tmp/mindbridge-ai.tar

echo ""
echo "=== Done ==="
echo "Access: http://$SERVER_IP:3000"
