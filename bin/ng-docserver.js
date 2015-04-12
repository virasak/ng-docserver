#!/usr/bin/env node

if (process.argv.length < 3) {
    console.error('Usage: ng-docserver path/to/angular-x.y.z.zip [port]');
    process.exit(1);
}

var file = process.argv[2],
    port = Number(process.argv[3]) || 1337,
    fs   = require('fs');

if (!fs.existsSync(file)) {
    console.error("'%s' is not exists", file);
    process.exit(1);
}

var zip     = require('adm-zip')(file),
    dirname = require('path').basename(file, '.zip'),
    mime    = require('mime'),
    url     = require('url'),
    http    = require('http');

var lastModified = Date.now();

http.createServer(function(req, res) {
    if (req.headers['if-modified-since'] - lastModified >= 0) {
        res.statusCode = 304;
        res.end();
        return;
    }

    var pathname = url.parse(req.url).pathname;

    zip.readFileAsync(dirname + pathname, function(data) {
        if (data && data.length > 0) {
            res.writeHead(200, {
                'Content-Type': mime.lookup(pathname),
                'Last-Modified': lastModified
            });
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
