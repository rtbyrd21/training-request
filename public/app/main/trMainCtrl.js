
angular.module('app').controller('trMainCtrl', function($scope, trCachedCourses){

    $scope.courses = trCachedCourses.query();

});