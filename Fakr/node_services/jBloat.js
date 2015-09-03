var chance = require('chance').Chance();
var Q = require('q');
var photoapi = require('../node_services/photos');
var common = require('../public/javascripts/services/common');

var jBloat = function (args, callback) {
    var json = args.json || null;
    var reps = args.reps || 0;
    var myArray = new Array();
    for (var i = 0; i < reps; i++) {
        myArray.push(p_RandomizeObject(JSON.parse(JSON.stringify(json))));
    }
    
    return Q.all(myArray).then(function (data) {
        callback(null, data);
    }).fail(function (e) {
        callback(e);
    })
    
    function p_RandomizeObject(json) {
        return Q.fcall(function () {
            for (var k in json) {
                var value = json[k];
                json[k] = common.Helper.Cases[value];
            }
            return json;
        });
    }
}
module.exports = jBloat;