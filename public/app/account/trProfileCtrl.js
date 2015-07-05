
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