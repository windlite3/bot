//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const http = require('http');
const https = require('https');
const url = require('url');
const zlib = require('zlib');

function handleError(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('404 Not Found');
}

function handleTransport(req, res, targetUrl) {
  delete req.headers.host;

  // 发起转发请求
  const options = {
    hostname: targetUrl,
    method: 'GET',
    headers: req.headers
  };

  console.log("----------------------");
  console.log(targetUrl);
  console.log(req.headers);

  const forwardReq = https.request(options, forwardRes => {
    let stream;
    is_stream = true;
    encoding = forwardRes.headers['content-encoding'];
    switch (encoding) {
    case 'gzip':
      stream = zlib.createGunzip();
      break;
    case 'deflate':
      stream = zlib.createInflate();
      break;
    case 'br':
      stream = zlib.createBrotliDecompress();
      break;
    default:
      stream = forwardRes;
      is_stream = false;
      break;
    }
    // 接收转发请求的响应数据
    let responseData = '';
    stream.on('data', chunk => {
      console.log("length:" + chunk.length + ', encoding: ' + encoding);
      responseData += chunk;
    });
    stream.on('end', () => {
      // 返回响应数据
      //resHeaders = {'Content-Type': forwardRes.headers['content-type'], 'Accept-Encoding': forwardRes.headers['content-encoding']};
      resHeaders = {'Content-Type': forwardRes.headers['content-type']};
      console.log(resHeaders);
      console.log("end");
      delete forwardRes.headers['set-cookie']
      delete forwardRes.headers['transfer-encoding']
      console.log(forwardRes.headers);
      res.writeHead(200, resHeaders);
      //res.writeHead(forwardRes.statusCode, forwardRes.headers);
      res.end(responseData);
    });
    forwardRes.on('error', (e) => {
      console.error(e);
    });
    if (is_stream) {
      forwardRes.pipe(stream);
    }
  });

  forwardReq.on('error', error => {
    // 处理转发请求失败的情况
    console.error('转发请求失败:', error);
    // 返回错误信息
    res.statusCode = 500;
    res.end('转发请求失败');
  });
  forwardReq.end();
}

const server = http.createServer((req, res) => {
  // 解析请求的URL
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;
  const urlParam = query.url;

  if (path == '/transport') {
    handleTransport(req, res, urlParam);
  } else {
    handleError(res);
  }
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
