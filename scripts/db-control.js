const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const action = process.argv[2] || 'status';

const pgData = path.join(os.homedir(), '.wyzrex-pgdata');
const pgLogs = path.join(os.homedir(), '.wyzrex-pglogs');
const logFile = path.join(pgLogs, 'server.log');

// Ensure log directory exists
if (!fs.existsSync(pgLogs)) {
  fs.mkdirSync(pgLogs, { recursive: true });
}

const pgCtl = "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_ctl.exe";

let args = [];
if (action === 'start') {
  args = ['start', '-D', pgData, '-l', logFile, '-o', '-p 5544'];
} else if (action === 'stop') {
  args = ['stop', '-D', pgData];
} else if (action === 'status') {
  args = ['status', '-D', pgData];
} else {
  console.error(`Unknown action: ${action}`);
  process.exit(1);
}

console.log(`Executing: "${pgCtl}" ${args.join(' ')}`);

const child = spawn(pgCtl, args, { stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code || 0);
});
