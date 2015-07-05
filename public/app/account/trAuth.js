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