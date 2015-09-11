var express = require('express');
var jBloat = require('../node_services/jBloat.js');
var nanoId = require('nano-id');
var common = require('../public/javascripts/services/FakeData.CommonHelper');
//var logger = require('../node_services/logger');

var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 10/*seconds*/ });

var router = express.Router();
//Schema
var Fakr = require('../models/fakr');

function responder(res) {
    return function respond(err, data) {
        if (err) {
            var status = err.status || 500
            console.error(err);
            res.status(status).json({ error: { message: "Something went wrong.", timestamp: Date.now() }, data: null });

        } else {
            res.status(200).json({ error: null, data: data })
        }
    };
};

//A special route for shorter URLs
router.get('/fakes/:id', function (req, res) {
    
    var cacheKey = req.params.id;
    var details = req.query.details ? true : false;
    var selectFields = "";
    if (details)
        selectFields = "unique_id data type_details name timestamp -_id";
    else
        selectFields = "unique_id data name -_id";
    
    if (!nanoId.verify(cacheKey)) {
        res.status(500).json({ error: { message: 'Hey ! Seems like the ID you sent was invalid.', timestamp: Date.now() }, data: null });
        return;
    }
    memoryCache.wrap(cacheKey + "_" + details, function (cacheCallback) {
        Fakr.findOne({ unique_id: cacheKey }, selectFields, function (err, fakrs) {
            if (err) {
                console.error(err)
                cacheCallback(err);
            }
            else {
                if (!fakrs)
                    cacheCallback(null, "No data returned")
                else
                    cacheCallback(null, fakrs);
            }
        });
    }, { ttl: 20 }, responder(res));
});

router.route('/fakes').get(function (req, res) {
    var details = req.query.details ? true : false;
    var selectFields = "";
    if (details)
        selectFields = "unique_id data type_details timestamp name -_id";
    else
        selectFields = "unique_id data name -_id";
    
    memoryCache.wrap("allfakes_" + details, function (cacheCallback) {
        Fakr.find({}, selectFields, function (err, fakrs) {
            if (err) {
                console.error(err);
                cacheCallback(err);
            }
            else {
                if (!fakrs)
                    cacheCallback(null, "No data returned")
                else
                    cacheCallback(null, fakrs);
            }
            
        });
            
    }, responder(res));
}).post(function (req, res) {
    
    var reps = parseInt(req.body.reps) || 1;
    var name = req.body.name || "";
    var json = req.body.json;
    if (common.Helper.isEmpty(json)) {
        res.status(500).json({ error: { message: 'Mercy ! Our servers cannot tolerate blank data.', timestamp: Date.now() }, data: null });
        return;
    }
    else if (reps < 1 || reps > 500) {
        res.status(500).json({ error: { message: 'Sorry ! Our servers currently only allow a max of 500 repititions.', timestamp: Date.now() }, data: null });
        return;
    }
    else {
        jBloat({ reps: reps, json: json }, function (err, data) {
            if (err) {
                console.error(err);
                res.status(500).json({ error: { message: 'Failed to create json data.', timestamp: Date.now() }, data: null });
                return;
            }
            var fakr = new Fakr();
            fakr.unique_id = nanoId(13);
            fakr.timestamp = Date.now();
            fakr.data = data;
            fakr.type_details = json;
            fakr.name = name;
            fakr.save(function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: { message: 'Something went wrong while saving your data.', timestamp: Date.now() }, data: null });
                    return;
                }
                else {
                    res.status(201).json({ error: null, data: fakr });
                }
                
            })
        });
    }
}).put(function (req, res, next) {
    var reps = parseInt(req.body.reps) || 1;
    var json = req.body.json;
    var url = req.body.url;
    var name = req.body.name || "";
    
    if (!url || !reps || common.Helper.isEmpty(json)) {
        res.status(500).json({ error: { message: 'Mercy ! Our servers cannot tolerate blank data.', timestamp: Date.now() }, data: null });
        return;
    }
    else if (reps < 1 || reps > 500) {
        res.status(500).json({ error: { message: 'Sorry ! Our servers currently only allow a max of 500 repititions.', timestamp: Date.now() }, data: null });
        return;
    }
    else {
        var arr_uid = url.split('/');
        var uid = arr_uid[arr_uid.length - 1];
        
        if (!nanoId.verify(uid)) {
            res.status(500).json({ error: { message: 'Hey ! Seems like the ID you sent was invalid.', timestamp: Date.now() }, data: null });
            return;
        }
        jBloat({ reps: reps, json: json }, function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            var query = { unique_id: uid };
            
            var update = {
                timestamp: Date.now(),
                data : data,
                type_details: req.body.json,
                name : name
            };
            
            var options = {
                new : true
            };
            
            Fakr.findOneAndUpdate(query, update, options, function (err, x , r) {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: { message: 'Hey ! Seems like the ID you sent was invalid.', timestamp: Date.now() }, data: null });
                    return;
                }
                res.status(200).json({ error: null, data: r.value });
                return;
            });
        });
    }

});

module.exports = router;