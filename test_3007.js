const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Server is working on Port 3007\n');
});
server.listen(3007, '127.0.0.1', () => {
  console.log('Server running at http://127.0.0.1:3007/');
});
