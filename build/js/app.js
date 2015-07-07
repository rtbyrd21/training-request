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
angular.module('app').factory('trAuth', function($http, trIdentity, trUser, $q){
   return{
       authenticateUser: function (username, password) {
           var dfd = $q.defer();
           $http.post('/login', {username:username, password:password})
               .then(function(response){
                   if(response.data.success){
                       var user = new trUser();
                       angular.extend(user, response.data.user);
                       trIdentity.currentUser = user;
                       dfd.resolve(true);
                   }else{
                       dfd.resolve(false);
                   }
               });
           return dfd.promise;
       },

       createUser: function(newUserData){
            var newUser = new trUser(newUserData);
            var dfd = $q.defer();

           newUser.$save().then(function(){
               trIdentity.currentUser = newUser;
               dfd.resolve();
           }, function(response){
               dfd.reject(response.data.reason);
           });

           return dfd.promise;
       },
        
       updateCurrentUser: function (newUserData) {
            var dfd = $q.defer();
           var clone = angular.copy(trIdentity.currentUser);
            angular.extend(clone, newUserData);
           clone.$update().then(function(){
                trIdentity.currentUser = clone;
                dfd.resolve();
           }, function(response){
                dfd.reject(response.data.reason);
               });
           return dfd.promise;
       },
       
       logoutUser: function () {
           var dfd = $q.defer();
            $http.post('/logout', {logout:true})
                .then(function(){
                    trIdentity.currentUser = undefined;
                    dfd.resolve();
            });
           return dfd.promise;
       },
       authorizeCurrentUserForRoute: function(role){
           if(trIdentity.isAuthorized(role)){
               return true;
           }else{
               return $q.reject('not authorized');
           }
       },
       authorizeAuthenticatedUserForRoute: function(){
           if(trIdentity.isAuthenticated()){
               return true;
           } else {
               return $q.reject('not authorized');
           }
       }
   }
});
angular.module('app').factory('trIdentity', function($window, trUser){
   var currentUser;
    if(!!window.bootstrappedUserObject){
        currentUser = new trUser();
        angular.extend(currentUser, $window.bootstrappedUserObject);
    }
   return{
       currentUser: currentUser,
       isAuthenticated: function(){
           return !!this.currentUser;
       },
       isAuthorized: function(role){
            return !!this.currentUser && !!this.currentUser.roles.indexOf('role') > -1;
       }
   }
});
angular.module('app').controller('trNavBarLoginCtrl', function($scope, $http, $location, trAuth, trNotifier, trIdentity){
    $scope.identity = trIdentity;
    $scope.signin = function(username, password){
        trAuth.authenticateUser(username, password)
            .then(function(success){
                if(success){
                    trNotifier.notify('logged in');
                }else{
                    trNotifier.notify('incorrect username/password');
                }
            });
    }

    $scope.signout = function(){
        trAuth.logoutUser().then(function(){
            $scope.username = "";
            $scope.password = "";
            trNotifier.notify('You are now logged out');
            $location.path('/');
        })
    }

});

angular.module('app').controller('trProfileCtrl', function($scope, trAuth, trIdentity, trNotifier){
    $scope.email = trIdentity.currentUser.userName;
    $scope.fname = trIdentity.currentUser.firstName;
    $scope.lname = trIdentity.currentUser.lastName;

    $scope.update = function(){
        var newUserData = {
            username: $scope.email,
            firstName: $scope.fname,
            lastName: $scope.lname
        }
        if($scope.password && $scope.password.length > 0){
            newUserData.password = $scope.password;
        }

        trAuth.updateCurrentUser(newUserData).then(function(){
            trNotifier.notify('Your user account has been updated');
        }, function(reason){
            trNotifier.error(reason);
        })
    }
})

angular.module('app').controller('trSignupCtrl', function($scope, trUser, trNotifier, $location, trAuth){
    $scope.signup = function(){
        var newUserData = {
            userName: $scope.email,
            password: $scope.password,
            firstName: $scope.fname,
            lastName: $scope.lname
        };

        trAuth.createUser(newUserData).then(function(){
            trNotifier.notify('User account created');
            $location.path('/');
        }, function(reason){
            trNotifier.error(reason);
        })
    }
});

