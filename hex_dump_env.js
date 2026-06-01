const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const firstLine = content.split('\n')[0];
console.log('Line length:', firstLine.length);
console.log('Hex dump:');
for (let i = 0; i < firstLine.length; i++) {
  process.stdout.write(firstLine.charCodeAt(i).toString(16).padStart(2, '0') + ' ');
}
console.log('\n');
console.log('Plain text:', firstLine);
