angular.module('ExploreCtrl', []).controller('ExploreController', ['$scope', '$http', function ($scope,$http) {
        $scope.message = 'Look! I am an about page.';
        $http.get('/api/v1/fakes').success(function (data) {
            self.DataTypes = data;
        })

    }]);