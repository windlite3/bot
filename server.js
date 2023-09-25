const http = require('http');
const url = require('url');
const https = require('https');

function handleError(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 Not Found');
}

function handleOK(res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
}

function getIP(req) {
  let ip = req.ip ?? req.headers["x-real-ip"];
  const forwardedFor = req.headers["x-forwarded-for"];

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  ip = ip ?? "";
  return ip;
}

function handleIP(req, res) {
  const ip = getIP(req);
  const response = { ip };
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(response));
}

function handleTransport(req, res, targetUrl) {
  // 向网址发送GET请求
  https.get(targetUrl, (response) => {
    let body = '';
    response.on('data', (chunk) => {
      body += chunk;
    });
    response.on('end', () => {
      // 将响应发送回客户端
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(body);
    });
  }).on('error', (e) => {
    console.error(e);
  });
}

const server = http.createServer((req, res) => {
  // 解析请求的URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const urlParam = query.url;

  if (path == '/transport') {
    handleTransport(req, res, urlParam);
  } else if (path == '/') {
    handleOK(res);
  } else if (path == '/ip') {
    handleIP(req, res);
  } else {
    handleError(res);
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
