const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const PID_FILE = '/home/z/my-project/.server.pid';
const LOG_FILE = '/home/z/my-project/dev.log';
const MAX_RESTARTS = 10;
const RESTART_WINDOW = 60000; // 1 minute
let restartTimes = [];

function log(msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [Daemon] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, line);
  console.log(line.trim());
}

function startServer() {
  // Check restart frequency
  const now = Date.now();
  restartTimes = restartTimes.filter(t => now - t < RESTART_WINDOW);
  if (restartTimes.length >= MAX_RESTARTS) {
    log(`Too many restarts (${MAX_RESTARTS} in ${RESTART_WINDOW/1000}s). Stopping.`);
    process.exit(1);
  }
  restartTimes.push(now);

  log('Starting production server...');
  
  const server = spawn('node', ['.next/standalone/server.js'], {
    cwd: '/home/z/my-project',
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000', HOSTNAME: '0.0.0.0' },
    stdio: ['ignore', fs.openSync(LOG_FILE, 'a'), fs.openSync(LOG_FILE, 'a')],
    detached: false
  });

  fs.writeFileSync(PID_FILE, String(server.pid));
  log(`Server started with PID ${server.pid}`);

  server.on('exit', (code, signal) => {
    log(`Server exited (code=${code}, signal=${signal}). Restarting in 3s...`);
    setTimeout(startServer, 3000);
  });

  server.on('error', (err) => {
    log(`Server error: ${err.message}. Restarting in 5s...`);
    setTimeout(startServer, 5000);
  });
}

// Handle daemon signals
process.on('SIGTERM', () => { log('Daemon received SIGTERM, ignoring to keep server alive'); });
process.on('SIGINT', () => { log('Daemon received SIGINT, ignoring to keep server alive'); });
process.on('SIGHUP', () => { log('Daemon received SIGHUP, ignoring'); });

// Write daemon PID
fs.writeFileSync('/home/z/my-project/.daemon.pid', String(process.pid));
log(`Daemon started with PID ${process.pid}`);

startServer();
