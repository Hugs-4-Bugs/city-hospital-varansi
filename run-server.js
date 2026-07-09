const { spawn } = require('child_process');
const path = require('path');

function startServer() {
  const server = spawn('node', [path.join(__dirname, '.next/standalone/server.js')], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000', HOSTNAME: '0.0.0.0' },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  server.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  server.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code}, signal ${signal}. Restarting in 3s...`);
    setTimeout(startServer, 3000);
  });

  console.log(`Server started with PID ${server.pid}`);
}

startServer();
