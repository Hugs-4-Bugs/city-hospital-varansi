#!/bin/bash
while true; do
  if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
    echo "[$(date)] Server not responding, restarting..."
    pkill -f "next start" 2>/dev/null
    sleep 2
    cd /home/z/my-project && npx next start -p 3000 >> /home/z/my-project/dev.log 2>&1 &
    sleep 10
  fi
  sleep 30
done
