const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = 3001;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = decodeURIComponent(parsedUrl.pathname);

    // Root route default to index.html
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    let filePath = path.join(PUBLIC_DIR, pathname);

    // Prevent directory traversal attacks
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 Forbidden');
      return;
    }

    // If requested without extension, check if .html exists (e.g. /invoices -> /invoices.html)
    if (!path.extname(filePath)) {
      if (fs.existsSync(filePath + '.html')) {
        filePath = filePath + '.html';
      } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
        filePath = path.join(filePath, 'index.html');
      }
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><title>404 Not Found</title></head>
            <body style="font-family: sans-serif; text-align: center; padding: 50px;">
              <h2>404 - Không tìm thấy trang</h2>
              <p>Trang <code>${pathname}</code> không tồn tại.</p>
              <a href="/" style="color: #0d9488; font-weight: bold;">Quay về Trang chủ</a>
            </body>
          </html>
        `);
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Cổng ${port} đã có ứng dụng khác sử dụng, thử cổng ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Prototype StayHub đang chạy thành công tại:`);
    console.log(`👉 http://localhost:${port}`);
    console.log(`👉 http://127.0.0.1:${port}`);
    console.log(`==================================================\n`);
  });
}

const requestedPort = parseInt(process.env.PORT || DEFAULT_PORT, 10);
startServer(requestedPort);
