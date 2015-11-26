angular.module('ExploreItemCtrl', []).controller('ExploreItemController', ['$scope', '$http', '$routeParams', function ($scope, $http, $routeParams) {
        var self = this;
        self.user_json_data = "";
        var request = $http.get('/api/v1/fakes/' + $routeParams.id);
        request.success(function (result) {
            if (result) {
                //reset workspace to base view
                var arr = new Array();
                var response = result.data.data;
                response.map(function(element){
                    arr.push(element);
                })
                self.user_json_data = FakeData.Helper.SyntaxHiglight(JSON.stringify(arr, undefined, 4));
            }
        });
        request.error(function (err) {
            toastr.error('We couldn&apos;t find data related to that URL', 'Oops! :-(')
            console.log(err)
        });
    }]);