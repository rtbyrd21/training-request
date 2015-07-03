
angular.module('app').factory('trUser', function($resource){
    var UserResource = $resource('/api/users', {_id: "@id"});

    UserResource.prototype.isAdmin = function(){
        return this.roles && this.roles.indexOf('admin') > -1;
    }
    return UserResource;
});