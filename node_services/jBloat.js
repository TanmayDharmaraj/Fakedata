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
                var arr = new Array();
                data.map(function(element){
                    arr.push(element.data);
                });
                var response = {};
                response.data =arr;
                response.name = data[0].name;
                response.type_details = data[0].type_details;
                response.reps = data.length;
                callback(null, response);
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
                fakr.data = p_RandomizeObject(json);
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
                
        var myArray = new Array();
        Fakr.remove({ name: name },function(err, result){
            if(err){
                callback(err)
            }
            else{
                _New(args,function(err, data){
                    if(err){
                        callback(err)
                    }
                    else{
                        callback(null, data);
                    }
                })
            }
        })
    };
    
    return {
        New : _New,
        Update : _Update,
        Get: _Get
    }

})()

module.exports = jBloat