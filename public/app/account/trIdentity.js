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