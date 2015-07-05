
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