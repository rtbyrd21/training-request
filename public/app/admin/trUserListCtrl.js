
angular.module('app').controller('trUserListCtrl', function($scope, trUser){
    $scope.users = trUser.query();

});