var common = require('../public/javascripts/services/FakeData.CommonHelper');
var Fakr = require('../models/fakr');
var nonoID = require('nano-id');

var jBloat = (function () {
    
    var p_RandomizeObject = function (json) {
        var temp = {};
        
        for (var k in json) {
            temp[k] = common.Helper.Cases[json[k]]();
        }
        return temp;
    };
    
    var _Get = function (args, callback) {
        Fakr.find(args.query, args.projection).lean().exec(function (err, data) {
            if (err) {
                callback(err);
            }
            else {
                callback(null, data);
            }
        });
    
    };
    
    var _New = function (args, callback) {
        try {
            var json = args.json || null;
            var reps = args.reps || 0;
            var name = args.name || "";
            
            var myArray = new Array();
            
            for (var i = 0; i < reps; i++) {
                var fakr = {};
                fakr.data = RandomizeObject(json);
                fakr.type_details = json;
                fakr.name = name;
                myArray.push(fakr);
            }
            
            Fakr.collection.insert(myArray, function (err, result) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, result);
                }
            });
        }
        catch (err) {
            callback(err);
        }
    };
    
    var _Update = function (args, callback) {
        var json = args.json || null;
        var reps = args.reps || 0;
        var name = args.name || "";
        var uid = args.uid || "";
        
        var bulk = Fakr.collection.initializeOrderedBulkOp();
        
        var myArray = new Array();
        Fakr.find({ unique_id: uid }).lean().exec(function (err, data) {
            if (err) {
                callback(err);
            }
            else {
                for (var i = 0; i < reps; i++) {
                    myArray.push(RandomizeObject(json));
                }
                for (var i = 0; i < data.length; i++) {
                    bulk.find({ _id: data[i]._id }).updateOne({ $set: { data: myArray[i], type_details: json, name: name } });
                }
                
                bulk.execute(function (err, data) {
                    if (err) {
                        callback(err)
                    }
                    else {
                        callback(null, data);
                    }
                });
            }
        });
    };
    
    return {
        New : _New,
        Update : _Update,
        Get: _Get
    }

})()

module.exports = jBloat