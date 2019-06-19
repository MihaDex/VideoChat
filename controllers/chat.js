var mongoose = require('mongoose');
var Message = mongoose.model('Message');
var Video = mongoose.model('Video');
var  url = require('url'),
    path = require('path'),
    fs = require('fs');
var message = new Message();
var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
  };

module.exports.index = function(req,res){
    res.render('chat',{title: 'Чат'});
};

module.exports.uploadFile = function(request, response){

        var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    var isWin = !!process.platform.match(/^win/);

    if (filename && filename.toString().indexOf(isWin ? '\\uploadFile' : '/uploadFile') != -1 && request.method.toLowerCase() == 'post') {
        uploadFile(request, response);
        return;
    }

    fs.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (filename.indexOf('favicon.ico') !== -1) {
            return;
        }

        if (fs.statSync(filename).isDirectory() && !isWin) {
            filename += '/index.html';
        } else if (fs.statSync(filename).isDirectory() && !!isWin) {
            filename += '\\index.html';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write(err + '\n');
                response.end();
                return;
            }

            var contentType;

            if (filename.indexOf('.html') !== -1) {
                contentType = 'text/html';
            }

            if (filename.indexOf('.js') !== -1) {
                contentType = 'application/javascript';
            }

            if (contentType) {
                response.writeHead(200, {
                    'Content-Type': contentType
                });
            } else response.writeHead(200);

            response.write(file, 'binary');
            response.end();
        });
    });
    
    function uploadFile(request, response) {
        // parse a file upload
        var mime = require('mime');
        var formidable = require('formidable');
        var util = require('util');

        var form = new formidable.IncomingForm();

        var dir = !!process.platform.match(/^win/) ? '\\uploads\\' : '/uploads/';

        form.uploadDir = global.appRoot + '/public/'+dir;
        // console.log(global.appRoot + '/public/'+ dir);
        form.keepExtensions = true;
        form.maxFieldsSize = 10 * 1024 * 1024;
        form.maxFields = 1000;
        form.multiples = false;

        form.parse(request, function(err, fields, files) {
            var file = util.inspect(files);
            response.writeHead(200, getHeaders('Content-Type', 'application/json'));

            var fileName = file.split('path:')[1].split('\',')[0].split(dir)[1].toString().replace(/\\/g, '').replace(/\//g, '');
            // var fileURL = 'http://' + 'localhost' + ':' + '3000' + '/uploads/' + fileName;
            var fileURL = '/uploads/' + fileName;

            console.log('fileURL: ', fileURL);
            var getVideo;
            Video.findById(fields.videoid, function(err,data){
                if(err){
                    console.log(err);
                } else {
                    // getVideo = data;
                    console.log(data);
                    data.videos.push({'author': fields.author, 'url': fileURL, 'comment': fields.comment});
            
                    data.save(function(err) {
                        if (err) {
                            console.log(err);
                            
                        } else {
                            console.log("ok");
                        }
                    });
                }
            });
            // console.log(getVideo);
            
              response.write(JSON.stringify({
                fileURL: fileURL
            }));
            response.end();
        });
    }

    function getHeaders(opt, val) {
        try {
            var headers = {};
            headers["Access-Control-Allow-Origin"] = "https://secure.seedocnow.com";
            headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
            headers["Access-Control-Allow-Credentials"] = true;
            headers["Access-Control-Max-Age"] = '86400'; // 24 hours
            headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";

            if (opt) {
                headers[opt] = val;
            }

            return headers;
        } catch (e) {
            return {};
        }
    }
};
