var express = require('express');
var router = express.Router();
var cacheManager = require('cache-manager');
var memoryCache = cacheManager.caching({ store: 'memory', max: 100, ttl: 10/*seconds*/ });

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
//Data Types
router.get('/data-types', function (req, res) {
    memoryCache.wrap('data-types', function (cacheCallback) {
        
        var data = [
           { DataType: "Integer", Symbol: "INT" },
           { DataType: "Float", Symbol: "FLT" },
           { DataType: "First Name", Symbol: "FN" },
           { DataType: "Boolean", Symbol: "BOOL" },
           { DataType: "Last Name", Symbol: "LN" },
           { DataType: "Gender", Symbol: "GDR" },
           { DataType: "Birthday", Symbol: "BD" },
           { DataType: "Phone", Symbol: "PHN" },
           { DataType: "Zip", Symbol: "ZIP" },
           { DataType: "Word", Symbol: "WRD" },
           { DataType: "Paragraph", Symbol: "PARA" },
           { DataType: "Coordinates", Symbol: "CORD" },
           { DataType: "Image (400x200)", Symbol: "IMG" }
        ];
        cacheCallback(null, data);

    }, responder(res));
});

module.exports = router;