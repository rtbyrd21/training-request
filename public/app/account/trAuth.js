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
       }
   }
});