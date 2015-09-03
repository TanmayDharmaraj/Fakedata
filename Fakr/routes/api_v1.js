var express = require('express');
var jBloat = require('../node_services/jBloat.js');
var nanoId = require('nano-id');
var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 10/*seconds*/ });
var router = express.Router();
var photoapi = require('../node_services/photos');

//Schema
var Fakr = require('../models/fakr');

function responder(res) {
    return function respond(err, data) {
        if (err) {
            var status = err.status || 500
            res.status(status).json({ error: "Something went wrong.", data: null });
        } else {
            res.status(200).json({ error: null, data: data })
        }
    };
};

//A special route for shorter URLs
router.get('/fakes/:id', function (req, res) {
    var cacheKey = req.params.id;
    memoryCache.wrap(cacheKey, function (cacheCallback) {
        Fakr.findOne({ unique_id: req.params.id }, function (err, fakrs) {
            if (err) {
                cacheCallback(err);
            }
            else {
                cacheCallback(null, fakrs.data);
            }
        })
    }, { ttl: 20 }, responder(res));
});

router.route('/fakes').get(function (req, res) {
    var data_type = req.query.data_type;
    var url = req.query.url;
    if (isEmpty(data_type) || isEmpty(url)) {
        res.json({ message: 'You either forgot to add url or data_types as a querystring parameter.', data: null });
    }
    else {
        var arr_url = url.split('/');
        var uniqueid = arr_url[arr_url.length - 1];
        memoryCache.wrap(uniqueid, function (cacheCallback) {
            Fakr.findOne({ unique_id: uniqueid }, function (err, fakrs) {
                if (err) {
                    cacheCallback(err, null);
                }
                else {
                    cacheCallback(null, fakrs.type_details);
                }
            
            });
            
        }, responder(res));
    }
}).post(function (req, res) {
    
    var reps = parseInt(req.body.reps) || 1;
    var json = req.body.json;
    if (isEmpty(json)) {
        res.json({ message: 'Mercy ! Our servers cannot tolerate blank data.', data: null })
    }
    else if (reps < 1 || reps > 500) {
        res.json({ message: 'Sorry ! Our servers currently only allow a max of 500 repititions.', data: null })
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
}).put(function (req, res,next) {
    var reps = parseInt(req.body.reps) || 1;
    var json = req.body.json;
    var url = req.body.url;
    
   if (!url || !reps || isEmpty(json)) {
        res.json({ message: 'Mercy ! Our servers cannot tolerate blank data.', data: null });
    }
    else if (reps < 1 || reps > 500) {
        res.json({ message: 'Sorry ! Our servers currently only allow a max of 500 repititions.', data: null })
    }
    else {
        var arr_uid = url.split('/');
        var uid = arr_uid[arr_uid.length - 1];
        
        if (!nanoId.verify(uid)) {
            res.json({ message: 'Hey ! Seems like the ID you sent was invalid.', data: null });
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
            
            Fakr.findOneAndUpdate(query, update, options, function (err, x , r) {
                if (err) {
                    res.send(err);
                }
                res.json({ message: 'Item has been updated.', data: r.value });
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