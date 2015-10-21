
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        
        $routeProvider
		.when('/', {
            templateUrl : '/partials/home',
            controller  : 'MainController',
            controllerAs : 'main'
        })
		.when('/explore', {
            templateUrl : '/partials/explore',
            controller  : 'ExploreController',
            controllerAs : 'explore'
        })
        .when('/explore/:id', {
            templateUrl : '/partials/explore_item',
            controller : 'ExploreItemController',
            controllerAs : 'exploreItem'
        }).otherwise({
            redirectTo: '/'
        });
        
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

    }]);