angular.module('app').factory('trUser', function($resource){
    var UserResource = $resource('/api/users', {_id: "@id"}, {
        update: {method:'PUT', isArray:false}
    });

    UserResource.prototype.isAdmin = function(){
        return this.roles && this.roles.indexOf('admin') > -1;
    }
    return UserResource;
});

angular.module('app').controller('trUserListCtrl', function($scope, trUser){
    $scope.users = trUser.query();

});
angular.module('app').value('trToastr', toastr);

angular.module('app').factory('trNotifier', function(trToastr){
   return{
       notify: function(msg){
           trToastr.success(msg);
           console.log(msg);
       },
       error: function(msg){
           trToastr.error(msg);
           console.log(msg);
       }
   }
});
angular.module('app').factory('trCachedCourses', function(trCourse){
    var courseList;

    return{
        query: function(){
            if(!courseList){
                courseList = trCourse.query();
            }

            return courseList;
        }
    }
})
angular.module('app').factory('trCourse', function($resource){
    var CourseResource = $resource('/api/courses/:_id', {_id: "@id"}, {
        update: {method:'PUT', isArray:false}
    });
    return CourseResource;
});
angular.module('app').controller('trCourseDetailCtrl', function($scope, trCachedCourses, $routeParams){
    trCachedCourses.query().$promise.then(function (collection) {
        collection.forEach(function(course){
            if(course._id === $routeParams.id){
                $scope.course = course;
            }
        })

    })
});

angular.module('app').controller('trCourseListCtrl', function($scope, trCachedCourses){
    $scope.courses = trCachedCourses.query();

    $scope.sortOptions = [{value:"title", text:"Sort by Title"},
        {value: "published", text:"Sort by Publish Date"}];

    $scope.sortOrder = $scope.sortOptions[0].value;

})

