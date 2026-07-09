#!/bin/bash
cd /home/z/my-project
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
export NODE_OPTIONS="--max-old-space-size=512"

pkill -f "next dev" 2>/dev/null || true
sleep 2

> dev.log

start_server() {
  npx next dev -p 3000 >> dev.log 2>&1 &
  echo $!
}

PID=$(start_server)
echo "Server PID: $PID"

while true; do
  sleep 8
  if ! kill -0 $PID 2>/dev/null; then
    echo "[$(date)] Server died, restarting..." >> dev.log
    PID=$(start_server)
    echo "New server PID: $PID"
  fi
done
