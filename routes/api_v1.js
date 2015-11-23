var express = require('express');
var jBloat = require('../node_services/jBloat.js');
var nanoId = require('nano-id');
var common = require('../public/javascripts/services/FakeData.CommonHelper');
var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 10/*seconds*/ });
//Schema
var Fakr = require('../models/fakr');

var router = express.Router();

//abstracted responder for cached requests
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
router.get('/fakes/:name', function (req, res) {
    var cacheKey = req.params.name;
    cacheKey = cacheKey.toLowerCase();
    var details = req.query.details ? true : false;
    
    memoryCache.wrap(cacheKey + "_" + details, function (cacheCallback) {
        var selectFields = "";
        if (details)
            selectFields = "data type_details name -_id";
        else
            selectFields = "data name -_id";

        var options = {
            query : { name: cacheKey },
            projection : selectFields
        }

        jBloat.Get(options, function (err, data) {
            if (err) {
                console.error(err)
                cacheCallback(err);
            }
            else if (!data) {
                cacheCallback(null, "No data returned")
            }
            else {
                cacheCallback(null, data);
            }
        })
       
    }, { ttl: 20 }, responder(res));
});

router.route('/fakes').get(function (req, res) {
   
    var details = req.query.details ? true : false;
    var selectFields = "";
    if (details)
        selectFields = "data type_details name -_id";
    else
        selectFields = "data name -_id";
    
    memoryCache.wrap("allfakes_" + details, function (cacheCallback) {
        Fakr.aggregate([
            { $group:{
                    _id: "$name",
                    name: {$first: "$name"},
                    data: {$first: "$data"},
                    type_details: {$first: "$type_details"}
                }
            },
            { $project: { _id: 0, type_details: 1, name:1, data: 1 } }
        ],function(err, fakrs){
            if (err) {
                console.error(err); 
                cacheCallback(err);
            }
            else {
                if (!fakrs){
                    cacheCallback(null, "No data returned")
                }
                else{
                    cacheCallback(null,fakrs)
                }  
            }       
        });    
    }, responder(res));
}).post(function (req, res) {
    
    var reps = parseInt(req.body.reps) || 1;
    var name = req.body.name || "";
    name = name.toLowerCase();
    var json = req.body.json;
    if (common.Helper.isEmpty(json)) {
        res.status(500).json({ error: { message: 'Mercy ! Our servers cannot tolerate blank data.', timestamp: Date.now() }, data: null });
        return;
    }
    else if (reps < 1 || reps > 100000) {
        res.status(500).json({ error: { message: 'Sorry ! Our servers currently only allow a maximum of 100,000 repititions.', timestamp: Date.now() }, data: null });
        return;
    }
    else {
        var selectFields = "data name -_id";

        var options = {
            query : { name: name },
            projection : selectFields
        }

        jBloat.Get(options,function(err, result){
            if(err){
                console.error(err);
                res.status(500).json({error:{message: 'Something went wrong.',timestamp: Date.now() }, data: null })
            }
            if(common.Helper.isEmpty(result)){
                jBloat.New({ reps: reps, json: json, name: name }, function (err, result) {
                    if (err) {
                        console.error(err);
                        res.status(500).json({error:{message: 'Something went wrong.',timestamp: Date.now() }, data: null })
                    }
                    else {
                        res.status(200).json({ error: null, data: result.insertedCount + " values inserted",result: result });
                    }
                });        
            }
            else{
                res.status(403).json({error: {message:'A resource with the same already exists. Please use a different name.',timestamp:Date.now()},data:result})
            }       
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
    else if (reps < 1 || reps > 100000) {
        res.status(500).json({ error: { message: 'Sorry ! Our servers currently only allow a maximum of 100,000 repititions.', timestamp: Date.now() }, data: null });
        return;
    }
    else {
        var arr_uid = url.split('/');
        var uid = arr_uid[arr_uid.length - 1];
        
        if (!nanoId.verify(uid)) {
            res.status(500).json({ error: { message: 'Hey ! Seems like the ID you sent was invalid.', timestamp: Date.now() }, data: null });
            return;
        }
        
        jBloat.Update({ reps: reps, json: json, name: name, uid: uid }, function (err, result) {
            if (err) {
                console.log(err)
            }
            else {
                res.status(200).json({ error: null, data: result });
            }
        });
    }
});

module.exports = router;