const net = require('net');

const host = 'ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech';
const port = 5432;

console.log(`Checking connection to ${host}:${port}...`);

const socket = new net.Socket();
const start = Date.now();

socket.setTimeout(5000);

socket.on('connect', () => {
  console.log(`✅ TCP Connection successful to ${host}:${port} in ${Date.now() - start}ms`);
  socket.destroy();
});

socket.on('timeout', () => {
  console.log(`❌ Connection timed out after 5000ms`);
  socket.destroy();
});

socket.on('error', (err) => {
  console.log(`❌ Connection error: ${err.message}`);
});

socket.connect(port, host);
