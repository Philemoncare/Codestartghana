const net = require('net');
const tls = require('tls');

const host = 'ep-curly-glade-aqvg6r5k-pooler.c-8.us-east-1.aws.neon.tech';
const port = 5432;

const conn = net.connect(port, host, () => {
  console.log('Connected to TCP');
  // Send SSLRequest packet: length (8), code (80877103)
  const buf = Buffer.alloc(8);
  buf.writeInt32BE(8, 0);
  buf.writeInt32BE(80877103, 4);
  conn.write(buf);
});

conn.once('data', (data) => {
  const response = data.toString();
  console.log('Server response to SSLRequest:', response);
  if (response === 'S') {
    console.log('Server supports SSL. Starting TLS handshake...');
    const tlsSocket = tls.connect({
      socket: conn,
      servername: host,
      rejectUnauthorized: false
    }, () => {
      console.log('✅ TLS Handshake successful!');
      console.log('Protocol:', tlsSocket.getProtocol());
      console.log('Cipher:', tlsSocket.getCipher());
      tlsSocket.end();
    });

    tlsSocket.on('error', (err) => {
      console.log('❌ TLS Error:', err.message);
      conn.destroy();
    });
  } else if (response === 'N') {
    console.log('❌ Server does NOT support SSL');
    conn.destroy();
  } else {
    console.log('❌ Unexpected response:', response);
    conn.destroy();
  }
});

conn.on('error', (err) => {
  console.log('❌ TCP Error:', err.message);
});