angular.module('app').controller('trMainCtrl', function($scope, trCachedCourses){

    $scope.courses = trCachedCourses.query();

});
angular.module("app").run(["$templateCache", function($templateCache) {$templateCache.put("partials/account/navbar-login","<div ng-controller=trNavBarLoginCtrl class=navbar-right><form ng-hide=identity.isAuthenticated() class=navbar-form><ul class=\"nav navbar-nav\"><li><a href=/signup>Sign Up</a></li></ul><div class=form-group><input placeholder=email ng-model=username class=form-control></div><div class=form-group><input type=password placeholder=Password ng-model=password class=form-group></div><button ng-click=\"signin(username, password)\" class=\"btn btn-primary\">Sign In</button></form><ul ng-show=identity.isAuthenticated() class=\"nav navbar-nav navbar-right\"><li class=dropdown><a href data-toggle=dropdown class=dropdown-toggle>{{identity.currentUser.firstName + \" \" + identity.currentUser.lastName}}<b class=caret></b></a><ul class=dropdown-menu><li ng-show=identity.currentUser.isAdmin()><a href=/admin/users>User Admin</a></li><li><a href=/profile>Profile</a></li><li><a href ng-click=signout()>Sign Out</a></li></ul></li></ul></div>");
$templateCache.put("partials/account/profile","<div class=container><div class=well><form name=profileForm class=form-horizontal><fieldset><legend>User Profile</legend><div class=form-group><label for=email class=\"col-md-2 control-label\">Email</label><div class=col-md-10><input name=email type=email placeholder=Email ng-model=email required class=form-control></div></div><div class=form-group><label for=fname class=\"col-md-2 control-label\">First Name</label><div class=col-md-10><input name=fname type=text placeholder=\"First Name\" ng-model=fname required class=form-control></div></div><div class=form-group><label for=lname class=\"col-md-2 control-label\">Last Name</label><div class=col-md-10><input name=lname type=text placeholder=\"Last Name\" ng-model=lname required class=form-control></div></div><div class=form-group><label for=password class=\"col-md-2 control-label\">Password</label><div class=col-md-10><input name=password type=password placeholder=Password ng-model=password class=form-control></div></div><div class=form-group><div class=\"col-md-10 col-md-offset-2\"><div class=pull-right><button ng-click=update() ng-disabled=signupForm.$invalid class=\"btn btn-primary\">Submit</button>&nbsp;<a href=\"/\" class=\"btn btn-default\">Cancel</a></div></div></div></fieldset></form></div></div>");
$templateCache.put("partials/account/signup","<div class=container><div class=well><form name=signupForm class=form-horizontal><fieldset><legend>New User Information</legend><div class=form-group><label for=email class=\"col-md-2 control-label\">Email</label><div class=col-md-10><input name=email type=email placeholder=Email ng-model=email required class=form-control></div></div><div class=form-group><label for=password class=\"col-md-2 control-label\">Password</label><div class=col-md-10><input name=password type=password placeholder=Password ng-model=password required class=form-control></div></div><div class=form-group><label for=fname class=\"col-md-2 control-label\">First Name</label><div class=col-md-10><input name=fname type=text placeholder=\"First Name\" ng-model=fname required class=form-control></div></div><div class=form-group><label for=lname class=\"col-md-2 control-label\">Last Name</label><div class=col-md-10><input name=lname type=text placeholder=\"Last Name\" ng-model=lname required class=form-control></div></div><div class=form-group><div class=\"col-md-10 col-md-offset-2\"><div class=pull-right><button ng-click=signup() ng-disabled=signupForm.$invalid class=\"btn btn-primary\">Submit</button>&nbsp;<a href=\"/\" class=\"btn btn-default\">Cancel</a></div></div></div></fieldset></form></div></div>");
$templateCache.put("partials/admin/user-list","<div class=container><table class=table><tr ng-repeat=\"user in users\"><td>{{user.firstName + \' \' + user.lastName}}</td></tr></table></div>");
$templateCache.put("partials/courses/course-detail","<div class=container><h1>{{course.title}}</h1><div class=row><div class=col-md-6><h3 ng-show=course.featured>Featured</h3><h3>Published on {{course.published | date }}</h3></div><div class=col-md-6><div class=\"panel panel-primary\"><div class=panel-heading>Tags</div><div class=panel-body><div ng-repeat=\"tag in course.tags\">{{tag}}</div></div></div></div></div></div>");
$templateCache.put("partials/courses/courses-list","<div class=\"container top-padding-med\"><div class=pull-right><form class=form-inline><div class=form-group><input ng-model=searchText placeholder=Filter class=form-control></div><div class=\"form-group margin-left-med\"><select ng-model=sortOrder ng-options=\"item.value as item.text for item in sortOptions\" class=form-control></select></div></form></div><table class=\"table table-hover table-striped table-condensed\"><thead><tr><th>Title</th><th>Publish Date</th></tr><tbody><tr ng-repeat=\"course in courses | filter:searchText | orderBy:sortOrder\"><td><a href=courses/{{course._id}}>{{course.title}}</a></td><td>{{course.published | date}}</td></tr></tbody></thead></table></div>");
$templateCache.put("partials/main/featured-courses","<div class=\"panel panel-primary\"><div class=\"panel-heading text-center\">Featured Courses</div><div class=panel-body><div ng-repeat=\"course in courses | filter:{featured:true}\" class=row><div class=col-md-12><a href=courses/{{course._id}}>{{course.title}}</a></div></div></div></div>");
$templateCache.put("partials/main/main","<div class=container><div class=jumbotron><h1>Training Request</h1><p>Welcome!!!!</p></div><div class=row><div class=col-md-6><div ng-include=\"\'/partials/main/featured-courses\'\"></div></div><div class=col-md-6><div ng-include=\"\'/partials/main/new-courses\'\"></div></div></div></div>");
$templateCache.put("partials/main/new-courses","<div class=\"panel panel-primary\"><div class=\"panel-heading text-center\">New Courses</div><div class=panel-body><div ng-repeat=\"course in courses | orderBy:\'published\':true | limitTo:10\" class=row><div class=col-md-3>{{course.published | date:\'MMM d\'}}</div><div class=col-md-9><a href=courses/{{course._id}}>{{course.title}}</a></div></div></div></div>");}]);