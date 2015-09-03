var chance = require('chance').Chance();

var photos = (function (chance) {
    chance.mixin({
        'image': function () {
            return {
                url: GetRandom(400, 200, "sports"),
                height: 400,
                width: 200,
                category: ""
            }
        }
    });
    var categories = {};
    categories.business = "business";

    var GetRandom = function (height, width, category) {
        var cat = categories[category] || "";
        return "http://lorempixel/" + height + "/" + width + "/" + categories[category];
    };
    
    return {
        GetRandom : GetRandom
    }

})(chance);
module.exports = photos;