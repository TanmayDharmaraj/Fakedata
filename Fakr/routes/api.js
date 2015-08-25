var express = require('express');
var jBloat = require('../node_services/jBloat.js');
var nanoId = require('nano-id');
var router = express.Router();

//Schema
var Fakr = require('../models/fakr');

//Routes
router.get('/fakrs/:id', function (req, res) {
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
    })
});

router.post('/fakrs', function (req, res) {
    var reps = req.body.reps;
    var json = req.body.json;
    if (isEmpty(json)) {
        res.json({ message: 'Mercy ! Our servers cannot tolerate blank data.', data: null })
    }
    else {
        jBloat({ reps: reps, json: json }, function (err, data) {
            if (err) {
                console.log(err);
            }
            else {
                var fakr = new Fakr();
                fakr.unique_id = nanoId(13);
                fakr.timestamp = new Date().toString();
                fakr.data = data;
                fakr.save(function (err) {
                    if (err)
                        res.send(err);
                    res.json({ message: 'Item has been added.', data: fakr });
                })
            }
        });
    }
});

function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;
    
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0) return false;
    if (obj.length === 0) return true;
    
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    
    return true;
}

module.exports = router;