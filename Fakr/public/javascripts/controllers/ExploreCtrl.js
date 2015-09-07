angular.module('ExploreCtrl', []).controller('ExploreController', ['$scope', '$http', function ($scope,$http) {
        var self = this;
        self.Fakes = [];
        $scope.message = 'Look! I am an about page.';
        $http.get('/api/v1/fakes').success(function (d) {
            self.Fakes = d.data;
            console.log(data)
        })

    }]);