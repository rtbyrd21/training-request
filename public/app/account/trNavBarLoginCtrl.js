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