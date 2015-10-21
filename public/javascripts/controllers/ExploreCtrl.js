angular.module('ExploreCtrl', ['ngSanitize']).controller('ExploreController', ['$scope', '$http', function ($scope, $http) {
        var self = this;
        self.Fakes = [];
        
        $http.get('/api/v1/fakes?details=true').success(function (d) {
            var data = d.data;
            $.each(data, function (key, value) {
                self.Fakes.push({
                    name: value.name,
                    unique_id : value.unique_id,
                    timestamp : value.timestamp,
                    type_details : value.type_details,
                    data: JSON.stringify(value.data[0],undefined,4)
                });
            });
        })

    }]);