var express = require('express');
var jBloat = require('../node_services/jBloat.js');
var common = require('../public/javascripts/services/FakeData.CommonHelper');
var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 10/*seconds*/ });
var Fakr = require('../models/fakr');
var router = express.Router();

//abstracted responder for cached requests
function responder(res) {
    return function respond(err, data) {
        if (err) {
            var status = err.status || 500
            console.error(err);
            res.status(status).json({ error: { message: "Something went wrong.", timestamp: Date.now(), info: err }, data: data });
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
                cacheCallback(err);
            }
            else if (common.Helper.isEmpty(data)) {
                
                cacheCallback({ status: 500, message: "No data returned" }, null)
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
                cacheCallback(err);
            }
            else {
                if (common.Helper.isEmpty(fakrs)){
                    cacheCallback({ status: 500, message: "No data returned" }, null)
                }
                else{
                    cacheCallback(null,fakrs)
                }  
            }       
        });    
    }, responder(res));
}).post(function (req, res) {    
    var reps = parseInt(req.body.reps) || null;
    if(reps == null){
        var resp = responder(res);
        resp({ status: 403, message: 'Invalid Repititions' },null);
    }
    var name = req.body.name || "";
    name = name.toLowerCase();
    var json = req.body.json;
    if (common.Helper.isEmpty(json)) {
        var resp = responder(res);
        resp({ status: 500, message: 'Mercy ! Our servers cannot tolerate blank data.' }, null);
        return;
    }
    else if (reps < 1 || reps > 100000) {
        var resp = responder(res);
        resp({ status: 500, message: 'Sorry ! Our servers currently only allow a maximum of 100,000 repititions.' },null);
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
                var resp = responder(res);
                resp({status:500,message:'Unknown Error'}, null);
            }
            if(common.Helper.isEmpty(result)){
                jBloat.New({ reps: reps, json: json, name: name }, function (err, result) {
                    if (err) {
                        var resp = responder(res);
                        resp({status:500,message:'Unknown Error'}, null);
                    }
                    else {
                        var resp = responder(res);
                        resp(null, {insertedCount : result.insertedCount});
                    }
                });        
            }
            else{
                var resp = responder(res);
                resp({status:403,message:'A resource with the same already exists. Please use a different name.'}, result );
            }       
        });
    }
}).put(function (req, res, next) {
    var reps = parseInt(req.body.reps) || 1;
    var json = req.body.json;
    var url = req.body.url;
    var name = req.body.name || "";
    
    if (!url || !reps || common.Helper.isEmpty(json)) {
        var resp = responder(res);
        resp({status:500,message:'Mercy ! Our servers cannot tolerate blank data.'}, null);
        return;
    }
    else if (reps < 1 || reps > 100000) {
        var resp = responder(res);
        resp({status:500,message:'Sorry ! Our servers currently only allow a maximum of 100,000 repititions.'}, null);
        return;
    }
    else {
        jBloat.Update({ reps: reps, json: json, name: name }, function (err, result) {
            if (err) {
                var resp = responder(res);
                resp({status:500,message: "Unknown Error"}, null);
            }
            else {
                var resp = responder(res);
                resp(null, {insertedCount : result.insertedCount});
            }
        });
    }
});

module.exports = router;