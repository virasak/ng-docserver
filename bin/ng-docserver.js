#!/usr/bin/env node

if (process.argv.length < 3) {
    console.log('Usage: ng-docserver angular-x.y.z.zip [port]');
    return;
}

var file    = process.argv[2],
    port    = Number(process.argv[3]) || 1337,
    zip     = require('adm-zip')(file),
    dirname = require('path').basename(file, '.zip'),
    mime    = require('mime'),
    url     = require('url'),
    http    = require('http');

http.createServer(function(req, res) {
    var pathname = url.parse(req.url).pathname;
    zip.readFileAsync(dirname + pathname, function(data) {
        if (data) {
            res.writeHead(200, {'Content-Type': mime.lookup(pathname)});
            res.write(data);
        } else if (['/', '/docs', '/docs/'].indexOf(pathname) > -1) {
            res.writeHead(302, {'Location': '/docs/index.html'});
        } else if (pathname.indexOf('/docs/') === 0) {
            res.writeHead(302, {'Location': '/docs/index.html#!' + pathname.substr(5)});
        } else {
            res.writeHead(404);
        }
        res.end();
    });
}).listen(port);

console.log("Document server is started: localhost:" + port);
