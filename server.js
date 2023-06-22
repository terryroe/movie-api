const http = require('http');
const url = require('url');
const fs = require('fs');

http
  .createServer((request, response) => {
    const addr = request.url;
    const q = url.parse(addr, true);
    let filePath = '';

    fs.appendFile(
      'log.txt',
      `URL: ${addr}\nTimeStamp: ${new Date()}\n\n`,
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Request added to log.');
        }
      }
    );

    if (q.pathname.includes('documentation')) {
      filePath = __dirname + '/documentation.html';
    } else {
      filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        throw err;
      }

      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.write(data);
      response.end();
    });
  })
  .listen(8080);

console.log('Movie API server is running on port 8080.');
