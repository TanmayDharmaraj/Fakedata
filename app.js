﻿var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var favicon = require('serve-favicon');
//var logger = require('./node_services/logger');
var responseTime = require('response-time');

var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB || "mongodb://localhost:27017/fakedata", function (err) {
    if (err) {
        console.log(err);
    }
});


var app = express();
var db = mongoose.connection;

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'jade');
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));
/*app.use(require('morgan')("combined", {
    "stream": {
        write: function (str) {
            process.stdout.write(str)
        }
    }
}));*/

/*data-service routes*/
app.use('/svc', require('./routes/data_services.js'));

/*frontend routes */
require('./routes/routes.js')(app)

/*API routes*/
app.use('/api/v1', require('./routes/api_v1'));


/*404*/
app.use('*',function (req, res) {
    res.status(404).send("Requested resource not found")
});
//app.use(responseTime());

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

app.on('error', function (e) {
    console.log(e)
    //process.exit();
    //process.kill(app.get('port'));
    //process.abort();
    
});

app.on('uncaughtException', function () {
    app.close();
});
app.on('SIGTERM', function () { 
    app.close();
})