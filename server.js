var express = require('express');
var app = express();
var router = require('./router');

app.use('/', router);

app.listen(8080, () => {
    console.log(`server is listening at localhost:8080`);
});