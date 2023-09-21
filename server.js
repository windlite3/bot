const http = require('http');
const url = require('url');
const https = require('https');

const server = http.createServer((req, res) => {
  // 解析请求中的URL参数
  //const query = url.parse(req.url, true).query;
  //const urlParam = query.url;

  const urlParam = 'https://xueqiu.com';
  // 向网址发送GET请求
  https.get(urlParam, (response) => {
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
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
