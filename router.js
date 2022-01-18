// 1. 서버 사용을 위해서 http 모듈을 http 변수에 담는다. (모듈과 변수의 이름은 달라도 된다.) 
const express = require('express');
var router = express.Router();

var request = require('request');
var requestIp = require('request-ip');

var fs = require('fs');

var videoshow = require('videoshow')

// 1. 요청한 url을 객체로 만들기 위해 url 모듈사용
var url = require('url');
var path = require("path");
// 2. 요청한 url 중에 Query String 을 객체로 만들기 위해 querystring 모듈 사용
var querystring = require('querystring');

var filePath = "./tmp/";


// 2. http 모듈로 서버를 생성한다.
//    아래와 같이 작성하면 서버를 생성한 후, 사용자로 부터 http 요청이 들어오면 function 블럭내부의 코드를 실행해서 응답한다.
router.get('/', (req, res, next) => {


  
    var parsedUrl = url.parse(req.url);
    var parsedQuery = querystring.parse(parsedUrl.query,'&','=');

    var id = req.url.substring(req.url.lastIndexOf('/')+1).replace(/[^\w\sㄱ-힣]|[\_]/g,'')
  
    try {
      if (fs.existsSync(filePath+id+'.mp4')) {
        console.log(`[${requestIp.getClientIp(req)}] Find Same Request : ${id}`);
        fs.readFile(filePath+id+'.mp4', function(err, data) {
          res.writeHead(200, { 'Content-Type' : 'video/mp4'} );
          res.end(data);
        });
        return; 
      }
    } catch(err) { }

    console.log(`[${requestIp.getClientIp(req)}] Set Task ID : ${id}`);

    var stream = request(parsedQuery["url"]);
    var writeStream = fs.createWriteStream(filePath + id + '.jpg');
    
    stream.on('end', function () {
      console.log(`[${requestIp.getClientIp(req)}] Image Download Complete : ` + id);


      var videoOptions = {
        fps: 5,
        loop: 5, // seconds
        transition: false,
        videoBitrate: 1024,
        videoCodec: 'libx264',
        format: 'mp4',
        pixelFormat: 'yuv420p'
      }
      
      videoshow([filePath + id + '.jpg'], videoOptions).save(filePath+id+'.mp4')
      .on('end', function (output) {
        console.log(`[${requestIp.getClientIp(req)}] Video created in:`)
        
        setTimeout(function() {
          
          fs.readFile(filePath+id+'.mp4', function(err, data) {
            res.writeHead(200, { 'Content-Type' : 'video/mp4'} );
            res.end(data);
          });
          
          //res.download('./'+id+'.mp4');
          console.log(`[${requestIp.getClientIp(req)}] Send File`)

          console.log(`[${requestIp.getClientIp(req)}] Delete Image File`);
          stream.end();
          try{fs.unlinkSync(filePath + id + '.jpg');}catch(e){}
        setTimeout(function() {
          console.log(`[${requestIp.getClientIp(req)}] Delete Video File`);
          writeStream.end();
          try{fs.unlinkSync(filePath+id+'.mp4');}catch(e){}
        }, 60000);
        }, 1000);
      });
    });

    stream.pipe(writeStream);
    
});


module.exports = router;