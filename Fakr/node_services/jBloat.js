var chance = require('chance').Chance();
var Q = require('q');

var jBloat = function (args,callback) {
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
        for (var k in json) {
            switch (json[k]) {
                case "INT":
                    json[k] = chance.natural({ min: 0, max: 1000 });
                    break;
                case "FLT":
                    json[k] = chance.floating();
                    break;
                case "FN":
                    json[k] = chance.first();
                    break;
                case "LN":
                    json[k] = chance.last();
                    break;
                case "GDR":
                    json[k] = chance.gender();
                    break;
                case "BD":
                    json[k] = chance.birthday();
                    break;
                case "PHN":
                    json[k] = chance.phone();
                    break;
                case "ZIP":
                    json[k] = chance.zip();
                    break;
                case "WRD":
                    json[k] = chance.word();
                    break;
                case "PARA":
                    json[k] = chance.paragraph();
                    break;
                case "CORD":
                    json[k] = chance.coordinates({ fixed: 2 });
                    break;
            }
        }
        return json;
    }
}
module.exports = jBloat;