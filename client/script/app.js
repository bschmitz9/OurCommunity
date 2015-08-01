var app = angular.module('app', ['ngRoute', 'LocalStorageModule', 'ngMap']);

angular.module('app').config(function ($routeProvider){
    $routeProvider
    .when('/', {
        templateUrl: 'partials/signup.html'
    })
    .when('/signin', {
        templateUrl: 'partials/signin.html'
    })
    .when('/signup2', {
        templateUrl: 'partials/signup2.html'
    })
    .when('/confirm_community', {
        templateUrl: 'partials/confirm_comm.html'
    })
    .when('/community', {
        templateUrl: 'partials/community_profile.html'
    })
    .when('/community/:id', {
        templateUrl: 'partials/community_profile.html'
    })
    .otherwise({
        redirectTo: '/'
    });
});






