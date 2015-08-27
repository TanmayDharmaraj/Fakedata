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

router.route('/fakrs').get(function (req, res) {
    var data_type = req.query.data_type;
    var url = req.query.url;
    if (isEmpty(data_type) || isEmpty(url)) res.json({ message: 'Mercy ! Our servers cannot tolerate blank data.', data: null });
    
    if (data_type && url) {
        var arr_url = url.split('/');
        var uniqueid = arr_url[arr_url.length - 1];
        Fakr.findOne({ unique_id: uniqueid }, function (err, fakrs) {
            if (err) {
                res.send(err);
                return;
            }
            if (fakrs && fakrs.type_details) {
                res.json(fakrs.type_details);
            }
            else {
                res.json({ message: 'No data returned for the given id', data: null })
            }
        })
    }


}).post(function (req, res) {
    var reps = req.body.reps;
    var json = req.body.json;
    if (isEmpty(json)) {
        res.json({ message: 'Mercy ! Our servers cannot tolerate blank data.', data: null })
    }
    else {
        jBloat({ reps: reps, json: json }, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            var fakr = new Fakr();
            fakr.unique_id = nanoId(13);
            fakr.timestamp = new Date().toString();
            fakr.data = data;
            fakr.type_details = req.body.json;
            fakr.save(function (err) {
                if (err)
                    res.send(err);
                res.json({ message: 'Item has been added.', data: fakr });
            })
        });
    }
}).put(function (req, res) {
    var reps = req.body.reps;
    var json = req.body.json;
    var url = req.body.url
    
    if (!url || !reps || !json) {
        res.json({ message: 'Mercy ! Our servers cannot tolerate blank data.', data: null });
    }
    else {
        var arr_uid = url.split('/');
        var uid = arr_uid[arr_uid.length - 1];
        
        if (!nanoId.verify(uid)) {
            res.json({ message:'Hey ! Did you send the correct ID ?', data: null });
        }
        jBloat({ reps: reps, json: json }, function (err, data) {
            if (err) {
                console.log(err);
                return;
            }
            var query = { unique_id: uid };
            
            var update = {
                timestamp: new Date().toString(),
                data : data,
                type_details: req.body.json
            };
            
            var options = {
                new : true
            };

            Fakr.findOneAndUpdate(query, update, options, function (err, x ,r) {
                if (err) {
                    res.send(err);
                }   
                res.json({ message: 'Item has been added.', data: r.value });
            });
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