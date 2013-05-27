#!/usr/bin/env node

if (process.argv.length < 3) {
    console.log('Usage: ng-docserver angular-x.y.z.zip [port]');
    return;
}

var zipfile = process.argv[2],
    port = Number(process.argv[3]) || 1337,
    path = require('path'),
    http = require('http'),
    url = require('url'),
    mime = require('mime'),
    docZip = require('adm-zip')(zipfile),
    dirname = path.basename(zipfile, '.zip');

http.createServer(function(req, res){
    var uri = url.parse(req.url).pathname,
        filePath = dirname + uri;

    if (['/', '/docs', '/docs/'].indexOf(uri) > -1) {
        res.writeHead(302, {'Location': '/docs/index.html'});
        res.end();
        return;
    }

    docZip.readFileAsync(filePath, function(data){
        if (data === null) {
            if (uri.indexOf('/docs/') === 0 && uri.indexOf('/docs/index.html#!') !== 0) {
                res.writeHead(302, {'Location': '/docs/index.html#!' + uri.substr(5)});
                res.end();
            } else {
                res.writeHead(404);
                res.end();
            }
            return;
        }

        res.writeHead(200, {'Content-Type': mime.lookup(uri)});
        res.end(data);
    });
}).listen(port);

console.log("Document server is started: localhost:" + port);
