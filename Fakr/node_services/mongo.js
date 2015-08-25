var mongoose = require('mongoose');
mongo_mogambo = function (host, port, database) {
    mongoose.connect("mongodb://" + host + ":" + port + "/" + database);
    this.Fakr = mongoose.model('Fakr', fakrSchema)
};

mongo_mogambo.prototype.Insert = function (data, callback) {
    var item = new this.Fakr(data);
    item.save(function (err, data) {
        if (err) {
            callback(err);
        }
        else {
            callback(null, data);
        }
    })
}

mongo_mogambo.prototype.FindAll = function (callback) {
    this.Fakr.find({}, function (err,result) {
        if (err) {
            callback(err);
        }
        else {
            callback(null,result)
        }
    });

}
module.exports.mongo_mogambo = mongo_mogambo;