#!/bin/bash
cd /home/z/my-project
NODE_OPTIONS='--max-old-space-size=256' NODE_ENV=production node node_modules/.bin/next start -p 3000 &
echo $! > /home/z/my-project/server.pid
disown
