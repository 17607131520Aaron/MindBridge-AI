docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$HOME/.docker/daemon.json:/etc/docker/daemon.json" \
  alpine sh -c '
  if [ ! -s /etc/docker/daemon.json ]; then
    echo "{}" > /etc/docker/daemon.json
  fi
  apk add --no-cache jq
  jq ". + {\"registry-mirrors\": [\"https://docker.1ms.run\", \"https://docker.xuanyuan.me\"]}" /etc/docker/daemon.json > /tmp/daemon.json
  cat /tmp/daemon.json
'
