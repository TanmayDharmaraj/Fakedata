var FakeData = FakeData || {};
FakeData.JsonService = (function () {
    
    var MakeJSON = function (data, options) {
        var dt = options.DataType == true ? true : false;
        var filteredArray = {};
        
        if (dt == false) {
           $.each(data, function (index, item) {
                if (item.Key.trim() != "" && item.Key != 'undefined') {
                    var val = FakeData.Helper.Cases[item.DataType.Symbol]();
                    filteredArray[item.Key.trim()] = val;
                }
            });
        } else {
           $.each(data, function (index, item) {
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