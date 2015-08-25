/**
 * Module dependencies.
 */
var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var editRoute = require('./routes/edit');
var http = require('http');
var path = require('path');
var Q = require('q');
var nanoId = require('nano-id');
var Fakr = require('./models/fakr');

var router = express.Router();

var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/fakedata", function (err) {
    if (err) {
        console.log(err);
    }
});

var app = express();
var db = mongoose.connection;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
/*if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}*/

router.get('/', routes.index);
router.get('/edit', editRoute.edit);

//Shortcut route
router.param('id', function (req, res, next, id) {
    
    if (nanoId.verify(id)) {
        next();
    }
    else {
        console.log("Not Verified")
    }
})
router.get('/d/:id', function (req, res) {
    Fakr.findOne({ unique_id: req.params.id }, function (err, fakrs) {
        if (err) {
            res.send(err);
            return;
        }
        
        if (fakrs && fakrs.data) {
            res.json(fakrs.data);
        }
        else {
            res.json({ message: 'No data returned for the given id', data: null })
        }
    });
})

app.use('/', router);
app.use('/api', require('./routes/api'));


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});