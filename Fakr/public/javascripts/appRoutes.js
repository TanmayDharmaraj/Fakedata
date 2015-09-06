
angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
        
        $routeProvider

		// home page
		.when('/', {
            templateUrl : 'partials/home',
            controller  : 'MainController',
            controllerAs : 'main'
        })

		.when('/explore', {
            templateUrl : 'partials/explore',
            controller  : 'ExploreController',
            controllerAs : 'explore'
        });
        
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

    }]);


