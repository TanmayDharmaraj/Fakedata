var FakeData = FakeData || {};

FakeData.PhotoService = (function (chance) {
    chance.mixin({
        'image': function () {
            return {
                url: GetRandom(400, 200, ""),
                height: 400,
                width: 200,
                category: ""
            }
        }
    });

    var GetRandom = function (height, width, category) {
        return "http://lorempixel/" + height + "/" + width + "/" + category;
    };
})(chance);