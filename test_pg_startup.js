const net = require('net');
const tls = require('tls');

const host = 'ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech';
const port = 5432;
const user = 'neondb_owner';
const database = 'neondb';

const conn = net.connect(port, host, () => {
  console.log('Connected to TCP');
  const buf = Buffer.alloc(8);
  buf.writeInt32BE(8, 0);
  buf.writeInt32BE(80877103, 4);
  conn.write(buf);
});

conn.once('data', (data) => {
  if (data.toString() === 'S') {
    console.log('Server supports SSL. Starting TLS handshake...');
    const tlsSocket = tls.connect({
      socket: conn,
      servername: host,
      rejectUnauthorized: false
    }, () => {
      console.log('TLS Handshake successful. Sending StartupMessage...');

      // StartupMessage: length(int32), protocol(int32), key/value pairs(strings), null terminator
      const payload = Buffer.concat([
        Buffer.from('user\0', 'ascii'),
        Buffer.from(user + '\0', 'ascii'),
        Buffer.from('database\0', 'ascii'),
        Buffer.from(database + '\0', 'ascii'),
        Buffer.from('\0', 'ascii')
      ]);

      const msg = Buffer.alloc(4 + 4 + payload.length);
      msg.writeInt32BE(msg.length, 0);
      msg.writeInt32BE(196608, 4); // Protocol 3.0
      payload.copy(msg, 8);

      tlsSocket.write(msg);
    });

    tlsSocket.on('data', (d) => {
      console.log('Server response to StartupMessage (Hex):', d.toString('hex'));
      console.log('Server response to StartupMessage (Char):', d.toString('ascii'));
      tlsSocket.end();
    });

    tlsSocket.on('error', (err) => {
      console.log('❌ TLS Error:', err.message);
      conn.destroy();
    });

    tlsSocket.on('close', () => {
        console.log('TLS connection closed');
    });
  }
});
