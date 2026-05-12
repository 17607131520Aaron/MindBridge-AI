#!/bin/bash

set -e

SERVER_IP="120.53.227.126"
SERVER_USER="ubuntu"
SERVER_PASSWORD="your_server_password"
IMAGE_NAME="yafenghuang777/mindbridge-ai"
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

echo "=== Deploy to Server ==="
echo "Server: $SERVER_USER@$SERVER_IP"
echo "Image: $IMAGE_NAME"
echo ""

echo "[1/4] Saving image to tar file..."
docker save "$IMAGE_NAME" -o /tmp/mindbridge-ai.tar

echo ""
echo "[2/4] Uploading image to server..."
sshpass -p "$SERVER_PASSWORD" scp -o StrictHostKeyChecking=no /tmp/mindbridge-ai.tar "$SERVER_USER@$SERVER_IP:/tmp/"

echo ""
echo "[3/4] Loading image and starting container..."
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
  $IMAGE_NAME
EOF

echo ""
echo "[4/4] Cleaning up local tar file..."
rm /tmp/mindbridge-ai.tar

echo ""
echo "=== Done ==="
echo "Access: http://$SERVER_IP:3000"
