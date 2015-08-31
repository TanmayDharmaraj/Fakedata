var FakeData = FakeData || {};
FakeData.JsonService = (function () {
    var MakeJSON = function (data, options) {
        var dt = options.DataType == true ? true : false;
        var filteredArray = {};
        
        if (dt == false) {
            ko.utils.arrayForEach(data, function (item) {
                if (item.Key.trim() != "" && item.Key != 'undefined') {
                    var val = null;
                    switch (item.DataType.Symbol) {
                        case "INT":
                            val = chance.natural({ min: 0, max: 1000 });
                            break;
                        case "FLT":
                            val = chance.floating();
                            break;
                        case "BOOL":
                            val = chance.bool();
                            break;
                        case "FN":
                            val = chance.first();
                            break;
                        case "LN":
                            val = chance.last();
                            break;
                        case "GDR":
                            val = chance.gender();
                            break;
                        case "BD":
                            val = chance.birthday();
                            break;
                        case "PHN":
                            val = chance.phone();
                            break;
                        case "ZIP":
                            val = chance.zip();
                            break;
                        case "WRD":
                            val = chance.word();
                            break;
                        case "PARA":
                            val = chance.paragraph();
                            break;
                        case "CORD":
                            val = chance.coordinates({ fixed: 2 });
                            break;
                    }
                    filteredArray[item.Key.trim()] = val;
                }
            });
        } else {
            ko.utils.arrayForEach(data, function (item) {
                if (item.Key.trim() != "" && item.Key != 'undefined') {
                    filteredArray[item.Key.trim()] = item.DataType.Symbol;
                }
            });
        }
        return filteredArray
    };

    return {
        MakeJSON: MakeJSON
    }
})();