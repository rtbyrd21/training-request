angular.module('app', ['ngResource', 'ngRoute']);

angular.module('app').config(function($routeProvider, $locationProvider){

    var routeRoleChecks = {
        admin: {auth: function(trAuth){
            return trAuth.authorizeCurrentUserForRoute('admin');
        }},
        user: {auth: function(trAuth){
            return trAuth.authorizeAuthenticatedUserForRoute();
        }}
    }

    $locationProvider.html5Mode(true);
    $routeProvider
        .when('/', {
            templateUrl: 'partials/main/main',
            controller: 'trMainCtrl'
        })
    .when('/admin/users', {
        templateUrl: 'partials/admin/user-list',
        controller: 'trUserListCtrl',
        resolve: routeRoleChecks.admin
    })
        .when('/signup', {
            templateUrl: 'partials/account/signup',
            controller: 'trSignupCtrl'
        })
        .when('/profile', {
            templateUrl: 'partials/account/profile',
            controller: 'trProfileCtrl',
            resolve: routeRoleChecks.user
        })
        .when('/courses', {
            templateUrl: 'partials/courses/courses-list',
            controller: 'trCourseListCtrl'
        })
        .when('/courses/:id', {
            templateUrl: 'partials/courses/course-detail',
            controller: 'trCourseDetailCtrl'
        });

});


angular.module('app').run(function($rootScope, $location){
   $rootScope.$on('$routeChangeError', function(evt, current, previous, rejection){
       if(rejection === 'not authorized'){
           $location.path('/');
       }
   })
});