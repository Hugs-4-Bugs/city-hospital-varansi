const { spawn } = require('child_process');
const fs = require('fs');

const logFile = fs.openSync('/home/z/my-project/dev.log', 'a');

const child = spawn('npx', ['next', 'dev', '-p', '3000'], {
  cwd: '/home/z/my-project',
  stdio: ['ignore', logFile, logFile],
  detached: true,
  env: { ...process.env }
});

child.unref();
console.log('Server started with PID:', child.pid);
